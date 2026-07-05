// ---------------------------------------------------------------------------
// email.ts — Transactional email via Resend + React Email templates
//
// Graceful no-op when RESEND_API_KEY is not set. Every function is
// best-effort: callers .catch() failures and log them without blocking the
// HTTP response.
//
// Six email types:
//   sendWaitlistConfirmation              → applicant: warm waitlist confirmation
//   sendApplicationAck                   → applicant: personalised Claude-generated ack
//                                           (P4-A: includes status portal link)
//   notifyAdmissions                     → team: structured notification with fit data
//   sendStatusUpdateEmail                → applicant: admissions decision notification
//                                           (P4-A: triggered by admin status change)
//   sendEnrollmentConfirmation           → applicant: enrollment confirmed after payment
//                                           (P4-B: triggered by Stripe webhook)
//   sendEnrollmentNotificationToAdmissions → team: new enrollment notification
//                                           (P4-B: triggered by Stripe webhook)
//
// Templates live in src/emails/ as React Email components. They are
// rendered to HTML strings server-side using @react-email/render.
// ---------------------------------------------------------------------------

import { createElement } from "react";
import { render } from "@react-email/render";
import WaitlistConfirmation, {
  type WaitlistConfirmationProps,
} from "../emails/WaitlistConfirmation";
import ApplicationAck, {
  type ApplicationAckProps,
} from "../emails/ApplicationAck";
import AdmissionsNotification, {
  type AdmissionsNotificationProps,
} from "../emails/AdmissionsNotification";
import StatusUpdate, {
  type StatusUpdateProps,
} from "../emails/StatusUpdate";
import EnrollmentConfirmation, {
  type EnrollmentConfirmationProps,
} from "../emails/EnrollmentConfirmation";

// Re-export so callers can build the data shape from the canonical type.
export type { AdmissionsNotificationProps as ApplicationEmailData };

type Logger = {
  info: (obj: Record<string, unknown>, msg: string) => void;
  warn: (obj: Record<string, unknown>, msg: string) => void;
};

// ---------------------------------------------------------------------------
// SITE_URL — base URL for applicant-facing links embedded in emails.
// Set to the production domain in Replit Secrets once the custom domain
// is confirmed (e.g. "https://miaw.ai"). Falls back to miaw.ai so emails
// sent in staging/production always link to the live site.
// ---------------------------------------------------------------------------
const SITE_URL = process.env.SITE_URL ?? "https://miaw.ai";

// ---------------------------------------------------------------------------
// Internal helper: initialise Resend client (lazy, so it only loads when
// a send is actually attempted). Returns null when RESEND_API_KEY is absent.
// ---------------------------------------------------------------------------
async function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  const { Resend } = await import("resend");
  return new Resend(apiKey);
}

const DEFAULT_FROM = "MIAW Admissions <hello@miaw.ai>";

// ---------------------------------------------------------------------------
// sendWaitlistConfirmation
// Triggered immediately after a new waitlist entry is recorded.
// ---------------------------------------------------------------------------
export async function sendWaitlistConfirmation(
  applicantEmail: string,
  props: Omit<WaitlistConfirmationProps, never> = {},
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend) {
    log?.info(
      { to: applicantEmail },
      "Email: RESEND_API_KEY not set — skipping waitlist confirmation",
    );
    return;
  }

  const html = await render(
    createElement(WaitlistConfirmation, props),
  );

  await resend.emails.send({
    from: fromEmail,
    to: applicantEmail,
    subject: "MIAW — you're on the list",
    html,
    text: [
      "You're on the list.",
      "",
      "The first MIAW cohort — 30 AEC+AI practitioners — is taking shape.",
      "We'll reach out directly when applications open, before any public announcement.",
      "",
      "If you have questions in the meantime, or know someone who should be in the room,",
      "reply directly to this email.",
      "",
      "— MIAW",
      "https://miaw.ai",
    ].join("\n"),
  });

  log?.info(
    { to: applicantEmail },
    "Email: waitlist confirmation sent successfully",
  );
}

// ---------------------------------------------------------------------------
// sendApplicationAck
// Sends the Claude-generated personalised acknowledgment to the applicant.
//
// P4-A: accepts `statusToken` so the email can include a direct link to the
// applicant portal — a token-authenticated URL that lets them track their
// admissions status without creating an account.
// ---------------------------------------------------------------------------
export async function sendApplicationAck(
  applicantEmail: string,
  ackText: string,
  statusToken: string,
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend) {
    log?.info(
      { to: applicantEmail },
      "Email: RESEND_API_KEY not set — skipping applicant ack email",
    );
    return;
  }

  const statusUrl = `${SITE_URL}/api/apply/portal?token=${encodeURIComponent(statusToken)}`;
  const props: ApplicationAckProps = { ackText, statusUrl };
  const html = await render(createElement(ApplicationAck, props));

  await resend.emails.send({
    from: fromEmail,
    to: applicantEmail,
    subject: "MIAW — your application",
    html,
    text: [
      ackText,
      "",
      "---",
      `Track your application status: ${statusUrl}`,
      "(Bookmark this link — no account needed.)",
    ].join("\n"),
  });

  log?.info(
    { to: applicantEmail },
    "Email: applicant ack sent successfully",
  );
}

