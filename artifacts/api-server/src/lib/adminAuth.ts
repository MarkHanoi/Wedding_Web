import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";

export const ADMIN_EMAIL = "lookwithinjourney@gmail.com";

const COOKIE_NAME = "wedding_admin";
const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function sessionSecret(): string | undefined {
  return process.env.SESSION_SECRET;
}

function signatureFor(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function cookieValue(req: Request): string | undefined {
  const cookies = req.headers.cookie?.split(";") ?? [];
  const cookie = cookies.map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return cookie?.slice(COOKIE_NAME.length + 1);
}

export function hasAdminSession(req: Request): boolean {
  const secret = sessionSecret();
  const token = cookieValue(req);
  if (!secret || !token) return false;

  const [payload, signature, ...extra] = token.split(".");
  if (!payload || !signature || extra.length > 0) return false;

  const expected = Buffer.from(signatureFor(payload, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      email?: unknown;
      expiresAt?: unknown;
    };
    return (
      session.email === ADMIN_EMAIL &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

export function createAdminCookie(res: Response, secure: boolean): void {
  const secret = sessionSecret();
  if (!secret) throw new Error("SESSION_SECRET is required to create admin sessions.");

  const payload = Buffer.from(
    JSON.stringify({
      email: ADMIN_EMAIL,
      expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
    }),
  ).toString("base64url");
  const token = `${payload}.${signatureFor(payload, secret)}`;
  const secureAttribute = secure ? "; Secure" : "";

  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_DURATION_SECONDS}${secureAttribute}`,
  );
}

export function clearAdminCookie(res: Response, secure: boolean): void {
  const secureAttribute = secure ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secureAttribute}`,
  );
}

export function isSameOriginRequest(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return req.get("sec-fetch-site") !== "cross-site";

  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}

export const requireAdmin: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
};
