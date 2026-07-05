// ---------------------------------------------------------------------------
// admin.ts — Protected admin dashboard
//
// All endpoints require METRICS_TOKEN via:
//   Authorization: Bearer <token>   (API clients)
//   ?token=<token>                  (browser access)
//
// If METRICS_TOKEN is not set the server returns 503.
//
// Routes (all mounted under /api by app.ts):
//   GET  /admin                              → HTML dashboard (overview + analytics)
//   GET  /admin/applications/:id            → HTML application detail page
//   GET  /admin/applications/:id/summary    → AI-generated summary (HTML page, cached)
//   POST /admin/applications/:id/status     → Update admissions status, redirect
//   GET  /admin/cohort-report               → JSON cohort composition report
//   GET  /admin/waitlist.csv               → Waitlist CSV download
//   GET  /admin/applications.csv           → Applications CSV download
// ---------------------------------------------------------------------------

import { Router, type Request, type Response, type NextFunction } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { waitlistEntries, type WaitlistEntry } from "./waitlist";
import { applicationStore, type ApplicationRecord } from "./apply";
import { sendStatusUpdateEmail } from "../lib/email";

const router = Router();

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const ADMISSIONS_STATUSES = [
  "received",
  "reviewed",
  "accepted",
  "waitlisted",
  "declined",
  // "enrolled" is set by the Stripe webhook on successful payment, or manually
  // by admissions for offline payments (bank transfer, etc.).
  "enrolled",
] as const;

type AdmissionsStatus = (typeof ADMISSIONS_STATUSES)[number];

const CLAUDE_MODEL = "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// Auth middleware
// ---------------------------------------------------------------------------
function checkAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = process.env.METRICS_TOKEN;

  if (!secret) {
    res
      .status(503)
      .type("text")
      .send(
        "Admin dashboard is not enabled. Set the METRICS_TOKEN environment variable to enable it.",
      );
    return;
  }

  const authHeader = req.headers.authorization ?? "";
  const headerToken = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : "";
  const queryToken =
    typeof req.query.token === "string" ? req.query.token : "";

  if (headerToken !== secret && queryToken !== secret) {
    res
      .status(401)
      .type("text")
      .send(
        "Unauthorized. Provide the METRICS_TOKEN via Authorization: Bearer header or ?token= query parameter.",
      );
    return;
  }

  next();
}

// ---------------------------------------------------------------------------
// HTML helpers
// ---------------------------------------------------------------------------
function escHtml(s: string | number | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeUrl(url: string): string {
  const lower = url.toLowerCase().trimStart();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) return "#";
  return url;
}