// ---------------------------------------------------------------------------
// notifyAdmissions
// Sends a structured notification to the admissions team with the full
// extracted profile, fit score, and recommended follow-up question.
// No-ops gracefully if ADMISSIONS_EMAIL is not configured.
// ---------------------------------------------------------------------------
export async function notifyAdmissions(
  data: AdmissionsNotificationProps,
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const admissionsEmail = process.env.ADMISSIONS_EMAIL;
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend || !admissionsEmail) {
    log?.info(
      {
        hasResend: Boolean(resend),
        hasAdmissionsEmail: Boolean(admissionsEmail),
      },
      "Email: RESEND_API_KEY or ADMISSIONS_EMAIL not set — skipping admissions notification",
    );
    return;
  }

  const html = await render(createElement(AdmissionsNotification, data));

  await resend.emails.send({
    from: fromEmail,
    to: admissionsEmail,
    subject: `MIAW — new application (fit ${data.fitScore}/5) from ${data.email}`,
    html,
    text: [
      `New MIAW application`,
      ``,
      `Applicant: ${data.email}`,
      `Visitor type: ${data.visitorType}`,
      `Fit score: ${data.fitScore}/5 — ${data.fitRationale}`,
      `Portfolio: ${data.portfolioUrl ?? "none"}`,
      ``,
      `Background: ${data.background}`,
      `Motivations: ${data.motivations}`,
      `Concerns: ${data.concernsExpressed}`,
      data.keyQuotes.length > 0
        ? `Key quotes:\n${data.keyQuotes.map((q) => `  "${q}"`).join("\n")}`
        : "",
      ``,
      `Follow-up question: ${data.recommendedFollowUpQuestion}`,
      ``,
      `Application ID: ${data.applicationId}`,
      `Submitted: ${data.submittedAt}`,
    ]
      .filter((l) => l !== undefined)
      .join("\n"),
  });

  log?.info(
    { to: admissionsEmail, applicationId: data.applicationId },
    "Email: admissions notification sent successfully",
  );
}

// ---------------------------------------------------------------------------
// sendStatusUpdateEmail                                              (P4-A)
// Triggered by the admissions team when they update an application's status
// to "accepted", "waitlisted", or "declined" via the admin dashboard.
//
// "received" and "reviewed" are internal workflow states — no email is sent
// for those transitions since they represent admin-side activity, not a
// decision communicated to the applicant.
//
// The email links to the applicant portal so the applicant can read the
// current status at any time without needing an account.
// ---------------------------------------------------------------------------
export async function sendStatusUpdateEmail(
  applicantEmail: string,
  admissionsStatus: "accepted" | "waitlisted" | "declined",
  statusToken: string,
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend) {
    log?.info(
      { to: applicantEmail, admissionsStatus },
      "Email: RESEND_API_KEY not set — skipping status update email",
    );
    return;
  }

  const statusUrl = `${SITE_URL}/api/apply/portal?token=${encodeURIComponent(statusToken)}`;
  const props: StatusUpdateProps = { admissionsStatus, statusUrl };
  const html = await render(createElement(StatusUpdate, props));

  const subjects: Record<typeof admissionsStatus, string> = {
    accepted: "MIAW — your application outcome",
    waitlisted: "MIAW — an update on your application",
    declined: "MIAW — regarding your application",
  };

  const plainText: Record<typeof admissionsStatus, string> = {
    accepted: [
      "We have reviewed your application and would like to offer you a place in the MIAW cohort.",
      "",
      "We will be in touch shortly with next steps.",
      "",
      `View your application: ${statusUrl}`,
      "",
      "— MIAW Admissions",
    ].join("\n"),
    waitlisted: [
      "We have completed our initial review and placed you on our reserve list.",
      "If a place opens up, we will reach out directly.",
      "",
      `View your application: ${statusUrl}`,
      "",
      "— MIAW Admissions",
    ].join("\n"),
    declined: [
      "We have completed our review and are not able to offer a place in this cohort.",
      "We will keep your details for future intake.",
      "",
      `View your application: ${statusUrl}`,
      "",
      "— MIAW Admissions",
    ].join("\n"),
  };

  await resend.emails.send({
    from: fromEmail,
    to: applicantEmail,
    subject: subjects[admissionsStatus],
    html,
    text: plainText[admissionsStatus],
  });

  log?.info(
    { to: applicantEmail, admissionsStatus },
    "Email: status update sent successfully",
  );
}

