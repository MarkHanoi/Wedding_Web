// ---------------------------------------------------------------------------
// stripe.ts — Stripe Checkout and webhook route handlers
//
// POST /api/stripe/checkout-session  — Create enrollment checkout session
// POST /api/stripe/webhook           — Stripe webhook endpoint
//
// The webhook handler MUST receive the raw request body for Stripe signature
// verification. app.ts saves req.rawBody via the express.json() verify callback
// (see IMPORTANT comment there). Do not add express.json() middleware to these
// routes — it would consume req.rawBody before the handler runs.
//
// Both routes degrade gracefully when Stripe is not configured:
//   checkout-session → 503 with a clear human-readable message
//   webhook          → 200 (Stripe must receive 2xx or it retries indefinitely)
// ---------------------------------------------------------------------------

import { Router } from "express";
import { z } from "zod";
import {
  isStripeEnabled,
  createCheckoutSession,
  constructWebhookEvent,
} from "../lib/stripe";
import { applicationStore, applicationByToken } from "./apply";
import {
  sendEnrollmentConfirmation,
  sendEnrollmentNotificationToAdmissions,
} from "../lib/email";
import { recordError } from "../lib/alerting";

const router = Router();

// ---------------------------------------------------------------------------
// POST /api/stripe/checkout-session
//
// Creates a Stripe Checkout session for an accepted applicant.
//
// Request body: { statusToken: string }
//   statusToken — the opaque portal token from POST /api/apply (in email, in
//                 portal URL). This identifies the applicant without exposing
//                 their internal applicationId in browser URLs.
//
// Response: { url: string }
//   The browser should redirect to `url` — this is the Stripe-hosted checkout
//   page. On success Stripe redirects back to /api/apply/portal?payment=success.
// ---------------------------------------------------------------------------
const CheckoutRequestSchema = z.object({
  statusToken: z.string().min(1).max(500),
});

