import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import {
  getApplicationStaticPreamble,
  buildApplicationDynamicSuffix,
} from "../lib/applicationPrompt";
import { inferProfile } from "../lib/profile";
import { recordError } from "../lib/alerting";
import { sendApplicationAck, notifyAdmissions } from "../lib/email";

const router = Router();

// ---------------------------------------------------------------------------
// In-memory application store
// In-memory is always active; Airtable mirror is best-effort when configured.
// Same graceful-degradation pattern as waitlist.ts.
// ---------------------------------------------------------------------------
interface ApplicationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ExtractedProfile {
  background: string;
  statedProjectTypes: string[];
  selfAssessedTechnicalLevel: string;
  motivations: string;
  concernsExpressed: string;
  keyQuotes: string[];
  fitScore: number;
  fitRationale: string;
  recommendedFollowUpQuestion: string;
}

export interface ApplicationRecord {
  id: string;
  // P4-A: opaque token for the public applicant portal — separate from the
  // internal UUID so the application ID is never exposed in public URLs.
  statusToken: string;
  email: string;
  visitorType: string;
  qualificationMessages: ApplicationMessage[];
  applicationMessages: ApplicationMessage[];
  portfolioUrl?: string;
  gdprConsent: boolean;
  gdprConsentAt: number;
  extracted?: ExtractedProfile;
  personalizedAck?: string;
  status: "processing" | "complete" | "error";
  // "enrolled" is set by the Stripe webhook (checkout.session.completed) when
  // the applicant completes the enrollment fee payment. The admin can also set
  // it manually (e.g. for offline bank-transfer payments).
  admissionsStatus: "received" | "reviewed" | "accepted" | "waitlisted" | "declined" | "enrolled";
  // Stripe enrollment fields — set at runtime by routes/stripe.ts webhook handler.
  enrolledAt?: number;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  errorMessage?: string;
  createdAt: number;
  completedAt?: number;
  aiSummary?: string;
}

// Primary store: applicationId → ApplicationRecord
export const applicationStore = new Map<string, ApplicationRecord>();

// P4-A: Secondary index: statusToken → applicationId
// O(1) lookup for the public applicant portal. Separate from the primary
// store so the token never appears in application IDs or admin URLs.
export const applicationByToken = new Map<string, string>();

// ---------------------------------------------------------------------------
// Rate limiting — application submit: 3 per IP per 24 hours.
// Stricter than the chat rate limit (30/hr) since submissions trigger two
// sequential Claude API calls and represent meaningful intent signals.
// In-memory only — Upstash Redis is NOT used here; the rate is so low that
// in-memory is always sufficient.
// ---------------------------------------------------------------------------
const applyRateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();
const APPLY_RATE_LIMIT_MAX = 3;
const APPLY_RATE_LIMIT_WINDOW_MS = 86_400_000; // 24 hours

function checkApplyRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const record = applyRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    applyRateLimitMap.set(ip, {
      count: 1,
      resetAt: now + APPLY_RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: APPLY_RATE_LIMIT_MAX - 1 };
  }
  if (record.count >= APPLY_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return { allowed: true, remaining: APPLY_RATE_LIMIT_MAX - record.count };
}

// ---------------------------------------------------------------------------
// Rate limiting — application chat: 40 per IP per hour.
// Separate key namespace from the main chat rate limit so application turns
// don't consume the visitor's qualification quota and vice versa.
// ---------------------------------------------------------------------------
const applyChatRateLimitMap = new Map<
  string,
  { count: number; resetAt: number }
>();
const APPLY_CHAT_RATE_LIMIT_MAX = 40;
const APPLY_CHAT_RATE_LIMIT_WINDOW_MS = 3_600_000; // 1 hour

function checkApplyChatRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const record = applyChatRateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    applyChatRateLimitMap.set(ip, {
      count: 1,
      resetAt: now + APPLY_CHAT_RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: APPLY_CHAT_RATE_LIMIT_MAX - 1 };
  }
  if (record.count >= APPLY_CHAT_RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }
  record.count += 1;
  return {
    allowed: true,
    remaining: APPLY_CHAT_RATE_LIMIT_MAX - record.count,
  };
}

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

