import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

// Resolve paths relative to the built server bundle.
// After esbuild:  import.meta.url = …/artifacts/api-server/dist/index.mjs
//   ../..         = …/artifacts/
//   ../../miaw/dist/public = …/artifacts/miaw/dist/public  (frontend build output)
const __moduleDir = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

// Trust the first proxy hop (Replit's ingress) so req.ip is set correctly.
// Without this, Express returns the proxy IP; with trust > 1, a malicious
// client could spoof x-forwarded-for to bypass rate limiting.
app.set("trust proxy", 1);

// Structured request logging with PII redaction
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Security headers — CSP is off because this is a JSON/streaming API, not a webpage.
// frameguard (X-Frame-Options) is also off: this is an API server, not a webpage,
// so the header provides no security benefit and actively breaks the Replit preview
// pane (which embeds the app in an iframe) when the API server is also serving the
// static frontend in development.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    frameguard: false,
  }),
);

// CORS — allow Replit-hosted origins, localhost, Cloudflare Pages, and any
// custom domains listed in CORS_ALLOWED_ORIGINS (comma-separated).
// In Replit production both services share the same domain via the proxy,
// so same-origin requests never hit this middleware at all.
const allowedOriginRe =
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$|^https:\/\/[a-zA-Z0-9._-]+\.(replit\.dev|repl\.co|replit\.app|pages\.dev)$/;

// Extra origins supplied at runtime — e.g. a custom domain on CF Pages:
//   CORS_ALLOWED_ORIGINS=https://miaw.ai,https://www.miaw.ai
const extraOrigins: Set<string> = new Set(
  (process.env.CORS_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (same-origin, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOriginRe.test(origin)) return callback(null, true);
      if (extraOrigins.has(origin)) return callback(null, true);
      callback(new Error(`CORS: origin not allowed — ${origin}`));
    },
    credentials: false,
  }),
);

app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

app.use("/api", router);

// ---------------------------------------------------------------------------
// Static file serving — production only.
// In dev the Vite dev server handles the frontend (port 5000) and proxies
// /api/* to this server (port 8080). In production everything goes through
// a single port: this server serves the built frontend for all non-API routes.
// ---------------------------------------------------------------------------
// Guard: only serve the static frontend in production. In development, even if
// artifacts/miaw/dist/public exists (e.g. after a manual build), the API server
// must NOT serve it. Doing so makes port 8080 return a full HTML page which
// Replit's iframe-based preview pane cannot display (Helmet sets
// X-Frame-Options: SAMEORIGIN — now disabled — but the real fix is correct
// environment separation: Vite on 5000 owns the frontend in dev).
const frontendDist = path.join(__moduleDir, "../../../artifacts/miaw/dist/public");

if (process.env.NODE_ENV === "production" && existsSync(frontendDist)) {
  app.use(express.static(frontendDist, { index: false }));

  // SPA fallback — any route not matched by /api or a static file returns index.html
  // Express 5 requires named wildcards — "/*path" instead of bare "*"
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });

  logger.info({ frontendDist }, "Serving static frontend");
}

// Global error handler — catches errors thrown by route handlers or middleware
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  req.log.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "internal_error" });
};
app.use(errorHandler);

export default app;