router.post("/stripe/checkout-session", async (req, res) => {
  if (!isStripeEnabled()) {
    res.status(503).json({
      error: "payment_not_configured",
      message:
        "Payment processing is not enabled. Contact the admissions team to complete enrollment.",
    });
    return;
  }

  const parsed = CheckoutRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "validation_error",
      message: "statusToken is required",
    });
    return;
  }

  const { statusToken } = parsed.data;
  const applicationId = applicationByToken.get(statusToken);
  if (!applicationId) {
    res.status(404).json({
      error: "not_found",
      message: "Application not found. Check your portal link.",
    });
    return;
  }

  const record = applicationStore.get(applicationId);
  if (!record) {
    res.status(404).json({ error: "not_found", message: "Application record not found." });
    return;
  }

  if (record.admissionsStatus === "enrolled") {
    res.status(409).json({
      error: "already_enrolled",
      message: "This application has already been enrolled. No further payment is needed.",
    });
    return;
  }

  if (record.admissionsStatus !== "accepted") {
    res.status(409).json({
      error: "invalid_status",
      message: "Enrollment payment is only available for accepted applications.",
    });
    return;
  }

  try {
    const session = await createCheckoutSession(applicationId, statusToken, record.email);

    if (!session) {
      res.status(503).json({
        error: "stripe_unavailable",
        message: "Payment service unavailable. Contact the admissions team.",
      });
      return;
    }

    req.log.info({ applicationId }, "Stripe checkout session created for enrollment");
    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err, applicationId }, "Failed to create Stripe checkout session");
    recordError("server");
    res.status(500).json({
      error: "checkout_error",
      message: "Failed to initiate payment. Please try again or contact the admissions team.",
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/stripe/webhook
//
// Stripe delivers signed event payloads here on payment lifecycle events.
//
// CRITICAL: Always respond 200 for events we receive — even ones we don't
// handle. Stripe retries events that receive non-2xx responses, which would
// cause duplicate email sends and double-enrolled records.
//
// Only return 4xx for genuine request errors (missing signature, bad body).
// ---------------------------------------------------------------------------
router.post("/stripe/webhook", async (req, res) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    req.log.warn("Stripe webhook: missing or malformed stripe-signature header");
    res.status(400).json({ error: "missing_signature" });
    return;
  }

  // rawBody is saved by the express.json() verify callback in app.ts.
  // Cast via unknown to avoid TS strict index access errors — the property is
  // guaranteed present if app.ts is wired correctly.
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;

  if (!rawBody) {
    req.log.error(
      "Stripe webhook: rawBody is undefined — check app.ts json middleware verify callback",
    );
    res.status(400).json({ error: "raw_body_unavailable" });
    return;
  }

  const event = await constructWebhookEvent(rawBody, signature);

  if (!event) {
    req.log.warn("Stripe webhook: signature verification failed or webhook secret not configured");
    res.status(400).json({ error: "invalid_signature" });
    return;
  }

  req.log.info({ type: event.type, id: event.id }, "Stripe webhook event received");

  switch (event.type) {
    // -----------------------------------------------------------------------
    // checkout.session.completed
    // Payment succeeded — mark application as enrolled and send emails.
    // -----------------------------------------------------------------------
    case "checkout.session.completed": {
      const session = event.data.object;
      const { applicationId, statusToken } = session.metadata ?? {};

      if (!applicationId || !statusToken) {
        req.log.warn(
          { eventId: event.id, sessionId: session.id },
          "Stripe webhook: checkout.session.completed missing applicationId or statusToken in metadata",
        );
        break;
      }

      const record = applicationStore.get(applicationId);
      if (!record) {
        req.log.warn(
          { applicationId, eventId: event.id },
          "Stripe webhook: application not found for checkout.session.completed — already deleted?",
        );
        break;
      }

      if (record.admissionsStatus === "enrolled") {
        // Idempotent: Stripe may deliver the same event more than once.
        req.log.info(
          { applicationId, eventId: event.id },
          "Stripe webhook: application already enrolled — skipping duplicate event",
        );
        break;
      }

      // Persist enrollment state on the in-memory record.
      // These fields extend ApplicationRecord at runtime — Stripe-specific.
      (record as ApplicationRecord & { enrolledAt: number }).enrolledAt = Date.now();
      (record as ApplicationRecord & { stripeSessionId: string }).stripeSessionId = session.id;
      (record as ApplicationRecord & { stripePaymentIntentId?: string }).stripePaymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : undefined;
      record.admissionsStatus = "enrolled";

      req.log.info(
        { applicationId, sessionId: session.id, email: record.email },
        "Application enrolled after successful Stripe payment",
      );

      // Enrollment confirmation → applicant (best-effort)
      sendEnrollmentConfirmation(record.email, statusToken, req.log).catch((err) => {
        req.log.warn({ err, applicationId }, "Failed to send enrollment confirmation email");
      });

      // Enrollment notification → admissions team (best-effort)
      sendEnrollmentNotificationToAdmissions(
        {
          email: record.email,
          applicationId,
          visitorType: record.visitorType,
          fitScore: record.extracted?.fitScore,
        },
        req.log,
      ).catch((err) => {
        req.log.warn({ err, applicationId }, "Failed to send admissions enrollment notification");
      });

      break;
    }

    // -----------------------------------------------------------------------
    // checkout.session.expired
    // Session expired before the applicant completed payment — log only.
    // The applicant can click "Pay enrollment fee" again from the portal.
    // -----------------------------------------------------------------------
    case "checkout.session.expired": {
      const session = event.data.object;
      req.log.info(
        { sessionId: session.id, applicationId: session.metadata?.applicationId },
        "Stripe checkout session expired — applicant can retry from portal",
      );
      break;
    }

    // -----------------------------------------------------------------------
    // payment_intent.payment_failed
    // Card declined or other payment failure — no action needed.
    // Stripe Checkout shows the applicant an error and lets them retry.
    // -----------------------------------------------------------------------
    case "payment_intent.payment_failed": {
      req.log.warn(
        { eventId: event.id },
        "Stripe payment intent failed — applicant can retry from portal",
      );
      break;
    }

    default:
      // Acknowledge all other events we don't handle. Never return non-2xx here.
      req.log.info({ type: event.type }, "Stripe webhook: unhandled event type — acknowledging");
  }

  // Always return 200 — Stripe retries on non-2xx responses.
  res.json({ received: true, type: event.type });
});

// Re-export for use in stripe.ts lib (type only, avoids circular import)
type ApplicationRecord = import("./apply").ApplicationRecord;

export default router;
