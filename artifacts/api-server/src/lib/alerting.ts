/**
 * Alerting — sliding-window error rate tracking with configurable webhook dispatch.
 *
 * Design principles:
 * - No external dependencies required; optional webhook via ALERT_WEBHOOK_URL
 * - In-process only: buckets live in module-scope memory (acceptable for single-instance Phase 0)
 * - Idempotent: setting lastAlertAt synchronously before async work prevents concurrent dispatches
 * - Zero cost on the happy path: all hot-path work is synchronous Map/array manipulation
 *
 * Environment variables:
 *   ALERT_WEBHOOK_URL        Webhook POST target (Slack, Discord, PagerDuty, etc.)
 *   ALERT_ERROR_THRESHOLD    Errors in window before alerting (default: 10)
 *   ALERT_WINDOW_MINUTES     Rolling window size in minutes for threshold check (default: 5)
 *   ALERT_COOLDOWN_MINUTES   Minimum minutes between consecutive alerts (default: 5)
 */

import type { Logger } from "pino";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BUCKET_MS = 60_000; // 1-minute buckets
const MAX_BUCKETS = 10; // keep 10 minutes of history
const DEFAULT_THRESHOLD = 10;
const DEFAULT_WINDOW_MINUTES = 5;
const DEFAULT_COOLDOWN_MINUTES = 5;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ErrorCategory = "client" | "server" | "rate_limit" | "claude";

interface ErrorBucket {
  /** Unix ms at which this minute started (floored to BUCKET_MS). */
  timestamp: number;
  client: number; // 4xx (excluding 429)
  server: number; // 5xx
  rateLimitHits: number; // 429
  claudeErrors: number; // Claude API failures
  total: number;
}

export interface ErrorBreakdown {
  client_errors: number;
  server_errors: number;
  rate_limit_hits: number;
  claude_errors: number;
}

export interface Metrics {
  uptime_s: number;
  total_requests: number;
  total_rate_limit_hits: number;
  total_claude_errors: number;
  errors_last_5min: number;
  errors_last_10min: number;
  error_breakdown_last_5min: ErrorBreakdown;
  alert_count: number;
  last_alert_at: string | null;
  alert_webhook_configured: boolean;
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

const buckets: ErrorBucket[] = [];

const state = {
  startedAt: Date.now(),
  totalRequests: 0,
  totalRateLimitHits: 0,
  totalClaudeErrors: 0,
  alertCount: 0,
  lastAlertAt: 0,
};

// ---------------------------------------------------------------------------
// Bucket helpers
// ---------------------------------------------------------------------------

function currentBucket(): ErrorBucket {
  const now = Date.now();
  const ts = Math.floor(now / BUCKET_MS) * BUCKET_MS;

  const existing = buckets.find((b) => b.timestamp === ts);
  if (existing) return existing;

  const fresh: ErrorBucket = {
    timestamp: ts,
    client: 0,
    server: 0,
    rateLimitHits: 0,
    claudeErrors: 0,
    total: 0,
  };
  buckets.push(fresh);

  // Evict buckets beyond the retention window
  while (buckets.length > MAX_BUCKETS) {
    buckets.shift();
  }

  return fresh;
}

function errorCountInWindow(windowMinutes: number): number {
  const cutoff = Date.now() - windowMinutes * BUCKET_MS;
  return buckets
    .filter((b) => b.timestamp >= cutoff)
    .reduce((sum, b) => sum + b.total, 0);
}

function breakdownInWindow(windowMinutes: number): ErrorBreakdown {
  const cutoff = Date.now() - windowMinutes * BUCKET_MS;
  const recent = buckets.filter((b) => b.timestamp >= cutoff);
  return {
    client_errors: recent.reduce((s, b) => s + b.client, 0),
    server_errors: recent.reduce((s, b) => s + b.server, 0),
    rate_limit_hits: recent.reduce((s, b) => s + b.rateLimitHits, 0),
    claude_errors: recent.reduce((s, b) => s + b.claudeErrors, 0),
  };
}

// ---------------------------------------------------------------------------
// Public recording API
// ---------------------------------------------------------------------------

/**
 * Called once per incoming request (in middleware, before routing).
 */
export function recordRequest(): void {
  state.totalRequests += 1;
}

/**
 * Called after each response is flushed.
 * Category mapping:
 *   "client"     → 4xx excluding 429
 *   "rate_limit" → 429
 *   "server"     → 5xx
 *   "claude"     → explicit Claude API failure (regardless of status code recorded elsewhere)
 */
export function recordError(category: ErrorCategory): void {
  const bucket = currentBucket();
  bucket.total += 1;

  switch (category) {
    case "client":
      bucket.client += 1;
      break;
    case "server":
      bucket.server += 1;
      break;
    case "rate_limit":
      bucket.rateLimitHits += 1;
      state.totalRateLimitHits += 1;
      break;
    case "claude":
      bucket.claudeErrors += 1;
      state.totalClaudeErrors += 1;
      break;
  }
}

// ---------------------------------------------------------------------------
// Alert dispatch
// ---------------------------------------------------------------------------

async function dispatchWebhook(
  errorCount: number,
  threshold: number,
  breakdown: ErrorBreakdown,
): Promise<void> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (!webhookUrl) return;

