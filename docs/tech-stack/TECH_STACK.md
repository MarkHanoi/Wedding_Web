# MIAW — Technical Stack Reference

> Last updated: 2026-05-15
> This document is the authoritative record of every technology decision in the MIAW platform — what was chosen, why, and the trade-offs accepted.

---

## Architecture Overview

MIAW is a pnpm monorepo with two production artifacts deployed as a single Replit Deployment unit.

```
Browser
  │
  ▼
Replit Reverse Proxy (mTLS, path-based routing)
  ├── /           →  Static React build (Vite → CDN layer)
  └── /api/*      →  Express 5 Node.js server (persistent process, port 8080)
```

The frontend is a fully pre-built static bundle — zero server-side rendering. The API server is a long-lived Node.js process. Both are bound by an OpenAPI contract that drives code generation in both directions: client-side React Query hooks and server-side Zod validation schemas from a single source of truth.

**Why this split?** The frontend has zero runtime compute requirements. Serving it from a CDN layer gives sub-50ms TTFB globally for free. The API needs a persistent process for in-memory rate-limiting state and warm knowledge base loading. Separating concerns means the static UI can be updated without restarting the server, and vice versa.

---

## Runtime & Toolchain

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript 5.9 | Strict mode end-to-end; `satisfies` operator for config narrowing without widening |
| Node version | 24 (LTS) | Native `fetch`, `ReadableStream`, `crypto.randomUUID()` — no polyfill cost |
| Package manager | pnpm 10 (workspaces) | Strict symlink isolation prevents phantom dependency bugs; catalogs enforce consistent versions across packages |
| Monorepo model | pnpm workspaces + TS project references | Composite lib builds with declaration emit; leaf artifacts typecheck with `--noEmit`. Root `tsconfig.json` is a solution file for libs only |
| Build tool (server) | esbuild (custom `build.mjs`) | ~200ms cold build; single bundled ESM output with source maps; tree-shakes server bundle to ~1.7MB |
| Build tool (client) | Vite 7 | Native ESM dev server; Rollup production build with content-hash filenames; 388KB JS / 79KB CSS raw (127KB / 14KB gzip) |

---

## Frontend Stack

### React 18 + Vite 7

**Why React 18?** Concurrent rendering is not yet used directly, but `useTransition` and `useDeferredValue` are available if the message list grows. The streaming update pattern (`setMessages` on every chunk) benefits from React's automatic batching in v18 — multiple state updates inside a fetch callback batch into a single re-render instead of triggering one per chunk.

**Why Vite?** esbuild-powered dev server with sub-50ms HMR. The `@vitejs/plugin-react` preset handles JSX transform without Babel overhead. Content-hash filenames in production enable permanent cache headers.

### Tailwind CSS 4

- CSS-first configuration via `@theme` directive — no `tailwind.config.js`
- CSS `@property` for the mesh gradient animation: typed custom properties (`<percentage>`, `<color>`) allow the browser to interpolate blob positions as first-class layout properties. This is the engine behind the 45-second flowing gradient.
- `sr-only` utility for screen reader live region
- No PurgeCSS step needed — Tailwind 4 scans at build time via Vite integration

**Gradient implementation:** Four radial blobs with `@property` typed as `<percentage>`. Each blob's X/Y position is a CSS custom property animated via `@keyframes`. The browser interpolates percentage values natively — no JavaScript animation loop, no `requestAnimationFrame`, zero runtime cost.

### Framer Motion 12

Used specifically for two patterns:

1. **Shared Layout Animation (logo):** The `miaw` logo uses `layoutId="logo"` across two conditionally-rendered elements — the large centered version on the landing screen and the small top-left version in the conversation header. When state transitions, Framer Motion performs a FLIP animation (First/Last/Invert/Play), physically moving and scaling the logo between the two positions. This requires zero absolute positioning or manual coordinate tracking.

2. **Message enter animation:** Each `MessageBubble` uses `motion.div` with `initial={{ opacity: 0, y: 10 }}` → `animate={{ opacity: 1, y: 0 }}`. This replaces the CSS `@keyframes message-enter` class with a composable declarative approach that respects `AnimatePresence` lifecycle.