const VisitorProfileSchema = z.object({
  type: z.enum([
    "architect",
    "engineer",
    "researcher",
    "developer",
    "student",
    "urban_planner",
    "unknown",
  ]),
  context: z.string().max(500),
  identified: z.boolean(),
  identifiedAtTurn: z.number().int().nullable(),
});

const ApplyChatSchema = z.object({
  messages: z.array(MessageSchema).max(100),
  profile: VisitorProfileSchema.optional().default({
    type: "unknown",
    context: "",
    identified: false,
    identifiedAtTurn: null,
  }),
  applicationTurnCount: z
    .number()
    .int()
    .min(0)
    .max(20)
    .optional()
    .default(0),
});

const ApplySubmitSchema = z.object({
  email: z.string().email().max(254),
  visitorType: z
    .enum([
      "architect",
      "engineer",
      "researcher",
      "developer",
      "student",
      "urban_planner",
      "unknown",
    ])
    .optional()
    .default("unknown"),
  qualificationMessages: z.array(MessageSchema).max(50),
  applicationMessages: z.array(MessageSchema).max(50),
  portfolioUrl: z.string().max(2048).optional(),
  gdprConsent: z.literal(true, {
    errorMap: () => ({ message: "GDPR consent is required." }),
  }),
});

// ---------------------------------------------------------------------------
// Warm the static preamble at module load
// ---------------------------------------------------------------------------
getApplicationStaticPreamble();

// ---------------------------------------------------------------------------
// Helper: strip markdown code fences Claude sometimes wraps JSON in
// ---------------------------------------------------------------------------
function extractJson(text: string): unknown {
  const stripped = text
    .replace(/^```(?:json)?\s*/m, "")
    .replace(/\s*```\s*$/m, "")
    .trim();
  return JSON.parse(stripped);
}