function fmtDate(ts: number): string {
  return new Date(ts).toISOString().replace("T", " ").slice(0, 19);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function reviewFlagHtml(fitScore: number): string {
  if (fitScore >= 4)
    return '<span class="flag-strong">↑ Strong</span>';
  if (fitScore > 0 && fitScore <= 2)
    return '<span class="flag-consider">⚑ Review</span>';
  return '<span class="muted">—</span>';
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------
function csvField(v: string | number | undefined): string {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildWaitlistCsv(entries: WaitlistEntry[]): string {
  const headers = [
    "Email",
    "Visitor Type",
    "Conversation Turns",
    "Referrer",
    "Submitted At",
  ];
  const rows = [...entries]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((e) =>
      [
        e.email,
        e.visitorType,
        e.conversationLength,
        e.referrer ?? "",
        new Date(e.createdAt).toISOString(),
      ]
        .map(csvField)
        .join(","),
    );
  return [headers.join(","), ...rows].join("\r\n");
}

function buildApplicationsCsv(apps: ApplicationRecord[]): string {
  const headers = [
    "Application ID",
    "Email",
    "Visitor Type",
    "Fit Score",
    "Fit Rationale",
    "Review Flag",
    "Admissions Status",
    "Portfolio URL",
    "Application Turns",
    "Background",
    "Motivations",
    "Concerns Expressed",
    "Key Quotes",
    "Recommended Follow-Up",
    "Submitted At",
  ];
  const rows = [...apps]
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((a) => {
      const fit = a.extracted?.fitScore ?? 0;
      const flag = fit >= 4 ? "strong" : fit > 0 && fit <= 2 ? "consider" : "";
      return [
        a.id,
        a.email,
        a.visitorType,
        fit || "",
        a.extracted?.fitRationale ?? "",
        flag,
        a.admissionsStatus,
        a.portfolioUrl ?? "",
        a.applicationMessages.filter((m) => m.role === "user").length,
        a.extracted?.background ?? "",
        a.extracted?.motivations ?? "",
        a.extracted?.concernsExpressed ?? "",
        (a.extracted?.keyQuotes ?? []).join(" | "),
        a.extracted?.recommendedFollowUpQuestion ?? "",
        new Date(a.createdAt).toISOString(),
      ]
        .map(csvField)
        .join(",");
    });
  return [headers.join(","), ...rows].join("\r\n");
}

// ---------------------------------------------------------------------------
// Cohort report — pure data computation, no Claude calls
// ---------------------------------------------------------------------------
interface WeekBucket {
  weekStart: string;
  count: number;
}

interface CohortReport {
  generatedAt: number;
  totalApplications: number;
  totalWaitlist: number;
  completedApplications: number;
  processingApplications: number;
  errorApplications: number;
  visitorTypeDistribution: Record<string, number>;
  fitScoreHistogram: Record<string, number>;
  averageFitScore: number;
  strongApplications: number;
  considerApplications: number;
  statusDistribution: Record<string, number>;
  applicationsByWeek: WeekBucket[];
  waitlistByWeek: WeekBucket[];
  averageApplicationTurns: number;
  averageQualificationTurns: number;
}

function groupByWeek(timestamps: number[]): WeekBucket[] {
  const weekMap = new Map<string, number>();
  for (const ts of timestamps) {
    const dayOfWeek = new Date(ts).getUTCDay(); // 0 = Sunday
    const weekStartMs = ts - dayOfWeek * 86_400_000;
    const key = new Date(weekStartMs).toISOString().split("T")[0] ?? "";
    weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
  }
  return [...weekMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, count]) => ({ weekStart, count }));
}

function buildCohortReport(): CohortReport {
  const apps = [...applicationStore.values()];

  // Visitor type distribution
  const visitorTypeDistribution: Record<string, number> = {};
  for (const app of apps) {
    visitorTypeDistribution[app.visitorType] =
      (visitorTypeDistribution[app.visitorType] ?? 0) + 1;
  }

  // Fit score histogram — only apps with extracted profiles
  const fitScoreHistogram: Record<string, number> = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  };
  let fitSum = 0;
  let fitCount = 0;
  for (const app of apps) {
    if (app.extracted?.fitScore) {
      const score = app.extracted.fitScore;
      const key = String(score);
      fitScoreHistogram[key] = (fitScoreHistogram[key] ?? 0) + 1;
      fitSum += score;
      fitCount++;
    }
  }

  // Status distribution
  const statusDistribution: Record<string, number> = {};
  for (const app of apps) {
    statusDistribution[app.admissionsStatus] =
      (statusDistribution[app.admissionsStatus] ?? 0) + 1;
  }

  // Average turns
  const avgAppTurns =
    apps.length > 0
      ? apps.reduce(
          (s, a) =>
            s + a.applicationMessages.filter((m) => m.role === "user").length,
          0,
        ) / apps.length
      : 0;
  const avgQualTurns =
    apps.length > 0
      ? apps.reduce(
          (s, a) =>
            s +
            a.qualificationMessages.filter((m) => m.role === "user").length,
          0,
        ) / apps.length
      : 0;

  return {
    generatedAt: Date.now(),
    totalApplications: apps.length,
    totalWaitlist: waitlistEntries.length,
    completedApplications: apps.filter((a) => a.status === "complete").length,
    processingApplications: apps.filter((a) => a.status === "processing")
      .length,
    errorApplications: apps.filter((a) => a.status === "error").length,
    visitorTypeDistribution,
    fitScoreHistogram,
    averageFitScore:
      fitCount > 0 ? Math.round((fitSum / fitCount) * 10) / 10 : 0,
    strongApplications: apps.filter(
      (a) => (a.extracted?.fitScore ?? 0) >= 4,
    ).length,
    considerApplications: apps.filter((a) => {
      const s = a.extracted?.fitScore ?? 0;
      return s > 0 && s <= 2;
    }).length,
    statusDistribution,
    applicationsByWeek: groupByWeek(apps.map((a) => a.createdAt)),
    waitlistByWeek: groupByWeek(waitlistEntries.map((w) => w.createdAt)),
    averageApplicationTurns: Math.round(avgAppTurns * 10) / 10,
    averageQualificationTurns: Math.round(avgQualTurns * 10) / 10,
  };
}

