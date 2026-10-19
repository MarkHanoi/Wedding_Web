import type { RequestHandler } from "express";

const RESPONSE_HEADERS = [
  "cache-control",
  "content-type",
  "referrer-policy",
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
] as const;

function parseApiOrigin(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("CLOUDFLARE_API_ORIGIN must be a valid URL origin.");
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.username ||
    url.password
  ) {
    throw new Error("CLOUDFLARE_API_ORIGIN must contain only an HTTP(S) origin.");
  }

  return url;
}

export function createCloudflareApiProxy(value: string): RequestHandler {
  const apiOrigin = parseApiOrigin(value);

  return (req, res) => {
    const browserOrigin = req.get("origin");
    const incomingUrl = new URL(req.originalUrl, "http://replit.internal");
    const targetPath =
      req.method === "GET" &&
      (incomingUrl.pathname === "/api" || incomingUrl.pathname === "/api/")
        ? "/api/healthz"
        : incomingUrl.pathname;
    const targetUrl = new URL(apiOrigin.origin);
    targetUrl.pathname = targetPath;
    targetUrl.search = incomingUrl.search;

    const headers = new Headers();
    const accept = req.get("accept");
    const contentType = req.get("content-type");
    const cookie = req.get("cookie");

    if (accept) headers.set("accept", accept);
    if (contentType) headers.set("content-type", contentType);
    if (cookie) headers.set("cookie", cookie);
    if (browserOrigin) headers.set("origin", apiOrigin.origin);

    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.body !== undefined) {
      if (!req.is("application/json")) {
        res.status(415).json({ error: "unsupported_media_type" });
        return;
      }
      body = JSON.stringify(req.body);
    }

    void fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    })
      .then(async (upstream) => {
        res.status(upstream.status);

        for (const header of RESPONSE_HEADERS) {
          const value = upstream.headers.get(header);
          if (value) res.setHeader(header, value);
        }

        const setCookie = upstream.headers.get("set-cookie");
        if (setCookie) res.setHeader("set-cookie", setCookie);

        if (upstream.status === 204 || upstream.status === 304) {
          res.end();
          return;
        }

        res.end(Buffer.from(await upstream.arrayBuffer()));
      })
      .catch(() => {
        if (!res.headersSent) {
          res.status(502).json({ error: "cloudflare_unavailable" });
        }
      });
  };
}
