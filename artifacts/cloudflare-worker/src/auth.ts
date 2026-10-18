import type { WorkerEnv } from "./types";

export const ADMIN_EMAIL = "lookwithinjourney@gmail.com";
const COOKIE_NAME = "wedding_admin";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes.buffer;
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)),
  );
}

function getCookie(request: Request, name: string): string | undefined {
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1);
}

export async function hasAdminSession(
  request: Request,
  env: WorkerEnv,
): Promise<boolean> {
  const secret = env.SESSION_SECRET;
  const token = getCookie(request, COOKIE_NAME);
  if (!secret || !token) return false;

  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length > 0) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const verified = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(payload),
    );
    if (!verified) return false;

    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    return (
      session.email === (env.ADMIN_EMAIL || ADMIN_EMAIL) &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export async function createAdminCookie(
  env: WorkerEnv,
  secure: boolean,
): Promise<string> {
  if (!env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET is required to create admin sessions.");
  }
  const payload = toBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        email: env.ADMIN_EMAIL || ADMIN_EMAIL,
        expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
      }),
    ),
  );
  const signature = toBase64Url(await hmac(env.SESSION_SECRET, payload));
  return `${COOKIE_NAME}=${payload}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}${secure ? "; Secure" : ""}`;
}

export function clearAdminCookie(secure: boolean): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function loginIpHash(
  request: Request,
  env: WorkerEnv,
): Promise<string> {
  const address = request.headers.get("cf-connecting-ip") || "unknown";
  return toBase64Url(await hmac(env.SESSION_SECRET || "", address));
}

export async function checkLoginAttempts(
  request: Request,
  env: WorkerEnv,
): Promise<"allowed" | "blocked"> {
  const ipHash = await loginIpHash(request, env);
  const attempt = await env.DB.prepare(
    "SELECT count, reset_at FROM admin_login_attempts WHERE ip_hash = ?",
  )
    .bind(ipHash)
    .first<{ count: number; reset_at: number }>();
  return attempt && attempt.reset_at > Date.now() && attempt.count >= MAX_LOGIN_ATTEMPTS
    ? "blocked"
    : "allowed";
}

export async function recordFailedLogin(
  request: Request,
  env: WorkerEnv,
): Promise<void> {
  const ipHash = await loginIpHash(request, env);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO admin_login_attempts (ip_hash, count, reset_at)
     VALUES (?, 1, ?)
     ON CONFLICT(ip_hash) DO UPDATE SET
       count = CASE WHEN reset_at <= ? THEN 1 ELSE count + 1 END,
       reset_at = CASE WHEN reset_at <= ? THEN excluded.reset_at ELSE reset_at END`,
  )
    .bind(ipHash, now + LOGIN_WINDOW_MS, now, now)
    .run();
  await env.DB.prepare(
    "DELETE FROM admin_login_attempts WHERE reset_at <= ?",
  )
    .bind(now - 24 * 60 * 60 * 1000)
    .run();
}

export async function clearFailedLogins(
  request: Request,
  env: WorkerEnv,
): Promise<void> {
  const ipHash = await loginIpHash(request, env);
  await env.DB.prepare("DELETE FROM admin_login_attempts WHERE ip_hash = ?")
    .bind(ipHash)
    .run();
}

export function passwordMatches(submitted: string, expected: string): boolean {
  const submittedBytes = new TextEncoder().encode(submitted);
  const expectedBytes = new TextEncoder().encode(expected);
  let difference = submittedBytes.length ^ expectedBytes.length;
  const length = Math.max(submittedBytes.length, expectedBytes.length);
  for (let index = 0; index < length; index += 1) {
    difference |=
      (submittedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }
  return difference === 0;
}
