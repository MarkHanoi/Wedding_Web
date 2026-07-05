// ---------------------------------------------------------------------------
// sessions.ts — Conversation memory (cross-session, opt-in, GDPR-compliant)
//
// Users opt in at the CTA overlay ("Remember our conversation"). If they
// check the box, the client POSTs their conversation to this endpoint, which
// calls Claude to compress it into a 100–150 word summary and returns an
// opaque UUID token. The token is stored in the client's sessionStorage
// (not localStorage — it clears on browser close), not in a cookie.
//
// On the next visit, if the token is present in sessionStorage, the client
// GETs /api/sessions/:token, receives the summary, and includes it in the
// first /api/chat request as `sessionContext`. The server injects it as an
// additional system block so Claude recognises the returning visitor.
//
// Routes (all mounted under /api by app.ts):
//   POST /api/sessions          → create session (Claude call), return token
//   GET  /api/sessions/:token   → retrieve summary (404 if expired/missing)
// ---------------------------------------------------------------------------

import { Router } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { recordError } from "../lib/alerting";

const router = Router();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SESSION_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours
const CLAUDE_MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// In-memory session store
// Same graceful-degradation pattern as other routes — always active.
// A future Postgres migration can add a durable layer without changing the
// public contract (same token format, same TTL semantics).
// ---------------------------------------------------------------------------
interface SessionRecord {
  token: string;
  summary: string;
  visitorType: string;
  createdAt: number;
  expiresAt: number;
}

const sessionStore = new Map<string, SessionRecord>();

// Passive expiry sweep — runs every 10 minutes, non-blocking.
// .unref() prevents the timer from keeping the process alive.
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessionStore.entries()) {
    if (session.expiresAt <= now) {
      sessionStore.delete(token);
    }
  }
}, 10 * 60 * 1000).unref();

// ---------------------------------------------------------------------------
// Validation schemas
// ---------------------------------------------------------------------------
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(8000),
});

const CreateSessionSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
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
});

// ---------------------------------------------------------------------------
// POST /api/sessions
// Accepts the full qualification conversation (max 50 messages), calls Claude
// to summarise it into 100–150 words, stores the summary under an opaque UUID
// token with a 72-hour TTL, and returns the token.
//
// Rate: this endpoint triggers one Claude API call per submission. No
// per-endpoint rate limit here — the /api/chat rate limit (30/hr per IP)
// effectively limits how many full conversations a visitor can complete before
// they could call this endpoint.
// ---------------------------------------------------------------------------
router.post("/sessions", async (req, res) => {
  const parsed = CreateSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "invalid_request",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { messages, visitorType } = parsed.data;

  // Build a compact transcript — truncate long messages to stay within budget.
  const MAX_MSG_CHARS = 400;
  const transcript = messages
    .map(
      (m) =>
        `${m.role === "user" ? "VISITOR" : "MIAW"}: ${m.content.slice(0, MAX_MSG_CHARS)}${m.content.length > MAX_MSG_CHARS ? "…" : ""}`,
    )
    .join("\n");

  let summary: string;
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 300,
      system: `You write 100–150 word conversation summaries for returning visitor context. The visitor was talking to MIAW (Master In Intelligent Artificial Worlds), an AEC+AI postgraduate program.

Write in second person ("You are…") as if briefing the MIAW agent about this returning visitor. Be specific: mention their professional role, the projects or domains they discussed, what drew them to MIAW, and any questions they raised. This summary is injected into the first system turn of their next visit so the agent can greet them as a known person without asking them to repeat themselves.

Plain prose only. No bullet points. No headers. 100–150 words.`,
      messages: [
        {
          role: "user",
          content: `Summarise this conversation for returning visitor context:\n\n${transcript}`,
        },
      ],
    });

    summary =
      response.content[0]?.type === "text"
        ? response.content[0].text.trim()
        : "A returning visitor who had a previous conversation about MIAW.";
  } catch (err) {
    // Fallback — still create a session record with a generic summary rather
    // than failing the request. The visitor opted in; losing the session is
    // worse than a generic reminder.
    recordError("claude");
    req.log?.warn?.({ err }, "Session summary generation failed — using fallback");
    summary =
      `A returning visitor (visitor type: ${visitorType}) who had a previous conversation about MIAW and asked to be remembered for next time.`;
  }

  const token = randomUUID();
  const now = Date.now();
  const record: SessionRecord = {
    token,
    summary,
    visitorType,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  sessionStore.set(token, record);

  res.status(201).json({
    token,
    expiresAt: record.expiresAt,
  });
});

// ---------------------------------------------------------------------------
// GET /api/sessions/:token
// Returns the session summary for a known token. Returns 404 if the token is
// unknown or has passed its 72-hour TTL (client should clear sessionStorage
// and proceed as a new visitor).
// ---------------------------------------------------------------------------
router.get("/sessions/:token", (req, res) => {
  const token = String(req.params.token);
  const record = sessionStore.get(token);

  if (!record) {
    res.status(404).json({
      error: "not_found",
      message: "Session not found or has expired.",
    });
    return;
  }

  if (record.expiresAt <= Date.now()) {
    sessionStore.delete(token);
    res.status(404).json({
      error: "expired",
      message: "Session has expired. Please start a new conversation.",
    });
    return;
  }

  res.status(200).json({
    token: record.token,
    summary: record.summary,
    visitorType: record.visitorType,
    expiresAt: record.expiresAt,
  });
});

export default router;