// ---------------------------------------------------------------------------
// Claude call 1: structured extraction
// Non-streaming; caller awaits the result before proceeding to call 2.
// ---------------------------------------------------------------------------
async function extractApplicantProfile(
  qualificationMessages: ApplicationMessage[],
  applicationMessages: ApplicationMessage[],
): Promise<ExtractedProfile> {
  const transcript = [
    "=== QUALIFICATION CONVERSATION ===",
    ...qualificationMessages.map(
      (m) => `${m.role.toUpperCase()}: ${m.content}`,
    ),
    "",
    "=== APPLICATION INTERVIEW ===",
    ...applicationMessages.map((m) => `${m.role.toUpperCase()}: ${m.content}`),
  ].join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: `You are an admissions analyst for MIAW (Master In Intelligent Artificial Worlds), a postgraduate AEC+AI program. Analyze the conversation transcript and extract a structured applicant profile.

Respond ONLY with a single valid JSON object. No markdown code fences. No commentary before or after. No trailing text.

Required JSON schema — every field is required:
{
  "background": "string — professional role and domain expertise, 1-2 sentences",
  "statedProjectTypes": ["array of specific project types or domains mentioned"],
  "selfAssessedTechnicalLevel": "string — how they described their own technical or coding skill",
  "motivations": "string — why they want to join MIAW, in their words or close paraphrase",
  "concernsExpressed": "string — hesitations or concerns they raised, or 'none expressed'",
  "keyQuotes": ["array of up to 3 direct quotes from the applicant that best capture their voice and perspective"],
  "fitScore": "integer 1 to 5 — 1 is weak fit, 5 is exceptional fit",
  "fitRationale": "string — why this score, 30 words max",
  "recommendedFollowUpQuestion": "string — one question an admissions committee member should ask this person"
}`,
    messages: [
      {
        role: "user",
        content: `Analyze this conversation transcript and return the structured JSON profile:\n\n${transcript}`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text : "{}";

  let raw: Record<string, unknown>;
  try {
    raw = extractJson(text) as Record<string, unknown>;
  } catch {
    raw = {};
  }

  return {
    background: String(raw.background ?? ""),
    statedProjectTypes: Array.isArray(raw.statedProjectTypes)
      ? (raw.statedProjectTypes as unknown[]).map(String)
      : [],
    selfAssessedTechnicalLevel: String(raw.selfAssessedTechnicalLevel ?? ""),
    motivations: String(raw.motivations ?? ""),
    concernsExpressed: String(raw.concernsExpressed ?? "none expressed"),
    keyQuotes: Array.isArray(raw.keyQuotes)
      ? (raw.keyQuotes as unknown[]).map(String)
      : [],
    fitScore:
      typeof raw.fitScore === "number"
        ? Math.min(5, Math.max(1, Math.round(raw.fitScore)))
        : 3,
    fitRationale: String(raw.fitRationale ?? ""),
    recommendedFollowUpQuestion: String(raw.recommendedFollowUpQuestion ?? ""),
  };
}

// ---------------------------------------------------------------------------
// Claude call 2: personalized acknowledgment
// Runs after extraction so it can reference the extracted profile details.
// ---------------------------------------------------------------------------
async function generatePersonalizedAck(
  extracted: ExtractedProfile,
  visitorType: string,
): Promise<string> {
  const profileSummary = [
    `Visitor type: ${visitorType}`,
    `Background: ${extracted.background}`,
    extracted.statedProjectTypes.length > 0
      ? `Project types mentioned: ${extracted.statedProjectTypes.join(", ")}`
      : "",
    extracted.selfAssessedTechnicalLevel
      ? `Technical self-assessment: ${extracted.selfAssessedTechnicalLevel}`
      : "",
    `Motivations: ${extracted.motivations}`,
    `Concerns expressed: ${extracted.concernsExpressed}`,
    extracted.keyQuotes.length > 0
      ? `Key quotes: ${extracted.keyQuotes.map((q) => `"${q}"`).join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: `You write application acknowledgments for MIAW (Master In Intelligent Artificial Worlds), a postgraduate AEC+AI program for practitioners.

RULES — follow every one precisely:
- Write exactly 100-130 words in total.
- Reference 2-3 specific details from the conversation (a project type, a technology, a concern, or a direct quote). Make it clear you were actually listening.
- Warm but not effusive. Genuine, not generic.
- No phrases like "We were impressed by", "Your passion shines through", "Thank you for sharing".
- Do NOT use the applicant's name — you do not have it.
- Do NOT mention specific tuition fees, start dates, intake numbers, or acceptance rates.
- Close with this exact sentence as its own paragraph: "We'll review your application and be in touch."
- Sign off on its own line as exactly: "— MIAW Admissions"
- Plain paragraphs only. No bullet points. No headers.`,
    messages: [
      {
        role: "user",
        content: `Write the acknowledgment for this applicant:\n\n${profileSummary}`,
      },
    ],
  });

  const text =
    response.content[0]?.type === "text" ? response.content[0].text.trim() : "";

  return (
    text ||
    "Something in what you described points to exactly the kind of practitioner this program is built around. We appreciate you taking the time to have this conversation with us.\n\nWe'll review your application and be in touch.\n\n— MIAW Admissions"
  );
}

// ---------------------------------------------------------------------------
// Optional: mirror to Airtable (best-effort, non-blocking)
// Uses a separate table from the waitlist — configurable via
// AIRTABLE_APPLICATIONS_TABLE (defaults to "Applications").
// ---------------------------------------------------------------------------
async function mirrorToAirtable(record: ApplicationRecord): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName =
    process.env.AIRTABLE_APPLICATIONS_TABLE ?? "Applications";

  if (!apiKey || !baseId) return;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        "Application ID": record.id,
        Email: record.email,
        "Visitor Type": record.visitorType,
        "Portfolio URL": record.portfolioUrl ?? "",
        "Fit Score": record.extracted?.fitScore ?? 0,
        "Fit Rationale": record.extracted?.fitRationale ?? "",
        Background: record.extracted?.background ?? "",
        Motivations: record.extracted?.motivations ?? "",
        "Concerns Expressed": record.extracted?.concernsExpressed ?? "",
        "Key Quotes": (record.extracted?.keyQuotes ?? []).join("\n"),
        "Recommended Follow-Up":
          record.extracted?.recommendedFollowUpQuestion ?? "",
        "GDPR Consent At": new Date(record.gdprConsentAt).toISOString(),
        "Application Turn Count": record.applicationMessages.filter(
          (m) => m.role === "user",
        ).length,
        "Submitted At": new Date(record.createdAt).toISOString(),
        Source: "MIAW P2-B Application Flow",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// POST /api/apply/chat
// Streams the application interview response from Claude.
// Same chunked-transfer pattern as /api/chat.
// ---------------------------------------------------------------------------
router.post("/apply/chat", async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const { allowed } = checkApplyChatRateLimit(ip);
  if (!allowed) {
    res.status(429).json({
      error: "rate_limit",
      message: "Too many application turns. Please wait before continuing.",
    });
    return;
  }

  const parsed = ApplyChatSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_request",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { messages, profile, applicationTurnCount } = parsed.data;

  const updatedProfile = inferProfile(messages, profile, applicationTurnCount);

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  // Disable TCP Nagle's algorithm so each res.write() is sent immediately —
  // prevents small token chunks from being batched into fewer, larger packets.
  req.socket?.setNoDelay(true);

  const systemBlocks = [
    {
      type: "text" as const,
      text: getApplicationStaticPreamble(),
      cache_control: { type: "ephemeral" as const },
    },
    {
      type: "text" as const,
      text: buildApplicationDynamicSuffix(updatedProfile, applicationTurnCount),
    },
  ];

  const claudeMessages =
    messages.length === 0
      ? [{ role: "user" as const, content: "begin application interview" }]
      : messages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          }));

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemBlocks,
      messages: claudeMessages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        res.write(chunk.delta.text);
      }
    }

    res.end();
  } catch (err) {
    req.log.error({ err }, "Claude application chat streaming error");
    recordError("claude");
    if (!res.headersSent) {
      res.status(500).json({ error: "stream_error" });
    } else {
      res.end();
    }
  }
});

// ---------------------------------------------------------------------------
// POST /api/apply
// Submits the application. Runs two sequential Claude calls (extraction then
// acknowledgment) before responding — typical wall time 8-14 seconds.
// The client shows a loading state during this period.
//
// P4-A: generates a `statusToken` (UUID) alongside the `applicationId`. The
// token is stored in the secondary `applicationByToken` index and returned
// to the client so the applicant can bookmark the portal URL.
// ---------------------------------------------------------------------------
router.post("/apply", async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const { allowed } = checkApplyRateLimit(ip);
  if (!allowed) {
    res.status(429).json({
      error: "rate_limit",
      message:
        "You can submit up to 3 applications per day. Please try again tomorrow.",
    });
    return;
  }

  const parsed = ApplySubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_request",
      details: parsed.error.flatten(),
    });
    return;
  }

  const {
    email,
    visitorType,
    qualificationMessages,
    applicationMessages,
    portfolioUrl,
    gdprConsent,
  } = parsed.data;

  const applicationId = randomUUID();
  // P4-A: opaque token — separate UUID from the application ID so the internal
  // ID is never exposed in public applicant-facing URLs.
  const statusToken = randomUUID();
  const now = Date.now();

  const record: ApplicationRecord = {
    id: applicationId,
    statusToken,
    email,
    visitorType,
    qualificationMessages,
    applicationMessages,
    portfolioUrl,
    gdprConsent,
    gdprConsentAt: now,
    status: "processing",
    admissionsStatus: "received",
    createdAt: now,
  };

  applicationStore.set(applicationId, record);
  // P4-A: register the token in the secondary index immediately so the portal
  // endpoint can resolve it even before extraction completes.
  applicationByToken.set(statusToken, applicationId);

  req.log.info({ applicationId, visitorType }, "Application received — processing");

  try {
    // Sequential: extraction first, then ack uses the extracted data.
    // Average total: ~8-14 seconds. Acceptable for application submission UX.
    const extracted = await extractApplicantProfile(
      qualificationMessages,
      applicationMessages,
    );
    const personalizedAck = await generatePersonalizedAck(extracted, visitorType);

    record.extracted = extracted;
    record.personalizedAck = personalizedAck;
    record.status = "complete";
    record.completedAt = Date.now();
    applicationStore.set(applicationId, record);

    req.log.info(
      { applicationId, fitScore: extracted.fitScore },
      "Application processed successfully",
    );

    mirrorToAirtable(record).catch((err) => {
      req.log.warn({ err }, "Airtable mirror failed — application kept in memory");
    });

    // Fire emails best-effort — non-blocking, logged on failure.
    // Both calls are intentionally independent; one failing does not cancel the other.
    // P4-A: pass statusToken so the ack email includes the portal link.
    sendApplicationAck(email, personalizedAck, statusToken, req.log).catch((err) => {
      req.log.warn({ err }, "Email: applicant ack send failed");
    });
    notifyAdmissions(
      {
        applicationId,
        email,
        visitorType,
        fitScore: extracted.fitScore,
        fitRationale: extracted.fitRationale,
        background: extracted.background,
        motivations: extracted.motivations,
        concernsExpressed: extracted.concernsExpressed,
        keyQuotes: extracted.keyQuotes,
        recommendedFollowUpQuestion: extracted.recommendedFollowUpQuestion,
        portfolioUrl,
        applicationTurns: applicationMessages.filter((m) => m.role === "user")
          .length,
        submittedAt: new Date(now).toISOString(),
      },
      req.log,
    ).catch((err) => {
      req.log.warn({ err }, "Email: admissions notification send failed");
    });

    res.status(201).json({
      applicationId,
      // P4-A: include the status token so the client can store it and show
      // the applicant a direct link to their application portal page.
      statusToken,
      ack: personalizedAck,
      fitScore: extracted.fitScore,
      message: "Application received and processed.",
    });
  } catch (err) {
    record.status = "error";
    record.errorMessage =
      err instanceof Error ? err.message : "Unknown processing error";
    applicationStore.set(applicationId, record);

    req.log.error({ err, applicationId }, "Application processing error");
    recordError("claude");

    res.status(500).json({
      error: "processing_error",
      applicationId,
      message:
        "Something went wrong while processing your application. Your details have been saved — please contact us directly and quote your application ID.",
    });
  }
});

// ---------------------------------------------------------------------------
// GET /api/apply/status/:id
// Lightweight internal status poll. Useful if the client times out during
// POST /apply and needs to recover gracefully using the applicationId.
// Returns internal data including fitScore — for client-side use only,
// never shared with the applicant directly.
// ---------------------------------------------------------------------------
router.get("/apply/status/:id", (req, res) => {
  const record = applicationStore.get(req.params.id);
  if (!record) {
    res.status(404).json({
      error: "not_found",
      message: "Application not found.",
    });
    return;
  }
  res.json({
    applicationId: record.id,
    status: record.status,
    ack: record.status === "complete" ? record.personalizedAck : undefined,
    fitScore:
      record.status === "complete" ? record.extracted?.fitScore : undefined,
    errorMessage:
      record.status === "error" ? record.errorMessage : undefined,
  });
});

// ---------------------------------------------------------------------------
// GET /api/apply/portal/:token                                       (P4-A)
// Public JSON endpoint for the applicant portal. Looks up the application by
// the opaque statusToken (never by applicationId). Returns only the data the
// applicant is allowed to see — admissionsStatus, ack text, submission date,
// and visitor type. fitScore, applicationId, and email are NOT exposed.
// ---------------------------------------------------------------------------
router.get("/apply/portal/:token", (req, res) => {
  const applicationId = applicationByToken.get(req.params.token);
  if (!applicationId) {
    res.status(404).json({
      error: "not_found",
      message: "Application not found. The link may be incorrect or expired.",
    });
    return;
  }

  const record = applicationStore.get(applicationId);
  if (!record) {
    res.status(404).json({
      error: "not_found",
      message: "Application not found.",
    });
    return;
  }

  res.json({
    admissionsStatus: record.admissionsStatus,
    ack: record.status === "complete" ? record.personalizedAck : undefined,
    submittedAt: new Date(record.createdAt).toISOString(),
    visitorType: record.visitorType,
  });
});

// ---------------------------------------------------------------------------
// GET /api/apply/portal                                              (P4-A)
// Applicant-facing HTML status page. Served by Express so the page works
// even without the React SPA loaded (e.g. email link on a new device).
//
// Architecture: the page is a minimal dark-themed HTML document with
// inline client-side JS that reads the `?token=` query parameter and
// fetches /api/apply/portal/:token to populate the status + ack text.
// No authentication layer — the token IS the access credential.
// No server-side state needed beyond the fetch: fully stateless.
// ---------------------------------------------------------------------------
router.get("/apply/portal", (_req, res) => {
  res.type("html").send(PORTAL_PAGE_HTML);
});

// ---------------------------------------------------------------------------
// Applicant portal HTML — inlined here (consistent with the /api/admin
// pattern: Express renders the HTML, no Vite/React needed). The page uses
// vanilla JS to fetch the JSON endpoint above and populate the DOM.
// Designed to match the MIAW dark brand: #0d0b1a background, Inter/monospace
// fonts, muted purple palette.
// ---------------------------------------------------------------------------
const PORTAL_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>MIAW — Application Status</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0d0b1a;
      color: #e8e4f8;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 15px;
      line-height: 1.6;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px 24px 80px;
    }
    .wordmark {
      font-family: 'Courier New', Courier, monospace;
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.12em;
      margin-bottom: 48px;
      text-decoration: none;
    }
    .card {
      max-width: 560px;
      width: 100%;
    }
    .status-badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 100px;
      font-size: 11px;
      letter-spacing: 0.08em;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .badge-received, .badge-reviewed {
      background: rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      border: 1px solid rgba(255,255,255,0.15);
    }
    .badge-accepted {
      background: rgba(90,120,232,0.18);
      color: #a0b8f8;
      border: 1px solid rgba(90,120,232,0.4);
    }
    .badge-waitlisted {
      background: rgba(224,80,168,0.15);
      color: #e898d8;
      border: 1px solid rgba(224,80,168,0.3);
    }
    .badge-declined {
      background: rgba(255,255,255,0.05);
      color: rgba(255,255,255,0.45);
      border: 1px solid rgba(255,255,255,0.1);
    }
    .badge-enrolled {
      background: rgba(38,180,90,0.18);
      color: #5de893;
      border: 1px solid rgba(38,180,90,0.35);
      font-weight: 600;
    }
    h1 {
      font-size: 20px;
      font-weight: 500;
      color: #fff;
      margin-bottom: 10px;
    }
    .status-message {
      color: rgba(255,255,255,0.5);
      font-size: 14px;
      line-height: 1.65;
      margin-bottom: 32px;
    }
    hr {
      border: none;
      border-top: 1px solid rgba(255,255,255,0.1);
      margin: 28px 0;
    }
    .ack-label {
      font-size: 10px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 18px;
    }
    .ack-text p {
      color: #e0daf5;
      font-size: 15px;
      line-height: 1.75;
      margin-bottom: 18px;
    }
    .ack-text p:last-child { margin-bottom: 0; }
    .state-text {
      color: rgba(255,255,255,0.4);
      font-size: 14px;
    }
    .footer {
      margin-top: 56px;
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      text-align: center;
    }
    .footer a {
      color: rgba(255,255,255,0.35);
      text-decoration: underline;
    }
    @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  </style>
</head>
<body>
  <a class="wordmark" href="https://miaw.ai">miaw</a>
  <div class="card" id="portal-content">
    <p class="state-text">Loading&hellip;</p>
  </div>
  <div class="footer">
    <a href="https://miaw.ai">miaw.ai</a> &mdash; Master In Intelligent Artificial Worlds
  </div>
  <script>
    (function () {
      var token = new URLSearchParams(window.location.search).get('token');
      var el = document.getElementById('portal-content');

      function escHtml(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      }

      function renderError(msg) {
        el.innerHTML = '<p class="state-text">' + escHtml(msg) + '</p>';
      }

      if (!token) {
        renderError('No application token provided. Use the link from your confirmation email.');
        return;
      }

      var LABELS = {
        received:   'Under Review',
        reviewed:   'Under Review',
        accepted:   'Accepted',
        waitlisted: 'Waitlisted',
        declined:   'Application Complete',
        enrolled:   'Enrolled'
      };

      var MESSAGES = {
        received:   'Your application is with our admissions team. We will be in touch directly.',
        reviewed:   'Your application is with our admissions team. We will be in touch directly.',
        accepted:   'We would like to offer you a place in the MIAW cohort. Complete your enrollment below to confirm your place.',
        waitlisted: 'You are on our reserve list. We will reach out directly if a place opens up.',
        declined:   'Thank you for applying. We were not able to offer a place in this cohort, but we will keep you informed about future intake.',
        enrolled:   'Your enrollment is confirmed. We will be in touch with onboarding details before the cohort starts.'
      };

      // Check payment redirect query params (set by Stripe success/cancel URLs)
      var paymentResult = new URLSearchParams(window.location.search).get('payment');

      function renderPaymentBanner() {
        if (paymentResult === 'success') {
          return '<div style="background:rgba(38,180,90,0.12);border:1px solid rgba(38,180,90,0.35);border-radius:10px;padding:14px 18px;margin-bottom:20px;color:#5de893;font-size:14px;">'
            + '&#10003; Payment received — your enrollment is confirmed.'
            + '</div>';
        }
        if (paymentResult === 'cancelled') {
          return '<div style="background:rgba(232,90,90,0.1);border:1px solid rgba(232,90,90,0.3);border-radius:10px;padding:14px 18px;margin-bottom:20px;color:#f09090;font-size:14px;">'
            + 'Payment was not completed. Use the button below to try again.'
            + '</div>';
        }
        return '';
      }

      function renderPayButton(tok) {
        return '<button id="pay-btn" onclick="startPayment(\'' + tok.replace(/'/g, "\\'") + '\')" '
          + 'style="margin-top:20px;background:rgba(38,180,90,0.15);border:1px solid rgba(38,180,90,0.4);'
          + 'border-radius:8px;color:#5de893;font-size:14px;font-weight:500;padding:12px 24px;cursor:pointer;'
          + 'width:100%;transition:background 0.2s;" '
          + 'onmouseover="this.style.background=\'rgba(38,180,90,0.25)\'" '
          + 'onmouseout="this.style.background=\'rgba(38,180,90,0.15)\'">'
          + 'Complete enrollment &mdash; pay the enrollment fee &rarr;'
          + '</button>'
          + '<p style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px;text-align:center;">'
          + 'Secure payment via Stripe. Card or bank transfer accepted.'
          + '</p>';
      }

      function startPayment(tok) {
        var btn = document.getElementById('pay-btn');
        if (btn) { btn.textContent = 'Redirecting to payment\u2026'; btn.disabled = true; }
        fetch('/api/stripe/checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ statusToken: tok })
        })
          .then(function (r) { return r.json(); })
          .then(function (d) {
            if (d.url) {
              window.location.href = d.url;
            } else if (d.error === 'payment_not_configured') {
              el.innerHTML += '<p style="color:#f09090;margin-top:16px;font-size:14px;">'
                + 'Online payment is not yet configured. Please contact the admissions team directly to complete enrollment.'
                + '</p>';
            } else if (d.error === 'already_enrolled') {
              window.location.reload();
            } else {
              el.innerHTML += '<p style="color:#f09090;margin-top:16px;font-size:14px;">'
                + (d.message || 'Failed to initiate payment. Please try again or contact the admissions team.')
                + '</p>';
            }
          })
          .catch(function () {
            if (btn) { btn.textContent = 'Complete enrollment \u2014 pay the enrollment fee \u2192'; btn.disabled = false; }
            el.innerHTML += '<p style="color:#f09090;margin-top:16px;font-size:14px;">'
              + 'Network error. Please try again.'
              + '</p>';
          });
      }

      fetch('/api/apply/portal/' + encodeURIComponent(token))
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (d.error) {
            renderError('Application not found. The link may be incorrect or the token may have expired.');
            return;
          }

          var s = d.admissionsStatus || 'received';
          var label = LABELS[s] || s;
          var message = MESSAGES[s] || '';

          var html = renderPaymentBanner()
            + '<span class="status-badge badge-' + escHtml(s) + '">' + escHtml(label) + '</span>'
            + '<h1>Your MIAW Application</h1>'
            + '<p class="status-message">' + escHtml(message) + '</p>';

          // Show enrollment payment button for accepted-but-not-enrolled applicants
          if (s === 'accepted') {
            html += renderPayButton(token);
          }

          if (d.ack) {
            var paras = String(d.ack).split('\\n\\n').filter(Boolean);
            var ackHtml = paras.map(function (p) {
              return '<p>' + escHtml(p) + '</p>';
            }).join('');
            html += '<hr>'
              + '<p class="ack-label">From the admissions team</p>'
              + '<div class="ack-text">' + ackHtml + '</div>';
          }

          el.innerHTML = html;
        })
        .catch(function () {
          renderError('Unable to load your application status. Please try again in a moment.');
        });
    }());
  </script>
</body>
</html>`;

export default router;
