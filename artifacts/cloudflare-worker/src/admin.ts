import {
  ADMIN_EMAIL,
  checkLoginAttempts,
  clearAdminCookie,
  clearFailedLogins,
  createAdminCookie,
  hasAdminSession,
  isSameOriginRequest,
  passwordMatches,
  recordFailedLogin,
} from "./auth";
import { jsonResponse, readJson, fromRsvpRow } from "./rsvp";
import type { RsvpRow, WorkerEnv } from "./types";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(256),
});

function secureRequest(request: Request): boolean {
  return new URL(request.url).protocol === "https:";
}

export async function adminRoute(
  request: Request,
  env: WorkerEnv,
  path: string,
): Promise<Response | null> {
  if (path === "/api/admin/session" && request.method === "GET") {
    const authenticated = await hasAdminSession(request, env);
    return jsonResponse({
      authenticated,
      email: authenticated ? env.ADMIN_EMAIL || ADMIN_EMAIL : null,
    });
  }

  if (path === "/api/admin/login" && request.method === "POST") {
    if (!isSameOriginRequest(request)) return jsonResponse({ error: "forbidden" }, 403);
    if (
      !env.ADMIN_PASSWORD ||
      env.ADMIN_PASSWORD.length < 16 ||
      !env.SESSION_SECRET
    ) {
      return jsonResponse({ error: "admin_not_configured" }, 503);
    }

    const parsed = LoginSchema.safeParse(await readJson(request));
    if (!parsed.success) return jsonResponse({ error: "invalid_request" }, 400);
    if ((await checkLoginAttempts(request, env)) === "blocked") {
      return jsonResponse({ error: "too_many_attempts" }, 429);
    }

    const passwordValid = passwordMatches(
      parsed.data.password,
      env.ADMIN_PASSWORD,
    );
    const emailValid =
      parsed.data.email.toLowerCase() === (env.ADMIN_EMAIL || ADMIN_EMAIL).toLowerCase();
    if (!passwordValid || !emailValid) {
      await recordFailedLogin(request, env);
      return jsonResponse({ error: "invalid_credentials" }, 401);
    }

    await clearFailedLogins(request, env);
    const response = jsonResponse({ ok: true, email: env.ADMIN_EMAIL || ADMIN_EMAIL });
    response.headers.append(
      "Set-Cookie",
      await createAdminCookie(env, secureRequest(request)),
    );
    return response;
  }

  if (path === "/api/admin/logout" && request.method === "POST") {
    if (!isSameOriginRequest(request)) return jsonResponse({ error: "forbidden" }, 403);
    const response = jsonResponse({ ok: true });
    response.headers.append("Set-Cookie", clearAdminCookie(secureRequest(request)));
    return response;
  }

  if (path === "/api/admin/dashboard" && request.method === "GET") {
    if (!(await hasAdminSession(request, env))) {
      return jsonResponse({ error: "unauthorized" }, 401);
    }

    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [summary, visitSummary, visitRows, rsvpRows] = await Promise.all([
      env.DB.prepare(
        `SELECT
           COUNT(*) AS total,
           COALESCE(SUM(CASE WHEN attending = 'yes' THEN 1 ELSE 0 END), 0) AS attending,
           COALESCE(SUM(CASE WHEN attending = 'no' THEN 1 ELSE 0 END), 0) AS declined,
           COALESCE(SUM(CASE WHEN attending = 'yes' THEN guests + 1 ELSE 0 END), 0) AS people_attending
         FROM rsvps`,
      ).first<{
        total: number;
        attending: number;
        declined: number;
        people_attending: number;
      }>(),
      env.DB.prepare(
        `SELECT
           COUNT(*) AS total,
           COALESCE(SUM(CASE WHEN visited_at >= ? THEN 1 ELSE 0 END), 0) AS last_30_days
         FROM site_visits`,
      )
        .bind(cutoff)
        .first<{ total: number; last_30_days: number }>(),
      env.DB.prepare("SELECT visited_at FROM site_visits WHERE visited_at >= ?")
        .bind(cutoff)
        .all<{ visited_at: string }>(),
      env.DB.prepare(
        `SELECT id, name, attending, guests, shuttle, events_json, arrival,
                transport_email, dietary, message, received_at
         FROM rsvps
         ORDER BY received_at DESC`,
      ).all<RsvpRow>(),
    ]);

    const byDay = new Map<string, number>();
    for (const row of visitRows.results ?? []) {
      const date = londonDate(row.visited_at);
      byDay.set(date, (byDay.get(date) ?? 0) + 1);
    }
    const visits = {
      total: visitSummary?.total ?? 0,
      last30Days: visitSummary?.last_30_days ?? 0,
      byDay: [...byDay.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([date, views]) => ({ date, views })),
    };

    return jsonResponse({
      emailAlerts: env.EMAIL && env.EMAIL_FROM ? "ready" : "not_configured",
      emailProvider: "cloudflare",
      summary: summary ?? {
        total: 0,
        attending: 0,
        declined: 0,
        people_attending: 0,
      },
      visits,
      rsvps: (rsvpRows.results ?? []).map((row) => ({
        id: String(row.id),
        ...fromRsvpRow(row),
      })),
    });
  }

  return null;
}

function londonDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