  const payload = {
    text: `[MIAW] Error spike: ${errorCount} errors in window (threshold: ${threshold})`,
    errors_in_window: errorCount,
    threshold,
    breakdown,
    uptime_s: Math.floor((Date.now() - state.startedAt) / 1000),
    total_requests: state.totalRequests,
    timestamp: new Date().toISOString(),
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5_000),
  });

  if (!response.ok) {
    throw new Error(`Webhook returned HTTP ${response.status}`);
  }
}

/**
 * Check the current error rate against the threshold and fire an alert if
 * conditions are met. Safe to call on every request completion — cheap
 * in-memory checks gate the async work.
 */
export async function checkAndMaybeAlert(log: Logger): Promise<void> {
  const threshold = Number(
    process.env.ALERT_ERROR_THRESHOLD ?? DEFAULT_THRESHOLD,
  );
  const windowMinutes = Number(
    process.env.ALERT_WINDOW_MINUTES ?? DEFAULT_WINDOW_MINUTES,
  );
  const cooldownMs =
    Number(process.env.ALERT_COOLDOWN_MINUTES ?? DEFAULT_COOLDOWN_MINUTES) *
    60_000;

  const errorCount = errorCountInWindow(windowMinutes);
  if (errorCount < threshold) return;

  const now = Date.now();
  if (now - state.lastAlertAt < cooldownMs) return;

  // Mark alert synchronously BEFORE any await so concurrent calls see it
  state.lastAlertAt = now;
  state.alertCount += 1;

  const breakdown = breakdownInWindow(windowMinutes);

  log.warn(
    { errorCount, threshold, windowMinutes, breakdown, alertCount: state.alertCount },
    "Error spike alert triggered",
  );

  try {
    await dispatchWebhook(errorCount, threshold, breakdown);
    if (process.env.ALERT_WEBHOOK_URL) {
      log.info({ alertCount: state.alertCount }, "Alert webhook dispatched");
    }
  } catch (err) {
    log.warn({ err }, "Alert webhook dispatch failed");
  }
}

// ---------------------------------------------------------------------------
// Metrics snapshot
// ---------------------------------------------------------------------------

/**
 * Returns a point-in-time snapshot of all tracked metrics.
 * Called by GET /api/metrics.
 */
export function getMetrics(): Metrics {
  return {
    uptime_s: Math.floor((Date.now() - state.startedAt) / 1000),
    total_requests: state.totalRequests,
    total_rate_limit_hits: state.totalRateLimitHits,
    total_claude_errors: state.totalClaudeErrors,
    errors_last_5min: errorCountInWindow(5),
    errors_last_10min: errorCountInWindow(10),
    error_breakdown_last_5min: breakdownInWindow(5),
    alert_count: state.alertCount,
    last_alert_at:
      state.lastAlertAt > 0
        ? new Date(state.lastAlertAt).toISOString()
        : null,
    alert_webhook_configured: !!process.env.ALERT_WEBHOOK_URL,
  };
}
