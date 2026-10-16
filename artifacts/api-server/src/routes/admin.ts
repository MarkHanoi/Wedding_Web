import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { z } from "zod";
import {
  ADMIN_EMAIL,
  clearAdminCookie,
  createAdminCookie,
  hasAdminSession,
  isSameOriginRequest,
  requireAdmin,
} from "../lib/adminAuth";
import { pool } from "../lib/db";
import { verifyGmailSmtp } from "../lib/mailer";

const router = Router();
const LoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});
const failedLogins = new Map<string, { count: number; resetAt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function secureRequest(req: Request) {
  return req.secure || req.get("x-forwarded-proto") === "https";
}

router.get("/admin/session", (req, res) => {
  res.json({
    authenticated: hasAdminSession(req),
    email: hasAdminSession(req) ? ADMIN_EMAIL : null,
  });
});

router.post("/admin/login", (req, res) => {
  if (!isSameOriginRequest(req)) {
    res.status(403).json({ error: "forbidden" });
    return;
  }

  if (
    !process.env.ADMIN_PASSWORD ||
    process.env.ADMIN_PASSWORD.length < 16 ||
    !process.env.SESSION_SECRET
  ) {
    res.status(503).json({ error: "admin_not_configured" });
    return;
  }

  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const ip = req.ip || "unknown";
  const current = failedLogins.get(ip);
  if (current && current.resetAt > Date.now() && current.count >= MAX_LOGIN_ATTEMPTS) {
    res.status(429).json({ error: "too_many_attempts" });
    return;
  }

  const submittedPassword = Buffer.from(parsed.data.password);
  const expectedPassword = Buffer.from(process.env.ADMIN_PASSWORD);
  const passwordMatches =
    submittedPassword.length === expectedPassword.length &&
    timingSafeEqual(submittedPassword, expectedPassword);
  const emailMatches = parsed.data.email.toLowerCase() === ADMIN_EMAIL;

  if (!passwordMatches || !emailMatches) {
    const nextCount =
      current && current.resetAt > Date.now() ? current.count + 1 : 1;
    failedLogins.set(ip, { count: nextCount, resetAt: Date.now() + LOGIN_WINDOW_MS });
    res.status(401).json({ error: "invalid_credentials" });
    return;
  }

  failedLogins.delete(ip);
  createAdminCookie(res, secureRequest(req));
  res.json({ ok: true, email: ADMIN_EMAIL });
});

router.post("/admin/logout", (req, res) => {
  if (!isSameOriginRequest(req)) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  clearAdminCookie(res, secureRequest(req));
  res.json({ ok: true });
});

router.get("/admin/dashboard", requireAdmin, async (_req, res, next) => {
  try {
    const emailAlertsPromise: Promise<"ready" | "check_failed" | "not_configured"> =
      process.env.GMAIL_APP_PASSWORD
        ? verifyGmailSmtp().then(() => "ready" as const).catch(() => "check_failed" as const)
        : Promise.resolve("not_configured");

    const [summary, visits, recentRsvps, emailAlerts] = await Promise.all([
      pool.query<{
        total: number;
        attending: number;
        declined: number;
        people_attending: number;
      }>(
        `SELECT
           COUNT(*)::int AS total,
           COUNT(*) FILTER (WHERE attending = 'yes')::int AS attending,
           COUNT(*) FILTER (WHERE attending = 'no')::int AS declined,
           COALESCE(SUM(guests + 1) FILTER (WHERE attending = 'yes'), 0)::int AS people_attending
         FROM rsvps`,
      ),
      pool.query<{ total: number; last_30_days: number; date: string; views: number }>(
        `WITH daily AS (
           SELECT TO_CHAR(visited_at AT TIME ZONE 'Europe/London', 'YYYY-MM-DD') AS date,
                  COUNT(*)::int AS views
           FROM site_visits
           WHERE visited_at >= NOW() - INTERVAL '30 days'
           GROUP BY 1
         )
         SELECT
           (SELECT COUNT(*)::int FROM site_visits) AS total,
           (SELECT COUNT(*)::int FROM site_visits WHERE visited_at >= NOW() - INTERVAL '30 days') AS last_30_days,
           daily.date,
           daily.views
         FROM daily
         ORDER BY daily.date ASC`,
      ),
      pool.query<{
        id: string;
        name: string;
        attending: "yes" | "no";
        guests: number;
        shuttle: boolean;
        events: string[];
        arrival: string;
        dietary: string;
        message: string;
        received_at: Date;
      }>(
        `SELECT id, name, attending, guests, shuttle, events, arrival, dietary, message, received_at
         FROM rsvps
         ORDER BY received_at DESC`,
      ),
      emailAlertsPromise,
    ]);

    res.json({
      emailAlerts,
      summary: summary.rows[0],
      visits: {
        total: visits.rows[0]?.total ?? 0,
        last30Days: visits.rows[0]?.last_30_days ?? 0,
        byDay: visits.rows.map((row) => ({ date: row.date, views: row.views })),
      },
      rsvps: recentRsvps.rows.map((row) => ({
        id: row.id,
        name: row.name,
        attending: row.attending,
        guests: row.guests,
        shuttle: row.shuttle,
        events: row.events,
        arrival: row.arrival,
        dietary: row.dietary,
        message: row.message,
        receivedAt: row.received_at.toISOString(),
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
