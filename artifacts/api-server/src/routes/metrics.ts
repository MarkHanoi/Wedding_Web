/**
 * GET /api/metrics
 *
 * Returns a real-time snapshot of error counts, uptime, and alert state.
 *
 * Protection model:
 *   - If METRICS_TOKEN is not set in env: responds 503 (endpoint not enabled).
 *     This prevents accidental exposure before the operator has consciously
 *     chosen a token — fail-safe rather than fail-open.
 *   - If METRICS_TOKEN is set: requires `Authorization: Bearer <token>` header.
 *     A missing or mismatched token yields 401.
 *
 * This is an internal/operational endpoint; it is included in the OpenAPI
 * contract for documentation purposes but is not intended for end-user clients.
 */

import { Router, type IRouter } from "express";
import { getMetrics } from "../lib/alerting";
import { GetMetricsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/metrics", (req, res) => {
  const configuredToken = process.env.METRICS_TOKEN;

  // Endpoint is disabled when no token is configured (fail-safe default)
  if (!configuredToken) {
    res.status(503).json({
      error: "metrics_disabled",
      message:
        "Metrics endpoint is not enabled. Set the METRICS_TOKEN environment variable to enable it.",
    });
    return;
  }

  // Validate bearer token
  const authHeader = req.headers.authorization ?? "";
  const [scheme, provided] = authHeader.split(" ");

  if (scheme !== "Bearer" || provided !== configuredToken) {
    res.status(401).json({
      error: "unauthorized",
      message: "Valid Authorization: Bearer <METRICS_TOKEN> header required.",
    });
    return;
  }

  const snapshot = getMetrics();
  // GetMetricsResponse validates the shape; last_alert_at (string|null) is
  // coerced to Date by zod then serialised back to ISO string by JSON.stringify.
  const data = GetMetricsResponse.parse(snapshot);
  res.json(data);
});

export default router;