**Why not CSS transitions for the logo?** The logo changes both position (from page center to header top-left) and font size (66px → 20px) simultaneously, across two different DOM nodes with different parent containers. CSS `transition` cannot animate between two elements — it can only interpolate properties on a single element. Framer Motion's `layoutId` is the correct primitive for this exact use case.

### Streaming cursor

The `MessageBubble` component renders a blinking block cursor (`▍` equivalent via a styled `motion.span`) on the last assistant message while streaming. Uses `animate={{ opacity: [1, 0] }}` with `transition={{ duration: 0.55, repeat: Infinity, ease: "steps(1)" }}` for a hardware-accelerated, stutter-free blink that doesn't trigger layout recalculation.

---

## Backend Stack

### Express 5 (Release Candidate)

**Why Express 5 over Fastify or Hono?** At MIAW's scale (one streaming endpoint), framework throughput is not a bottleneck. Express 5 adds native async error propagation (no more `next(err)` wrappers), which simplifies all route handlers. The ecosystem (middleware, type definitions) is mature. Hono would be appropriate if we needed edge deployment; Express is the right fit for a persistent server-rendered API.

### Pino + pino-pretty

Structured JSON logging in production. Human-readable colorized output in development. `req.log` on every request via `pino-http` middleware — correlation is automatic. Sensitive fields (`authorization`, `cookie`, `set-cookie`) are redacted at the logger level before they can appear in any output.

### Helmet 8

Sets 9 security response headers on every request:

| Header | Value | Purpose |
|---|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS for 1 year |
| `X-Frame-Options` | `SAMEORIGIN` | Block clickjacking |
| `X-Content-Type-Options` | `nosniff` | Block MIME sniffing |
| `Referrer-Policy` | `no-referrer` | No referrer leakage |
| `X-XSS-Protection` | `0` | Disable legacy XSS filter (per OWASP guidance) |
| `Origin-Agent-Cluster` | `?1` | Process isolation hint |
| `Cross-Origin-Opener-Policy` | `same-origin` | Cross-origin isolation |
| `Cross-Origin-Resource-Policy` | `same-origin` | Block cross-origin reads |

### CORS

Restricted to a compiled regex pattern: Replit `.replit.dev`, `.repl.co`, `.replit.app` subdomains, and `localhost`/`127.0.0.1` for development. All other origins receive a 403 before the route handler executes. The pattern is validated at startup — a malformed regex would fail loudly on boot.

### Zod validation

Every route validates inputs with a Zod schema before any business logic runs:

- `ChatRequestSchema` — messages array shape, role enum, content max 4000 chars, turn count bounds (0–20), visitor profile fields
- `WaitlistRequestSchema` — email format (not just `includes("@")`), visitor type enum, conversation length bounds

Validation errors return structured 400 responses with field-level detail, generated by `z.ZodError.flatten()`.

### Body size limits

Both `express.json()` and `express.urlencoded()` are capped at 64KB. This prevents payload amplification attacks without blocking any legitimate use case (the largest valid chat payload is well under 10KB).

---

## AI Pipeline

### Anthropic Claude via Replit AI Integrations

Model: `claude-sonnet-4-6`

The Replit AI Integrations proxy injects `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY` automatically — these must never be set manually. The Anthropic SDK picks them up via constructor options.

**Streaming architecture:** The API endpoint calls `client.messages.stream()` and pipes raw text deltas directly to the HTTP response stream. No JSON envelope, no SSE framing, no chunking protocol. The frontend reads `response.body` as a `ReadableStream` with a `TextDecoder` and accumulates deltas into a single growing string. This gives the minimum possible time-to-first-token: the first word appears in the browser before the model has finished its second sentence.

**Why not Server-Sent Events (SSE)?** SSE requires a specific `Content-Type: text/event-stream` and a `data: ...\n\n` envelope format. Parsing that envelope on the client adds code for zero benefit at this scale — the raw stream approach is simpler, equally resumable, and works in all modern browsers.

**Why not WebSockets?** WebSockets are appropriate for bidirectional real-time communication. This is unidirectional (server-to-client) per message. HTTP streaming is the correct primitive — it works through HTTP/2 multiplexing, reverse proxies, and CDN layers without special handling.

