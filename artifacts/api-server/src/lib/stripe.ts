// ---------------------------------------------------------------------------
// stripe.ts — Stripe client and enrollment payment helpers
//
// Graceful no-op when STRIPE_SECRET_KEY is not set. All exports check for
// the key and return null to callers without throwing, following the same
// graceful-degradation pattern used by Resend (email.ts) and Airtable
// (waitlist.ts).
//
// Environment variables:
//   STRIPE_SECRET_KEY      — Stripe secret key (sk_test_... or sk_live_...)
//   STRIPE_WEBHOOK_SECRET  — Stripe webhook signing secret (whsec_...)
//   STRIPE_PRICE_ID        — Optional pre-configured Stripe Price ID.
//                            If not set, a dynamic price is built from
//                            ENROLLMENT_FEE_EUR (whole EUR, default 600).
//   ENROLLMENT_FEE_EUR     — Enrollment fee in whole EUR (default: 600).
//                            Only used when STRIPE_PRICE_ID is not set.
//   SITE_URL               — Base URL for success/cancel redirect URLs.
//                            (default: https://miaw.ai)
// ---------------------------------------------------------------------------

import type Stripe from "stripe";

export function isStripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

// Lazy Stripe client — avoids import errors in environments where the package
// is not needed and the key is not set. Initialised and cached on first call.
let _stripeClient: Stripe | null = null;

export async function getStripeClient(): Promise<Stripe | null> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;
  if (_stripeClient) return _stripeClient;

  const { default: StripeLib } = await import("stripe");
  _stripeClient = new StripeLib(secretKey, {
    // Pin to the API version that shipped with stripe@22 — upgrades are deliberate.
    apiVersion: "2026-04-22.dahlia",
    appInfo: { name: "MIAW", version: "1.0.0", url: "https://miaw.ai" },
    // Automatic retries on transient network failures (idempotent GET/POST).
    maxNetworkRetries: 2,
  });
  return _stripeClient;
}

const SITE_URL = process.env.SITE_URL ?? "https://miaw.ai";

/** Enrollment fee in cents. Configured via ENROLLMENT_FEE_EUR (whole EUR). */
function getEnrollmentFeeCents(): number {
  const eurRaw = process.env.ENROLLMENT_FEE_EUR;
  if (!eurRaw) return 60_000; // default: 600 EUR
  const eur = parseInt(eurRaw, 10);
  if (Number.isNaN(eur) || eur <= 0) return 60_000;
  return eur * 100;
}

// ---------------------------------------------------------------------------
// createCheckoutSession
//
// Creates a Stripe Checkout session for the enrollment fee payment.
// Returns { url } on success — redirect the browser to this URL.
// Returns null when Stripe is not configured (STRIPE_SECRET_KEY absent).
//
// @param applicationId — internal UUID of the application record
// @param statusToken   — opaque public portal token (embedded in redirect URLs)
// @param email         — applicant email (pre-fills Stripe Checkout form)
// ---------------------------------------------------------------------------
export async function createCheckoutSession(
  applicationId: string,
  statusToken: string,
  email: string,
): Promise<{ url: string } | null> {
  const stripe = await getStripeClient();
  if (!stripe) return null;

  const priceId = process.env.STRIPE_PRICE_ID;
  const successUrl = `${SITE_URL}/api/apply/portal?token=${encodeURIComponent(statusToken)}&payment=success`;
  const cancelUrl = `${SITE_URL}/api/apply/portal?token=${encodeURIComponent(statusToken)}&payment=cancelled`;

  // Use `as const` type widening to avoid the Stripe.Checkout.SessionCreateParams
  // generic — parameters are inferred by stripe.checkout.sessions.create() directly.
  const sessionParams = {
    mode: "payment" as const,
    customer_email: email,
    success_url: successUrl,
    cancel_url: cancelUrl,
    // Metadata is passed back in webhook events — how we identify which
    // application this payment belongs to without storing Stripe session state.
    metadata: { applicationId, statusToken },
    payment_method_types: ["card" as const],
    // Automatically adjust locale to the browser's Accept-Language header.
    locale: "auto" as const,
    // Billing address for receipt and invoice compliance.
    billing_address_collection: "auto" as const,
    // Phone collection off — we have the applicant's email from the application.
    phone_number_collection: { enabled: false },
    // Session expires after 30 minutes — applicant can start a new one via portal.
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    ...(priceId
      ? {
          line_items: [{ price: priceId, quantity: 1 }],
        }
      : {
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: getEnrollmentFeeCents(),
                product_data: {
                  name: "MIAW — Master In Intelligent Artificial Worlds",
                  description:
                    "Enrollment fee for the MIAW postgraduate program — 18-week intensive in spatial AI and AEC.",
                  images: [`${SITE_URL}/og.png`],
                },
              },
            },
          ],
        }),
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    throw new Error("Stripe Checkout session created but URL is null — check Stripe dashboard");
  }

  return { url: session.url };
}

// ---------------------------------------------------------------------------
// constructWebhookEvent
//
// Verifies the Stripe webhook signature and returns the parsed Event object.
// Returns null when:
//   - STRIPE_WEBHOOK_SECRET is not set (Stripe not configured)
//   - The signature is invalid (tampered request or wrong secret)
//
// The raw body buffer is required for signature verification — express.json()
// must NOT have processed this body first (app.ts saves it via verify callback).
// ---------------------------------------------------------------------------
export async function constructWebhookEvent(
  rawBody: Buffer,
  signature: string,
): Promise<Stripe.Event | null> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return null;

  const stripe = await getStripeClient();
  if (!stripe) return null;

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    // Invalid signature — do NOT throw; caller returns 400 to Stripe.
    return null;
  }
}