// ---------------------------------------------------------------------------
// AI summary generation — calls Claude, caches result on the record
// ---------------------------------------------------------------------------
async function generateApplicantSummary(
  app: ApplicationRecord,
): Promise<{ summary: string; cached: boolean }> {
  // Return cached summary if already generated
  if (app.aiSummary) {
    return { summary: app.aiSummary, cached: true };
  }

  // Build transcript (truncate individual messages to stay within token budget)
  const MAX_MSG_CHARS = 600;
  const transcriptParts: string[] = [];

  if (app.qualificationMessages.length > 0) {
    transcriptParts.push("=== QUALIFICATION CONVERSATION ===");
    for (const m of app.qualificationMessages) {
      transcriptParts.push(
        `${m.role.toUpperCase()}: ${m.content.slice(0, MAX_MSG_CHARS)}${m.content.length > MAX_MSG_CHARS ? "…" : ""}`,
      );
    }
  }

  if (app.applicationMessages.length > 0) {
    transcriptParts.push("\n=== APPLICATION INTERVIEW ===");
    for (const m of app.applicationMessages) {
      transcriptParts.push(
        `${m.role.toUpperCase()}: ${m.content.slice(0, MAX_MSG_CHARS)}${m.content.length > MAX_MSG_CHARS ? "…" : ""}`,
      );
    }
  }

  const transcript =
    transcriptParts.join("\n") || "No conversation transcript available.";

  // Build extracted profile context
  const profileLines: string[] = [
    `Email: ${app.email}`,
    `Visitor type: ${app.visitorType}`,
  ];
  if (app.extracted) {
    const ex = app.extracted;
    profileLines.push(
      `Fit score (AI-assigned): ${ex.fitScore}/5`,
      `Fit rationale: ${ex.fitRationale}`,
      `Background: ${ex.background}`,
      `Technical self-assessment: ${ex.selfAssessedTechnicalLevel}`,
      `Project types mentioned: ${ex.statedProjectTypes.join(", ") || "none stated"}`,
      `Motivations: ${ex.motivations}`,
      `Concerns expressed: ${ex.concernsExpressed}`,
      `Key quotes: ${ex.keyQuotes.map((q) => `"${q}"`).join(" | ") || "none captured"}`,
      `Recommended follow-up question: ${ex.recommendedFollowUpQuestion}`,
    );
  } else {
    profileLines.push("Extracted profile: not available (application may still be processing).");
  }

  const profileContext = profileLines.join("\n");

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 450,
    system: `You are a concise, professional admissions reviewer for MIAW (Master In Intelligent Artificial Worlds) — a postgraduate program at the intersection of spatial AI and architectural practice, for architects, engineers, and AI practitioners.

Write a 150–200 word plain-language summary of the applicant. Write in flowing prose (no bullet points, no headers). Cover:
1. Their professional background and current practice
2. What drew them to apply and what they want from the program
3. Their technical level based on what they shared (explicitly and implicitly)
4. Key fit signals — both strengths and any concerns
5. One direct closing sentence on the strength of this candidacy

Be direct and useful to a human admissions reviewer. Do not be vague or use boilerplate phrases.`,
    messages: [
      {
        role: "user",
        content: `Applicant profile:\n${profileContext}\n\nConversation transcript:\n${transcript}`,
      },
    ],
  });

  const rawSummary =
    response.content[0]?.type === "text"
      ? response.content[0].text.trim()
      : "Summary generation failed — Claude returned an unexpected response format.";

  // Cache the result on the application record
  app.aiSummary = rawSummary;
  applicationStore.set(app.id, app);

  return { summary: rawSummary, cached: false };
}