---

## RAG (Retrieval-Augmented Generation)

MIAW uses a custom keyword-based retrieval system with no external dependencies and no embedding vectors.

### Why not embeddings?

The knowledge base is ~230 lines across 4 files. The operational overhead of maintaining an embedding index (model hosting, vector database, recomputation on knowledge updates) is not justified. The keyword approach retrieves relevant chunks with high precision for this domain because the vocabulary is specific (AEC, BIM, Gaussian Splatting, etc.) and queries are almost always factual.

### Scoring algorithm (BM25-inspired)

1. **Tokenization:** Lowercase, strip punctuation, split on whitespace, filter stop words (50 words) and tokens shorter than 3 chars
2. **Bigram extraction:** Build all consecutive token pairs from the query (`["gaussian splatting", "world model", ...]`)
3. **TF-normalized term scoring:** For each query token matching a chunk, apply `tf / (tf + 1.5 + 1.5 × (chunkLen / 80))` — this prevents long chunks from dominating purely by length. Multiplied by 4.
4. **Domain booster:** 16 domain-specific terms (`architect`, `bim`, `cohort`, `mcp`, `gaussian`, etc.) carry a 1.5–2.0 flat bonus when matched in both query and chunk
5. **Bigram bonus:** +5 for exact compound term match (e.g., "gaussian splatting" as a phrase)
6. **Header boost:** +2.5 if a query term appears in the chunk's section header (section headers are more definitional)
7. **Short chunk penalty:** Chunks under 80 chars have their score halved to avoid noisy matches
8. Top-K (default 3) chunks are injected into the system prompt under `[source_filename]` labels

### Knowledge base

| File | Content | Lines |
|---|---|---|
| `curriculum.md` | 9 modules F0–F8 with deliverables | 104 |
| `faq.md` | Admissions, cost, timeline, methodology | 61 |
| `aec-context.md` | Why AEC, world models, key technologies | 46 |
| `faculty.md` | Faculty profiles | 17 |

Knowledge files are loaded once at server startup and cached in memory for the process lifetime. No hot-reload — server restart required for knowledge updates.

---

## Rate Limiting

Two-layer architecture:

| Layer | Implementation | Survives restart? |
|---|---|---|
| In-memory | `Map<ip, { count, resetAt }>` | No |
| Redis | Upstash REST API (`@upstash/ratelimit`) | Yes |

The Redis layer is optional — activated only when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set. In development and single-instance deployments without Redis, the in-memory layer provides the same 30 req/hour per IP limit with the caveat that counts reset on server restart.

**Why Upstash?** HTTP REST API with no persistent TCP connection — works in serverless and single-instance contexts alike. Free tier supports the traffic volume of a waitlist campaign. The alternative (self-hosted Redis) would require a separate process and infrastructure management.

---

## Waitlist Persistence

Same two-layer pattern:

| Layer | Implementation | Survives restart? |
|---|---|---|
| In-memory | `WaitlistEntry[]` array | No |
| Airtable | REST API via `airtable` npm package | Yes |

Airtable save is fire-and-forget: `saveToAirtable(entry).catch(logger.warn)`. The HTTP response always returns `201` after the in-memory write — Airtable failures are logged but never block the user.

---

## Analytics

PostHog (via `posthog-js`) with a typed event wrapper in `artifacts/miaw/src/lib/analytics.ts`.

**GDPR posture:** `persistence: "memory"` — no cookies, no localStorage writes. All analytics data is session-scoped and lost on page close. No consent banner required.

**Graceful no-op:** When `VITE_POSTHOG_KEY` is not set, all analytics calls are silent no-ops. The same `analytics.*` API works in both modes.

**Tracked events:**

| Event | Properties |
|---|---|
| `conversation_started` | — |
| `conversation_turn` | `turn`, `visitor_type`, `response_length` |
| `profile_identified` | `visitor_type`, `turn` |
| `cta_shown` | `turn`, `visitor_type` |
| `waitlist_submitted` | `visitor_type`, `domain_tld`, `turn` |
| `error_shown` | `error_type`, `turn` |

---

## API Contract

Defined in `lib/api-spec/openapi.yaml` (OpenAPI 3.1). Codegen via Orval produces:

