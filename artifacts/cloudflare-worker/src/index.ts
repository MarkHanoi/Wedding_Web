import { adminRoute } from "./admin";
import { createRsvp, jsonResponse, readJson, rsvpCount } from "./rsvp";
import type { WorkerEnv } from "./types";

async function handleApi(
  request: Request,
  env: WorkerEnv,
  path: string,
): Promise<Response> {
  if (path === "/api/healthz" && request.method === "GET") {
    await env.DB.prepare("SELECT 1 AS ok").first();
    return jsonResponse({ status: "ok", database: "connected" });
  }

  if (path === "/api/rsvp" && request.method === "POST") {
    return createRsvp(request, env);
  }

  if (path === "/api/rsvp/count" && request.method === "GET") {
    return rsvpCount(env);
  }

  if (path === "/api/analytics/visit" && request.method === "POST") {
    return recordVisit(request, env);
  }

  const adminResponse = await adminRoute(request, env, path);
  if (adminResponse) return adminResponse;

  return jsonResponse({ error: "not_found" }, 404);
}

async function recordVisit(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  const body = await readJson(request) as
    | { eventId?: unknown; path?: unknown }
    | null;
  if (
    !body ||
    typeof body.eventId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.eventId) ||
    typeof body.path !== "string" ||
    body.path.length < 1 ||
    body.path.length > 100
  ) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  if (body.path === "/admin" || body.path.startsWith("/admin/")) {
    return new Response(null, { status: 204 });
  }

  await env.DB.prepare(
    "INSERT OR IGNORE INTO site_visits (event_id, visited_at) VALUES (?, ?)",
  )
    .bind(body.eventId, new Date().toISOString())
    .run();
  return new Response(null, { status: 204 });
}

function addSecurityHeaders(response: Response, requestUrl: string): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  if (headers.get("Content-Type")?.includes("application/json")) {
    headers.set("Cache-Control", "no-store");
    headers.set("X-Frame-Options", "DENY");
  }
  if (requestUrl.startsWith("https://")) {
    headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      try {
        return addSecurityHeaders(
          await handleApi(request, env, url.pathname),
          request.url,
        );
      } catch {
        console.error("Unhandled Worker API error.");
        return addSecurityHeaders(
          jsonResponse({ error: "internal_error" }, 500),
          request.url,
        );
      }
    }
    return addSecurityHeaders(await env.ASSETS.fetch(request), request.url);
  },
};