// ---------------------------------------------------------------------------
// Shared admin CSS
// ---------------------------------------------------------------------------
const ADMIN_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  body {
    background: #0d0b1a; color: #e8e4f8;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    margin: 0; padding: 0; -webkit-font-smoothing: antialiased;
  }
  .container { max-width: 1320px; margin: 0 auto; padding: 0 24px 56px; }

  header {
    display: flex; align-items: baseline; gap: 10px;
    padding: 24px 0 18px; border-bottom: 1px solid rgba(255,255,255,0.09);
    margin-bottom: 28px;
  }
  .wordmark {
    font-family: 'Courier New', Courier, monospace; font-size: 18px;
    font-weight: 700; color: #fff; letter-spacing: 0.12em;
    text-decoration: none;
  }
  .header-sep { color: rgba(255,255,255,0.25); font-size: 13px; }
  .header-sub { color: rgba(255,255,255,0.40); font-size: 13px; }
  .header-updated {
    margin-left: auto; color: rgba(255,255,255,0.25);
    font-size: 11px; font-family: 'Courier New', monospace;
  }
  .header-actions { display: flex; gap: 12px; align-items: center; }

  .stats { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
  .stat {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 10px; padding: 18px 24px; min-width: 140px;
  }
  .stat-val { font-size: 34px; font-weight: 700; color: #fff; line-height: 1; }
  .stat-val.strong { color: #22c55e; }
  .stat-val.consider { color: #f87171; }
  .stat-lbl {
    font-size: 11px; color: rgba(255,255,255,0.38); margin-top: 7px;
    text-transform: uppercase; letter-spacing: 0.07em; font-weight: 500;
  }

  .analytics-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
    margin-bottom: 36px;
  }
  .analytics-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 16px 20px;
  }
  .analytics-card h3 {
    font-size: 10px; font-weight: 600;
    color: rgba(255,255,255,0.35); text-transform: uppercase;
    letter-spacing: 0.1em; margin: 0 0 14px;
  }
  .hist-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
  .hist-label {
    font-size: 11px; color: rgba(255,255,255,0.45);
    min-width: 26px; text-align: right; font-family: 'Courier New', monospace;
  }
  .hist-bar-wrap {
    flex: 1; height: 12px;
    background: rgba(255,255,255,0.04); border-radius: 2px; overflow: hidden;
  }
  .hist-bar {
    height: 100%;
    background: linear-gradient(90deg, #5a78e8, #8e72d5);
    border-radius: 2px; min-width: 0;
  }
  .hist-count {
    font-size: 11px; color: rgba(255,255,255,0.35);
    min-width: 18px; text-align: right;
    font-family: 'Courier New', monospace;
  }
  .dist-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 4px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
    font-size: 12px;
  }
  .dist-row:last-child { border-bottom: none; }
  .dist-label { color: rgba(255,255,255,0.50); }
  .dist-val { color: rgba(255,255,255,0.80); font-weight: 500; font-family: 'Courier New', monospace; }

  section { margin-bottom: 44px; }
  .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  h2 {
    font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.45);
    text-transform: uppercase; letter-spacing: 0.11em; margin: 0;
  }
  .count {
    background: rgba(255,255,255,0.09); border-radius: 100px;
    padding: 2px 9px; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.55);
  }
  .btn-csv {
    font-size: 11px; color: rgba(255,255,255,0.38);
    text-decoration: underline; text-underline-offset: 2px; cursor: pointer;
  }
  .btn-csv:hover { color: rgba(255,255,255,0.65); }
  .btn-report {
    margin-left: auto; font-size: 11px; color: rgba(122,178,248,0.55);
    text-decoration: none;
  }
  .btn-report:hover { color: #7ab2f8; }

  .table-wrap {
    border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
    overflow: hidden; overflow-x: auto;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 900px; }
  thead tr { background: rgba(255,255,255,0.025); }
  th {
    padding: 10px 14px; text-align: left; font-size: 10px;
    color: rgba(255,255,255,0.32); text-transform: uppercase;
    letter-spacing: 0.09em; font-weight: 600;
    border-bottom: 1px solid rgba(255,255,255,0.08); white-space: nowrap;
  }
  td { padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.045); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tbody tr:hover td { background: rgba(255,255,255,0.018); }

  .badge {
    display: inline-flex; align-items: center; justify-content: center;
    border-radius: 5px; padding: 2px 9px; font-size: 11px; font-weight: 700; white-space: nowrap;
  }
  .badge-1 { background: #ef4444; color: #fff; }
  .badge-2 { background: #f97316; color: #fff; }
  .badge-3 { background: #eab308; color: #000; }
  .badge-4 { background: #22c55e; color: #fff; }
  .badge-5 { background: #8b5cf6; color: #fff; }
  .type-badge {
    display: inline-block; background: rgba(142,114,213,0.14);
    color: #a78bfa; border-radius: 4px; padding: 1px 7px;
    font-size: 11px; font-weight: 500;
  }
  .flag-strong {
    display: inline-block; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: #22c55e; background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.25); border-radius: 4px;
    padding: 2px 6px; white-space: nowrap;
  }
  .flag-consider {
    display: inline-block; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.07em;
    color: #f87171; background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.25); border-radius: 4px;
    padding: 2px 6px; white-space: nowrap;
  }
  .status-badge {
    display: inline-block; border-radius: 4px; padding: 1px 7px;
    font-size: 11px; font-weight: 500;
  }
  .status-received { background: rgba(122,178,248,0.12); color: #7ab2f8; }
  .status-reviewed { background: rgba(234,179,8,0.12); color: #eab308; }
  .status-accepted { background: rgba(34,197,94,0.12); color: #22c55e; }
  .status-waitlisted { background: rgba(249,115,22,0.12); color: #f97316; }
  .status-declined { background: rgba(239,68,68,0.12); color: #f87171; }
  .status-enrolled { background: rgba(38,180,90,0.20); color: #26b45a; font-weight: 600; }

  select {
    background: rgba(255,255,255,0.06); color: #e8e4f8;
    border: 1px solid rgba(255,255,255,0.16); border-radius: 5px;
    padding: 4px 8px; font-size: 12px; cursor: pointer; outline: none;
  }
  select:hover, select:focus { border-color: rgba(255,255,255,0.30); }
  select option { background: #1a1730; color: #e8e4f8; }

  a { color: #7ab2f8; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .link-dim { color: rgba(122,178,248,0.50); font-size: 11px; }
  .link-dim:hover { color: #7ab2f8; }
  .mono { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: rgba(255,255,255,0.50); }
  .muted { color: rgba(255,255,255,0.22); }
  .empty { padding: 30px 14px; text-align: center; color: rgba(255,255,255,0.22); font-size: 13px; }

  /* Detail page specific */
  .detail-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 28px;
  }
  .detail-field { margin-bottom: 12px; }
  .detail-label {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35);
    text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px;
  }
  .detail-val { font-size: 14px; color: #e8e4f8; }
  .summary-box {
    background: rgba(90,120,232,0.07); border: 1px solid rgba(90,120,232,0.20);
    border-radius: 10px; padding: 20px 24px; margin-bottom: 28px;
  }
  .summary-gen-badge {
    display: inline-block; font-size: 10px; font-weight: 600;
    color: rgba(122,178,248,0.7); background: rgba(122,178,248,0.08);
    border: 1px solid rgba(122,178,248,0.15); border-radius: 4px;
    padding: 2px 7px; margin-bottom: 12px; text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .summary-text { font-size: 14px; line-height: 1.75; color: rgba(240,238,255,0.88); margin: 0; }
  .summary-cached { font-size: 10px; color: rgba(255,255,255,0.25); margin-top: 10px; }
  .profile-card {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 10px; padding: 18px 20px; margin-bottom: 16px;
  }
  .profile-card h3 {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35);
    text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 12px;
  }
  .quote-item {
    border-left: 2px solid rgba(142,114,213,0.4);
    padding-left: 12px; margin-bottom: 8px;
    font-size: 13px; color: rgba(240,238,255,0.72); font-style: italic;
  }
  .transcript-section { margin-top: 28px; }
  .transcript-section h3 {
    font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.35);
    text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 14px;
  }
  .msg {
    margin-bottom: 10px; padding: 10px 14px;
    border-radius: 7px; font-size: 13px; line-height: 1.6;
  }
  .msg-user { background: rgba(255,255,255,0.04); }
  .msg-assistant { background: rgba(90,120,232,0.08); }
  .msg-role {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; margin-bottom: 4px;
    color: rgba(255,255,255,0.30);
  }
  .msg-content { color: rgba(240,238,255,0.80); white-space: pre-wrap; }
  .action-bar {
    display: flex; gap: 12px; align-items: center;
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px; padding: 14px 18px; margin-bottom: 28px;
  }
  .action-label {
    font-size: 11px; color: rgba(255,255,255,0.38);
    text-transform: uppercase; letter-spacing: 0.08em; margin-right: 4px;
  }
  .btn-back {
    font-size: 12px; color: rgba(255,255,255,0.40); text-decoration: none;
  }
  .btn-back:hover { color: rgba(255,255,255,0.70); }

  footer {
    padding: 20px 0; border-top: 1px solid rgba(255,255,255,0.08);
    color: rgba(255,255,255,0.22); font-size: 11px;
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  footer a { color: rgba(255,255,255,0.32); text-decoration: underline; }

  @media (max-width: 700px) {
    .analytics-grid { grid-template-columns: 1fr; }
    .detail-grid { grid-template-columns: 1fr; }
    .stats { gap: 10px; }
    .stat { min-width: 110px; padding: 14px 16px; }
    .stat-val { font-size: 26px; }
  }
`.trim();

// ---------------------------------------------------------------------------
// Main admin dashboard HTML
// ---------------------------------------------------------------------------
function buildAdminHtml(token: string): string {
  const entries = [...waitlistEntries].sort((a, b) => b.createdAt - a.createdAt);
  const apps = [...applicationStore.values()].sort(
    (a, b) => b.createdAt - a.createdAt,
  );
  const report = buildCohortReport();
  const now = new Date().toUTCString();
  const safeToken = encodeURIComponent(token);

  // ----- Fit score histogram bars -----
  const maxHistCount = Math.max(
    1,
    ...Object.values(report.fitScoreHistogram).map(Number),
  );
  const histRows = [5, 4, 3, 2, 1]
    .map((score) => {
      const count = report.fitScoreHistogram[String(score)] ?? 0;
      const pct = Math.round((count / maxHistCount) * 100);
      return `<div class="hist-row">
        <span class="hist-label">${score}</span>
        <div class="hist-bar-wrap"><div class="hist-bar" style="width:${pct}%"></div></div>
        <span class="hist-count">${count}</span>
      </div>`;
    })
    .join("\n");

  // ----- Visitor type distribution -----
  const sortedTypes = Object.entries(report.visitorTypeDistribution).sort(
    ([, a], [, b]) => b - a,
  );
  const typeRows =
    sortedTypes.length === 0
      ? `<div class="dist-row"><span class="dist-label muted">No data yet</span></div>`
      : sortedTypes
          .map(
            ([type, count]) =>
              `<div class="dist-row">
          <span class="dist-label">${escHtml(type)}</span>
          <span class="dist-val">${count}</span>
        </div>`,
          )
          .join("\n");

  // ----- Waitlist rows -----
  const waitlistRows =
    entries.length === 0
      ? `<tr><td colspan="5" class="empty">No waitlist entries yet.</td></tr>`
      : entries
          .map(
            (e) => `
      <tr>
        <td>${escHtml(e.email)}</td>
        <td><span class="type-badge">${escHtml(e.visitorType)}</span></td>
        <td>${e.conversationLength}</td>
        <td>${e.referrer ? `<span class="mono">${escHtml(e.referrer.slice(0, 60))}</span>` : "<span class='muted'>—</span>"}</td>
        <td class="mono">${fmtDate(e.createdAt)}</td>
      </tr>`,
          )
          .join("\n");

  // ----- Application rows -----
  const appRows =
    apps.length === 0
      ? `<tr><td colspan="10" class="empty">No applications yet.</td></tr>`
      : apps
          .map((a) => {
            const fit = a.extracted?.fitScore ?? 0;
            const turns = a.applicationMessages.filter(
              (m) => m.role === "user",
            ).length;
            const statusOpts = ADMISSIONS_STATUSES.map(
              (s) =>
                `<option value="${s}"${a.admissionsStatus === s ? " selected" : ""}>${capitalize(s)}</option>`,
            ).join("");
            const portfolioCell = a.portfolioUrl
              ? `<a href="${escHtml(safeUrl(a.portfolioUrl))}" target="_blank" rel="noopener noreferrer">link ↗</a>`
              : `<span class="muted">—</span>`;
            const summaryLink = `<a href="/api/admin/applications/${encodeURIComponent(a.id)}/summary?token=${safeToken}" class="link-dim" target="_blank">view →</a>`;
            const detailLink = `<a href="/api/admin/applications/${encodeURIComponent(a.id)}?token=${safeToken}" class="link-dim" target="_blank">${escHtml(a.id.slice(0, 8))}</a>`;

            return `
      <tr>
        <td class="mono">${detailLink}</td>
        <td>${escHtml(a.email)}</td>
        <td><span class="type-badge">${escHtml(a.visitorType)}</span></td>
        <td>${fit > 0 ? `<span class="badge badge-${fit}">${fit}/5</span>` : `<span class="muted">—</span>`}</td>
        <td>${reviewFlagHtml(fit)}</td>
        <td>
          <form action="/api/admin/applications/${encodeURIComponent(a.id)}/status?token=${safeToken}" method="POST" style="display:inline">
            <select name="status" onchange="this.form.submit()" title="Update admissions status">
              ${statusOpts}
            </select>
          </form>
        </td>
        <td>${portfolioCell}</td>
        <td>${turns}</td>
        <td>${summaryLink}</td>
        <td class="mono">${fmtDate(a.createdAt)}</td>
      </tr>`;
          })
          .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MIAW Admin</title>
  <style>${ADMIN_CSS}</style>
</head>
<body>
<div class="container">

  <header>
    <a href="/api/admin?token=${safeToken}" class="wordmark">miaw</a>
    <span class="header-sep">·</span>
    <span class="header-sub">admin</span>
    <span class="header-updated">${escHtml(now)}</span>
  </header>

  <div class="stats">
    <div class="stat">
      <div class="stat-val">${entries.length}</div>
      <div class="stat-lbl">Waitlist</div>
    </div>
    <div class="stat">
      <div class="stat-val">${apps.length}</div>
      <div class="stat-lbl">Applications</div>
    </div>
    <div class="stat">
      <div class="stat-val">${apps.filter((a) => a.admissionsStatus === "received").length}</div>
      <div class="stat-lbl">Pending review</div>
    </div>
    <div class="stat">
      <div class="stat-val strong">${report.strongApplications}</div>
      <div class="stat-lbl">Strong (4–5)</div>
    </div>
    <div class="stat">
      <div class="stat-val consider">${report.considerApplications}</div>
      <div class="stat-lbl">Consider (1–2)</div>
    </div>
    <div class="stat">
      <div class="stat-val">${report.averageFitScore > 0 ? report.averageFitScore.toFixed(1) : "—"}</div>
      <div class="stat-lbl">Avg fit score</div>
    </div>
  </div>

  <div class="analytics-grid">
    <div class="analytics-card">
      <h3>Fit Score Distribution</h3>
      ${apps.length === 0 ? `<div class="muted" style="font-size:12px">No applications yet.</div>` : histRows}
    </div>
    <div class="analytics-card">
      <h3>Visitor Type Breakdown</h3>
      ${typeRows}
    </div>
  </div>

  <section>
    <div class="section-head">
      <h2>Waitlist <span class="count">${entries.length}</span></h2>
      <a href="/api/admin/waitlist.csv?token=${safeToken}" class="btn-csv">↓ CSV</a>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Type</th>
            <th>Turns</th>
            <th>Referrer</th>
            <th>Submitted (UTC)</th>
          </tr>
        </thead>
        <tbody>${waitlistRows}</tbody>
      </table>
    </div>
  </section>

  <section>
    <div class="section-head">
      <h2>Applications <span class="count">${apps.length}</span></h2>
      <a href="/api/admin/applications.csv?token=${safeToken}" class="btn-csv">↓ CSV</a>
      <a href="/api/admin/cohort-report?token=${safeToken}" class="btn-report" target="_blank">Cohort report JSON →</a>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Type</th>
            <th>Fit</th>
            <th>Flag</th>
            <th>Status</th>
            <th>Portfolio</th>
            <th>Turns</th>
            <th>Summary</th>
            <th>Submitted (UTC)</th>
          </tr>
        </thead>
        <tbody>${appRows}</tbody>
      </table>
    </div>
  </section>

  <footer>
    <span>MIAW Admin · Protected by METRICS_TOKEN</span>
    <a href="/api/admin/cohort-report?token=${safeToken}" target="_blank">Cohort report →</a>
    <a href="https://miaw.ai" target="_blank" rel="noopener">miaw.ai ↗</a>
  </footer>

</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Application detail + AI summary page HTML
// ---------------------------------------------------------------------------
function buildApplicationDetailHtml(
  app: ApplicationRecord,
  summary: string,
  cached: boolean,
  token: string,
): string {
  const safeToken = encodeURIComponent(token);
  const fit = app.extracted?.fitScore ?? 0;

  // Status update form options
  const statusOpts = ADMISSIONS_STATUSES.map(
    (s) =>
      `<option value="${s}"${app.admissionsStatus === s ? " selected" : ""}>${capitalize(s)}</option>`,
  ).join("");

  // Extracted profile section
  let profileHtml = "";
  if (app.extracted) {
    const ex = app.extracted;
    profileHtml = `
    <div class="profile-card">
      <h3>Extracted Profile</h3>
      <div class="detail-grid">
        <div>
          <div class="detail-field">
            <div class="detail-label">Background</div>
            <div class="detail-val">${escHtml(ex.background) || "<span class='muted'>—</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Technical Level</div>
            <div class="detail-val">${escHtml(ex.selfAssessedTechnicalLevel) || "<span class='muted'>—</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Project Types</div>
            <div class="detail-val">${ex.statedProjectTypes.length > 0 ? escHtml(ex.statedProjectTypes.join(", ")) : "<span class='muted'>none stated</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Fit Score</div>
            <div class="detail-val">${fit > 0 ? `<span class="badge badge-${fit}">${fit}/5</span> &nbsp; ${reviewFlagHtml(fit)}` : "<span class='muted'>—</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Fit Rationale</div>
            <div class="detail-val">${escHtml(ex.fitRationale) || "<span class='muted'>—</span>"}</div>
          </div>
        </div>
        <div>
          <div class="detail-field">
            <div class="detail-label">Motivations</div>
            <div class="detail-val">${escHtml(ex.motivations) || "<span class='muted'>—</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Concerns Expressed</div>
            <div class="detail-val">${escHtml(ex.concernsExpressed) || "<span class='muted'>none expressed</span>"}</div>
          </div>
          <div class="detail-field">
            <div class="detail-label">Recommended Follow-Up</div>
            <div class="detail-val" style="color:#7ab2f8">${escHtml(ex.recommendedFollowUpQuestion) || "<span class='muted'>—</span>"}</div>
          </div>
        </div>
      </div>
      ${ex.keyQuotes.length > 0 ? `
      <div class="detail-label" style="margin-bottom:8px">Key Quotes</div>
      ${ex.keyQuotes.map((q) => `<div class="quote-item">${escHtml(q)}</div>`).join("\n")}` : ""}
    </div>`;
  }

  // Conversation transcript
  function renderMessages(
    messages: Array<{ role: string; content: string }>,
    label: string,
  ): string {
    if (messages.length === 0) return "";
    return `
    <div class="transcript-section">
      <h3>${label}</h3>
      ${messages
        .map(
          (m) => `<div class="msg msg-${m.role}">
        <div class="msg-role">${m.role}</div>
        <div class="msg-content">${escHtml(m.content)}</div>
      </div>`,
        )
        .join("\n")}
    </div>`;
  }

  const portfolioHtml = app.portfolioUrl
    ? `<a href="${escHtml(safeUrl(app.portfolioUrl))}" target="_blank" rel="noopener">${escHtml(app.portfolioUrl)}</a>`
    : "<span class='muted'>—</span>";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Application ${app.id.slice(0, 8)} — MIAW Admin</title>
  <style>${ADMIN_CSS}</style>
</head>
<body>
<div class="container">

  <header>
    <a href="/api/admin?token=${safeToken}" class="wordmark">miaw</a>
    <span class="header-sep">·</span>
    <span class="header-sub">application detail</span>
    <a href="/api/admin?token=${safeToken}" class="btn-back" style="margin-left:auto">← Back to dashboard</a>
  </header>

  <div class="action-bar">
    <span class="action-label">Status</span>
    <form action="/api/admin/applications/${encodeURIComponent(app.id)}/status?token=${safeToken}" method="POST" style="display:inline">
      <select name="status" onchange="this.form.submit()">
        ${statusOpts}
      </select>
    </form>
    <span style="margin-left:auto; font-size:11px; color:rgba(255,255,255,0.25)">
      ID: <span class="mono">${escHtml(app.id)}</span>
    </span>
  </div>

  <div class="detail-grid" style="margin-bottom:28px">
    <div>
      <div class="detail-field">
        <div class="detail-label">Email</div>
        <div class="detail-val">${escHtml(app.email)}</div>
      </div>
      <div class="detail-field">
        <div class="detail-label">Visitor Type</div>
        <div class="detail-val"><span class="type-badge">${escHtml(app.visitorType)}</span></div>
      </div>
      <div class="detail-field">
        <div class="detail-label">Portfolio</div>
        <div class="detail-val">${portfolioHtml}</div>
      </div>
    </div>
    <div>
      <div class="detail-field">
        <div class="detail-label">Submitted</div>
        <div class="detail-val mono">${fmtDate(app.createdAt)}</div>
      </div>
      <div class="detail-field">
        <div class="detail-label">Processing Status</div>
        <div class="detail-val">${escHtml(app.status)}</div>
      </div>
      <div class="detail-field">
        <div class="detail-label">GDPR Consent</div>
        <div class="detail-val mono">${app.gdprConsent ? fmtDate(app.gdprConsentAt) : "not given"}</div>
      </div>
    </div>
  </div>

  <div class="summary-box">
    <div class="summary-gen-badge">AI Admissions Summary</div>
    <p class="summary-text">${escHtml(summary)}</p>
    <div class="summary-cached">${cached ? "Cached summary" : "Freshly generated"} · ${new Date().toUTCString()}</div>
  </div>

  ${profileHtml}

  ${renderMessages(app.qualificationMessages, "Qualification Conversation")}
  ${renderMessages(app.applicationMessages, "Application Interview")}

  <footer>
    <span>MIAW Admin · Protected by METRICS_TOKEN</span>
    <a href="/api/admin?token=${safeToken}">← Dashboard</a>
  </footer>

</div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// GET /admin — HTML dashboard
// ---------------------------------------------------------------------------
router.get("/admin", checkAdminAuth, (_req, res) => {
  const token =
    typeof _req.query.token === "string" ? _req.query.token : "";
  res.status(200).type("html").send(buildAdminHtml(token));
});

// ---------------------------------------------------------------------------
// GET /admin/applications/:id — Application detail page (no Claude call)
// Redirects to the summary page which includes all detail + AI summary.
// ---------------------------------------------------------------------------
router.get("/admin/applications/:id", checkAdminAuth, (_req, res) => {
  const token =
    typeof _req.query.token === "string" ? _req.query.token : "";
  const id = String(_req.params.id);
  res.redirect(
    302,
    `/api/admin/applications/${encodeURIComponent(id)}/summary?token=${encodeURIComponent(token)}`,
  );
});

// ---------------------------------------------------------------------------
// GET /admin/applications/:id/summary — AI-generated summary (HTML, cached)
// Calls Claude on first request; returns cached result on subsequent requests.
// ---------------------------------------------------------------------------
router.get(
  "/admin/applications/:id/summary",
  checkAdminAuth,
  async (req, res) => {
    const token =
      typeof req.query.token === "string" ? req.query.token : "";
    const id = String(req.params.id);
    const app = applicationStore.get(id);

    if (!app) {
      res.status(404).type("text").send(`Application not found: ${escHtml(id)}`);
      return;
    }

    // Honour ?format=json for API consumers
    const wantsJson =
      req.query.format === "json" ||
      (req.headers.accept ?? "").includes("application/json");

    try {
      const { summary, cached } = await generateApplicantSummary(app);

      if (wantsJson) {
        res.status(200).json({
          applicationId: app.id,
          email: app.email,
          visitorType: app.visitorType,
          fitScore: app.extracted?.fitScore ?? null,
          fitRationale: app.extracted?.fitRationale ?? null,
          recommendedFollowUpQuestion:
            app.extracted?.recommendedFollowUpQuestion ?? null,
          summary,
          cached,
          generatedAt: Date.now(),
        });
      } else {
        res
          .status(200)
          .type("html")
          .send(buildApplicationDetailHtml(app, summary, cached, token));
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown error during summary generation";
      if (wantsJson) {
        res.status(500).json({ error: msg });
      } else {
        res
          .status(500)
          .type("text")
          .send(`Summary generation failed: ${escHtml(msg)}`);
      }
    }
  },
);

// ---------------------------------------------------------------------------
// POST /admin/applications/:id/status — update admissions status, redirect
// ---------------------------------------------------------------------------
router.post(
  "/admin/applications/:id/status",
  checkAdminAuth,
  (req, res) => {
    const id = String(req.params.id);
    const rawStatus =
      typeof req.body?.status === "string" ? req.body.status : "";

    if (!(ADMISSIONS_STATUSES as readonly string[]).includes(rawStatus)) {
      res
        .status(400)
        .type("text")
        .send(
          `Invalid status "${escHtml(rawStatus)}". Must be one of: ${ADMISSIONS_STATUSES.join(", ")}`,
        );
      return;
    }

    const record = applicationStore.get(id);
    if (!record) {
      res.status(404).type("text").send("Application not found.");
      return;
    }

    const previousStatus = record.admissionsStatus;
    record.admissionsStatus = rawStatus as AdmissionsStatus;
    applicationStore.set(id, record);

    // P4-A: send a status update email for significant admissions decisions.
    // "received" → "reviewed" is an internal admin workflow step — no email.
    // Only "accepted", "waitlisted", "declined" trigger applicant notification.
    const EMAIL_TRIGGER_STATUSES = ["accepted", "waitlisted", "declined"] as const;
    type EmailTriggerStatus = (typeof EMAIL_TRIGGER_STATUSES)[number];
    const isEmailStatus = (s: string): s is EmailTriggerStatus =>
      (EMAIL_TRIGGER_STATUSES as readonly string[]).includes(s);

    if (
      isEmailStatus(rawStatus) &&
      rawStatus !== previousStatus &&
      record.statusToken
    ) {
      sendStatusUpdateEmail(
        record.email,
        rawStatus,
        record.statusToken,
        req.log,
      ).catch((err) => {
        req.log.warn({ err, applicationId: id, status: rawStatus }, "Email: status update send failed");
      });
    }

    const token =
      typeof req.query.token === "string" ? req.query.token : "";

    // If the referrer was the detail page, redirect back there
    const referrer = req.get("Referrer") ?? "";
    if (referrer.includes("/summary")) {
      res.redirect(
        302,
        `/api/admin/applications/${encodeURIComponent(id)}/summary?token=${encodeURIComponent(token)}`,
      );
    } else {
      res.redirect(
        302,
        token
          ? `/api/admin?token=${encodeURIComponent(token)}`
          : "/api/admin",
      );
    }
  },
);

// ---------------------------------------------------------------------------
// GET /admin/cohort-report — JSON cohort composition report
// ---------------------------------------------------------------------------
router.get("/admin/cohort-report", checkAdminAuth, (_req, res) => {
  const report = buildCohortReport();
  res.status(200).json(report);
});

// ---------------------------------------------------------------------------
// GET /admin/waitlist.csv — CSV download
// ---------------------------------------------------------------------------
router.get("/admin/waitlist.csv", checkAdminAuth, (_req, res) => {
  const csv = buildWaitlistCsv(waitlistEntries);
  res
    .status(200)
    .type("text/csv")
    .set(
      "Content-Disposition",
      `attachment; filename="miaw-waitlist-${Date.now()}.csv"`,
    )
    .send(csv);
});

// ---------------------------------------------------------------------------
// GET /admin/applications.csv — CSV download
// ---------------------------------------------------------------------------
router.get("/admin/applications.csv", checkAdminAuth, (_req, res) => {
  const csv = buildApplicationsCsv([...applicationStore.values()]);
  res
    .status(200)
    .type("text/csv")
    .set(
      "Content-Disposition",
      `attachment; filename="miaw-applications-${Date.now()}.csv"`,
    )
    .send(csv);
});

export default router;
