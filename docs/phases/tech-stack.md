# MIAW — Technology Stack
**Master In Intelligent Artificial Worlds**
Technical Overview & Decision Rationale
Last updated: May 2026

---

## Summary

MIAW is built as a modern, minimal web platform with two parts: a static frontend (the interface the user sees) and a lightweight backend server (which handles AI, rate limiting, and data capture). Both are hosted on Replit and accessed through a single URL — the user never sees two separate systems.

---

## Architecture at a Glance

```
Browser
  │
  ▼
Replit Reverse Proxy (secure, path-based routing)
  ├── /           →  Frontend (React — static files served from CDN)
  └── /api/*      →  Backend (Node.js Express server — port 8080)
```

The frontend is pre-built and served from a global CDN — it loads in under 50ms worldwide with no server involved. The backend is a persistent Node.js process that handles AI calls, rate limiting, and waitlist capture.

---

## Layer 1 — Language & Toolchain

| Choice | Why |
|---|---|
| **TypeScript 5.9** | Single language across frontend and backend. Strict type checking catches bugs before deployment. Shared types mean the frontend and backend always agree on data shapes. |
| **Node.js 24 (LTS)** | Latest long-term support release. Native support for streaming, fetch, and crypto — no extra packages needed for core operations. |
| **pnpm Workspaces** | Manages the monorepo (one codebase, multiple packages). Prevents version conflicts between packages. Enforces consistent library versions across the entire project via a shared catalog. |

---

## Layer 2 — Frontend

| Choice | Why |
|---|---|
| **React 19** | Industry-standard UI library. Handles the streaming chat updates efficiently — multiple state changes per second batch into single renders, preventing flickering. |
| **Vite 7** | Build tool. Produces a lean, optimised bundle: **127KB JavaScript + 14KB CSS** (compressed). Hot-reloads changes in under 50ms during development. |
| **Tailwind CSS 4** | Utility-first styling. The animated gradient background is built with CSS `@property` — a modern browser feature that lets the gradient blobs animate as typed layout values. Zero JavaScript animation loop, zero battery cost. |
| **Framer Motion 12** | Used for two specific things only: (1) the MIAW logo physically moves and rescales from the centre of the screen to the top-left corner when the conversation starts — this requires animating across two different DOM elements simultaneously, which only Framer Motion handles correctly; (2) message bubbles fade and slide in as they appear. |
| **Wouter** | Lightweight client-side router (2KB). React Router would be overkill for a single-page experience. |

### Why not Next.js?
Next.js adds server-side rendering. MIAW has no SEO-sensitive pages — the conversation starts on user interaction, not on page load. Static React + Vite is simpler, faster to build, and cheaper to host.

---

## Layer 3 — Backend

| Choice | Why |
|---|---|
| **Express 5** | Mature, minimal HTTP framework. Handles async errors natively (no boilerplate try/catch wrappers). Right-sized for one streaming endpoint — heavier frameworks (NestJS, Fastify) would add complexity for no benefit. |
| **Zod** | Every request is validated against a strict schema before any code runs. Invalid inputs return a structured 400 error with field-level detail. Prevents malformed data from ever reaching the AI or database layers. |
| **Pino** | Structured JSON logging. Sensitive fields (auth headers, cookies) are automatically redacted before they can appear in any log output. Human-readable in development, machine-parseable in production. |
| **Helmet** | Sets 8 security headers on every response automatically: HSTS, clickjacking protection, MIME sniffing protection, referrer policy, cross-origin isolation. One line of code for a significant security baseline. |

### Why not GraphQL?
There is one endpoint. REST is the correct tool. GraphQL introduces schema complexity and tooling overhead that is only justified when you have many interconnected data types and multiple clients.

---

## Layer 4 — AI Pipeline

| Choice | Why |
|---|---|
| **Anthropic Claude (claude-sonnet-4-6)** | Best-in-class reasoning and instruction-following. Sonnet is the right balance of capability and cost — Opus would be more powerful but 5× more expensive per conversation. |
| **Replit AI Integrations proxy** | No API key management required. Keys are provisioned and rotated automatically by Replit. Billing goes through Replit credits. |
| **Raw HTTP streaming (no SSE, no WebSockets)** | The first word of Claude's response appears in the browser before the model has finished its second sentence. SSE would add a formatting envelope with zero benefit. WebSockets are for bidirectional communication — this is unidirectional, so HTTP streaming is correct and simpler. |

### Streaming flow
```
Claude API → Express (stream) → HTTP response body → Browser ReadableStream → React state → UI
```
No JSON parsing. No buffering. Minimum latency from model to screen.

---

## Layer 5 — Knowledge Base (RAG)

The agent answers questions about the curriculum, admissions, methodology, and AEC context using a retrieval system — it finds the most relevant knowledge chunks and injects them into the AI prompt before each response.

| Choice | Why |
|---|---|
| **Custom keyword scoring (BM25-inspired)** | The knowledge base is ~230 lines across 4 files. Embedding vectors and a vector database would add significant infrastructure cost and complexity for a dataset this size. The keyword approach retrieves the right chunks with high accuracy because the domain vocabulary is specific (BIM, Gaussian Splatting, cohort, etc.). |
| **No external vector DB** | No Pinecone, no Weaviate, no pgvector. Knowledge is loaded once at server startup and lives in memory. Updates require a server restart — acceptable for a knowledge base that changes infrequently. |