- `lib/api-spec/src/generated/` — Zod schemas for all request/response types
- React Query hooks for `GET /api/healthz` and `POST /api/waitlist`

The `/api/chat` endpoint is excluded from hook generation (raw streaming, not JSON) but its request/response schemas are still in the spec for documentation and Zod reuse.

**Codegen command:** `pnpm --filter @workspace/api-spec run codegen`

---

## Deployment

**Platform:** Replit Deployments (reserved VM)

**Build process:**
1. `pnpm --filter @workspace/api-server run build` — esbuild bundles the Express server to `artifacts/api-server/dist/index.mjs`
2. `pnpm --filter @workspace/miaw run build` — Vite builds the React app to `artifacts/miaw/dist/public`
3. Replit's deployment layer serves the static build from its CDN and starts the Node.js process

**Routing (`.replit-artifact/artifact.toml`):**
```toml
[[services]]
localPort = 8080
name = "API Server"
paths = ["/api"]
```

All `/api/*` traffic routes to the Node.js process. Everything else is served from the static CDN.

**Environment secrets (production — set in Replit Deployment Secrets):**

| Variable | Purpose | Required |
|---|---|---|
| `SESSION_SECRET` | Express session signing | Yes |
| `VITE_POSTHOG_KEY` | PostHog analytics | Optional |
| `UPSTASH_REDIS_REST_URL` | Redis rate limiting | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth | Optional |
| `AIRTABLE_API_KEY` | Waitlist persistence | Optional |
| `AIRTABLE_BASE_ID` | Airtable base | Optional |
| `AIRTABLE_TABLE_NAME` | Table name (default: "Waitlist") | Optional |

---

## Performance Characteristics

| Metric | Target | Measurement |
|---|---|---|
| Time to first token (chat) | < 600ms | Claude API p50 |
| Static asset TTFB | < 50ms | CDN edge |
| JS bundle (gzip) | < 150KB | Current: 127KB |
| CSS bundle (gzip) | < 20KB | Current: 14KB |
| Server cold start | < 3s | esbuild single bundle |
| Rate limit check latency | < 1ms (memory), < 30ms (Redis) | In-memory Map |

---

## Security Posture

| Control | Implementation |
|---|---|
| Transport security | HSTS 1 year, HTTPS enforced by Replit |
| Input validation | Zod schemas on all routes, 400 on violation |
| Payload size | 64KB cap on all request bodies |
| CORS | Allowlist regex, origin checked before route handlers |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Sensitive log fields | Pino `redact` on auth headers and cookies |
| Dependency surface | Minimal direct deps; no ORM, no CMS, no auth library |

---

## What Was Deliberately Excluded

| Technology | Considered | Decision |
|---|---|---|
| Next.js / SSR | Yes | No SEO benefit for a single-page experience; adds server complexity for zero gain |
| GraphQL | Yes | One endpoint. REST is correct. |
| Embedding-based RAG | Yes | 230 lines of KB; TF/BM25 is sufficient and has no cold-start cost |
| WebSockets | Yes | Unidirectional streaming; HTTP chunked transfer is simpler and correct |
| Redis (required) | Yes | Optional enhancement; in-memory fallback covers single-instance deployment |
| Next.js App Router streaming | Yes | The React frontend doesn't need SSR — the conversation starts on user interaction, not on page load |
| JWT authentication | No | No user accounts in Phase 0; waitlist is anonymous by design |

---

## Dependency Audit Surface

**Frontend (devDependencies — bundled at build time, not shipped as separate packages):**
- `react` `react-dom` — UI framework
- `framer-motion` — layout animations, streaming cursor
- `posthog-js` — analytics (no-op without key)
- `@workspace/api-spec` — generated hooks and Zod schemas

**Server (dependencies — runtime):**
- `express` `@types/express` — HTTP framework
- `@anthropic-ai/sdk` — Claude streaming
- `zod` — schema validation
- `helmet` — security headers
- `cors` — CORS middleware
- `pino` `pino-http` `pino-pretty` — logging
- `airtable` — waitlist persistence (optional path)
- `@upstash/ratelimit` — Redis rate limiting (optional path)
- `@upstash/redis` — Upstash Redis client