// ---------------------------------------------------------------------------
// sendEnrollmentConfirmation                                          (P4-B)
// Triggered by the Stripe webhook (checkout.session.completed) after the
// applicant successfully pays the enrollment fee. Confirms enrollment and
// links to the applicant portal showing the updated "Enrolled" status.
// ---------------------------------------------------------------------------
export async function sendEnrollmentConfirmation(
  applicantEmail: string,
  statusToken: string,
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend) {
    log?.info(
      { to: applicantEmail },
      "Email: RESEND_API_KEY not set — skipping enrollment confirmation",
    );
    return;
  }

  const portalUrl = `${SITE_URL}/api/apply/portal?token=${encodeURIComponent(statusToken)}`;
  const props: EnrollmentConfirmationProps = { portalUrl };
  const html = await render(createElement(EnrollmentConfirmation, props));

  await resend.emails.send({
    from: fromEmail,
    to: applicantEmail,
    subject: "MIAW — enrollment confirmed",
    html,
    text: [
      "Your enrollment fee has been received and your place in the MIAW cohort is confirmed.",
      "",
      "We will reach out shortly with the program schedule, onboarding materials, and the",
      "details you need to prepare. The cohort starts Q4 2026.",
      "",
      "Questions? Reply directly to this email.",
      "",
      `View your application: ${portalUrl}`,
      "",
      "— MIAW Admissions",
    ].join("\n"),
  });

  log?.info({ to: applicantEmail }, "Email: enrollment confirmation sent successfully");
}

// ---------------------------------------------------------------------------
// sendEnrollmentNotificationToAdmissions                              (P4-B)
// Sends a brief notification to the admissions team when a new enrollment
// payment is received. Triggered by the Stripe webhook alongside
// sendEnrollmentConfirmation. Best-effort — never blocks the webhook 200.
// ---------------------------------------------------------------------------
export async function sendEnrollmentNotificationToAdmissions(
  data: {
    email: string;
    applicationId: string;
    visitorType: string;
    fitScore?: number;
  },
  log?: Logger,
): Promise<void> {
  const resend = await getResend();
  const admissionsEmail = process.env.ADMISSIONS_EMAIL;
  const fromEmail = process.env.FROM_EMAIL ?? DEFAULT_FROM;

  if (!resend || !admissionsEmail) {
    log?.info(
      {
        hasResend: Boolean(resend),
        hasAdmissionsEmail: Boolean(admissionsEmail),
      },
      "Email: RESEND_API_KEY or ADMISSIONS_EMAIL not set — skipping enrollment admissions notification",
    );
    return;
  }

  const fitLabel = data.fitScore != null ? `${data.fitScore}/5` : "unscored";
  const portalUrl = `${SITE_URL}/api/admin?token=<METRICS_TOKEN>`;

  await resend.emails.send({
    from: fromEmail,
    to: admissionsEmail,
    subject: `MIAW — new enrollment: ${data.email}`,
    html: `
      <div style="font-family:sans-serif;background:#0d0b1a;color:#e8e4f8;padding:32px;max-width:560px;margin:0 auto;border-radius:12px;">
        <p style="font-family:'Courier New',monospace;font-size:20px;font-weight:700;color:#fff;letter-spacing:0.1em;margin:0 0 24px;">miaw</p>
        <hr style="border-color:rgba(255,255,255,0.12);margin:0 0 24px;" />
        <p style="font-size:16px;font-weight:600;color:#5de893;margin:0 0 16px;">New enrollment received</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="color:rgba(255,255,255,0.4);padding:6px 0;width:140px;">Applicant</td><td style="color:#e8e4f8;">${data.email}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.4);padding:6px 0;">Visitor type</td><td style="color:#e8e4f8;">${data.visitorType}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.4);padding:6px 0;">Fit score</td><td style="color:#e8e4f8;">${fitLabel}</td></tr>
          <tr><td style="color:rgba(255,255,255,0.4);padding:6px 0;">Application ID</td><td style="color:rgba(255,255,255,0.5);font-family:monospace;font-size:12px;">${data.applicationId}</td></tr>
        </table>
        <hr style="border-color:rgba(255,255,255,0.12);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0;">View all applications in the <a href="${portalUrl}" style="color:#7ab2f8;">admin dashboard</a>. The application status has been automatically updated to Enrolled.</p>
      </div>
    `,
    text: [
      "New MIAW enrollment",
      "",
      `Applicant: ${data.email}`,
      `Visitor type: ${data.visitorType}`,
      `Fit score: ${fitLabel}`,
      `Application ID: ${data.applicationId}`,
      "",
      "The application status has been automatically updated to Enrolled.",
      "",
      "— MIAW Admissions System",
    ].join("\n"),
  });

  log?.info(
    { to: admissionsEmail, applicationId: data.applicationId },
    "Email: enrollment admissions notification sent successfully",
  );
}