### Knowledge files

| File | Content |
|---|---|
| `curriculum.md` | 9 modules (F0–F8) with deliverables and learning outcomes |
| `faq.md` | Admissions, cost, timeline, methodology |
| `aec-context.md` | Why AEC, world models, key technologies |
| `faculty.md` | Faculty profiles |

---

## Layer 6 — Rate Limiting

Two layers, both active simultaneously:

| Layer | Technology | Survives server restart? |
|---|---|---|
| In-memory | Native JavaScript Map | No |
| Distributed | Upstash Redis (REST API) | Yes |

**Limit:** 30 AI requests per IP per hour.

**Why Upstash?** HTTP REST interface — works without a persistent TCP connection. Free tier covers the traffic volume of a waitlist campaign. Self-hosted Redis would require a separate managed process and infrastructure.

The Redis layer is optional. The in-memory layer is always on. In production with expected traffic, Redis should be enabled so rate limit counts survive server restarts.

---

## Layer 7 — Waitlist Capture

Same two-layer pattern:

| Layer | Technology | Survives restart? |
|---|---|---|
| In-memory | JavaScript array | No |
| Persistent | Airtable (REST API) | Yes |

Airtable save is fire-and-forget — if Airtable is unavailable, the user still gets a `201 OK` response. Failures are logged. The entry is always written to memory first.

**Why Airtable?** Non-technical team members can view, filter, and export waitlist entries without any database tooling. Free tier covers thousands of entries.

---

## Layer 8 — Analytics

| Choice | Why |
|---|---|
| **PostHog** | Open-source, self-hostable, GDPR-compliant. Free tier covers 1M events/month. |
| **Memory-only persistence** | `persistence: "memory"` — no cookies, no localStorage. All data is session-scoped. No consent banner required under GDPR. |
| **Graceful no-op** | When the PostHog key is not set, all analytics calls do nothing silently. Same code, two modes. |

### Events tracked

| Event | What it tells us |
|---|---|
| `conversation_started` | Total visitors who engaged |
| `conversation_turn` | Drop-off by turn number |
| `profile_identified` | Visitor type breakdown (architect / engineer / researcher…) |
| `cta_shown` | How many reach the waitlist screen |
| `waitlist_submitted` | Conversion rate |
| `error_shown` | Error frequency and type |

---

## Deployment

| Item | Detail |
|---|---|
| **Platform** | Replit Autoscale Deployments |
| **Frontend** | Pre-built static files → served from Replit CDN |
| **Backend** | Persistent Node.js process → port 8080 |
| **Build time** | ~200ms (server esbuild) + ~3s (Vite client build) |
| **Cold start** | < 3 seconds |
| **HTTPS** | Enforced by Replit — automatic TLS, HSTS 1 year |

---

## Performance Targets

| Metric | Target | Current |
|---|---|---|
| Time to first token (AI) | < 600ms | Claude p50 |
| Page load (static assets) | < 50ms | CDN edge |
| JavaScript bundle (compressed) | < 150KB | **127KB** ✅ |
| CSS bundle (compressed) | < 20KB | **14KB** ✅ |
| Server cold start | < 3s | esbuild single bundle |

---

## Security Summary

| Control | How |
|---|---|
| HTTPS enforced | Replit TLS + HSTS header (1 year) |
| Input validation | Zod schemas on every endpoint — 400 on any violation |
| Payload cap | 64KB maximum on all request bodies |
| CORS | Allowlist restricted to `.replit.app`, `.replit.dev`, `localhost` |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Log redaction | Auth headers and cookies never appear in logs |
| Rate limiting | 30 req/hour per IP (memory + Redis) |

---

## What Was Deliberately Left Out

| Technology | Why excluded |
|---|---|
| Next.js / SSR | No SEO pages; static React is simpler and cheaper |
| GraphQL | One endpoint — REST is correct |
| Embedding-based RAG | 230-line knowledge base; keyword scoring is sufficient |
| WebSockets | Unidirectional streaming — HTTP chunked transfer is the right primitive |
| JWT / sessions | No user accounts in Phase 0; waitlist is anonymous by design |
| Self-hosted Redis | Upstash REST API achieves the same result with no infrastructure to manage |
| Vector database | Not warranted until the knowledge base exceeds ~10,000 chunks |

---

## Optional Environment Variables (Production)

| Variable | Purpose | Required |
|---|---|---|
| `VITE_POSTHOG_KEY` | Enable PostHog analytics | Optional |
| `UPSTASH_REDIS_REST_URL` | Redis-backed rate limiting | Optional |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token | Optional |
| `AIRTABLE_API_KEY` | Persist waitlist to Airtable | Optional |
| `AIRTABLE_BASE_ID` | Airtable base identifier | Optional |
| `AIRTABLE_TABLE_NAME` | Table name (default: "Waitlist") | Optional |

The AI integration keys (`AI_INTEGRATIONS_ANTHROPIC_BASE_URL`, `AI_INTEGRATIONS_ANTHROPIC_API_KEY`) are provisioned automatically by Replit — they must never be set or modified manually.

---

*Document prepared for internal use — MIAW project team, May 2026*
