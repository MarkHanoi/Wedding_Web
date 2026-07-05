# MIAW — System Design Reference
**Technical Component Map, Data Flows, and Stack Rationale**
Last updated: May 2026

---

## 1. Architecture Overview

MIAW Phase 0 is a pnpm monorepo with two production artifacts deployed as a single unit.

```
Browser
  │
  ▼
Replit Reverse Proxy (mTLS, path-based routing)
  ├── /           →  Static React build (Vite → CDN layer, sub-50ms TTFB)
  └── /api/*      →  Express 5 Node.js server (persistent process, port 8080)
```

The frontend is a fully pre-built static bundle — zero server-side rendering. The API server is a long-lived Node.js process. Both are bound by an OpenAPI contract that drives code generation in both directions.

**Why this split?** The frontend has zero runtime compute requirements — serving it from CDN gives sub-50ms TTFB globally. The API needs a persistent process for in-memory rate-limiting state and warm knowledge base loading. Separating concerns means the static UI can be updated without restarting the server, and vice versa.

---

## 2. Monorepo Structure

```
/
├── artifacts/
│   ├── miaw/                  ← Frontend (React + Vite)
│   │   ├── src/
│   │   │   ├── components/    ← ConversationCanvas, MessageBubble, CursorPrompt, CTAOverlay
│   │   │   ├── hooks/
│   │   │   ├── lib/           ← analytics.ts
│   │   │   └── pages/
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── api-server/            ← Backend (Express 5)
│       ├── src/
│       │   ├── routes/        ← chat.ts, waitlist.ts, og.ts, healthz.ts
│       │   └── lib/           ← rag.ts, profile.ts, systemPrompt.ts, logger.ts
│       ├── knowledge/         ← curriculum.md, faq.md, aec-context.md, faculty.md
│       └── package.json
│
├── lib/
│   ├── api-spec/              ← openapi.yaml + Orval codegen
│   ├── api-zod/               ← Generated Zod schemas
│   ├── api-client-react/      ← Generated React Query hooks
│   ├── db/                    ← Drizzle schema (Phase 1+)
│   └── integrations-anthropic-ai/  ← Anthropic SDK wrapper
│
├── docs/                      ← All documentation
├── pnpm-workspace.yaml        ← Workspace + catalog
└── tsconfig.json              ← Solution file (project references)
```

---

## 3. Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                          │
│                                                                      │
│  ConversationCanvas (root component — all state lives here)          │
│  ├── Gradient canvas (CSS @property mesh animation, 45s cycle)       │
│  ├── LayoutGroup (Framer Motion shared layout)                       │
│  │   ├── motion.h1 "miaw" (landing, layoutId="logo")                │
│  │   └── motion.button "miaw" (conversation header, layoutId="logo") │
│  ├── AnimatePresence → landing content (subtitle, cursor prompt)     │
│  ├── Message list (role="log" ARIA live region)                      │
│  │   └── MessageBubble × N (motion.div fade-up enter)               │
│  │       └── Streaming cursor (motion.span, blinks while streaming)  │
│  ├── TypingIndicator (3-dot pulse while request is in-flight)        │
│  ├── Input bar (disabled while streaming)                            │
│  └── CTAOverlay (email capture, shown at turn ≥ 8)                  │
│                                                                      │
│  Supporting modules:                                                 │
│  ├── analytics.ts (PostHog typed events, no-op without POSTHOG_KEY) │
│  └── ErrorBoundary (branded fallback on any React error)             │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │ HTTP (Replit proxy)
┌──────────────────────────────────────▼──────────────────────────────┐
│                    Backend (Express 5 / Node 24)                     │
│                                                                      │
│  Middleware stack (execution order):                                 │
│  pino-http → helmet → cors → json(64KB) → urlencoded(64KB)          │
│                                                                      │
│  Routes:                                                             │
│  GET  /api/healthz     → { status, uptime, timestamp, version }     │
│  POST /api/chat        → streaming text/plain (Claude)              │
│  POST /api/waitlist    → { success, message, domainTld }            │
│  GET  /api/og          → image/svg+xml (OG brand image)             │
│                                                                      │
│  Business logic:                                                     │
│  ├── rag.ts         BM25-inspired keyword retrieval (4 KB files)    │
│  ├── profile.ts     Visitor type inference (7 types, signal scoring) │
│  ├── systemPrompt.ts Dynamic prompt: persona + RAG + phase          │
│  └── logger.ts      Pino structured JSON, redacts auth/cookie       │
└──────────────────────────────────────┬──────────────────────────────┘
              ┌────────────────────────┼───────────────────────────┐
              ▼                        ▼                           ▼
    ┌──────────────────┐   ┌────────────────────┐   ┌──────────────────────┐
    │  Anthropic API   │   │  Upstash Redis     │   │  Airtable            │
    │  claude-sonnet   │   │  Rate limit store  │   │  Waitlist storage    │
    │  messages.stream │   │  Optional          │   │  Optional            │
    └──────────────────┘   └────────────────────┘   └──────────────────────┘
```

---

## 4. Data Flows

### 4.1 Chat Request (the main path)

```
1. User types message → ConversationCanvas handles submit
2. AbortController starts 30-second timeout
3. fetch POST /api/chat with { messages[], profile, turnCount }
4. Server: Zod validates ChatRequestSchema (400 on failure)
5. Server: checkRateLimit(ip) — memory or Redis (429 on exceeded)
6. Server: inferProfile(messages, profile, turnCount) → updated profile
7. Server: retrieveContext(lastUserMsg, conversationHistory, 3) → top-3 chunks
8. Server: buildSystemPrompt(ragContext, profile, turnCount) → ~800-token prompt
9. Server: anthropic.messages.stream({ model, max_tokens: 8192, system, messages })
10. Server: res.write(chunk.delta.text) for each streaming chunk
11. Client: ReadableStream reader accumulates chunks into streamed message
12. Client: setMessages() on each chunk → React re-renders bubble
13. Client: streaming ends → cursor blink stops → inferProfile() client-side
14. Client: PostHog event: conversation_turn
```

### 4.2 Waitlist Submission

```
1. User submits email → CTAOverlay calls POST /api/waitlist
2. Server: Zod validates WaitlistRequestSchema
3. Server: push to in-memory WaitlistEntry[] array (synchronous, always succeeds)
4. Server: saveToAirtable(entry).catch(logger.warn) — fire-and-forget
5. Server: 201 response with { success, message, domainTld }
6. Client: PostHog event: waitlist_submitted
7. Client: show confirmation state
```

### 4.3 RAG Retrieval (BM25-inspired)

```
Query: user message text + last 400 chars of conversation history
  ↓
tokenize() → lowercase → strip punctuation → filter stop words → min 3 chars
  ↓
build bigrams (consecutive token pairs)
  ↓
for each of ~60 chunks across 4 knowledge files:
  TF-normalized score per matching token (BM25 formula)
  + domain booster if token in 16 domain keywords (×1.5–2.0)
  + bigram bonus (+5 for exact compound term match)
  + header boost (+2.5 if token in section header)
  + short chunk penalty (×0.5 if chunk < 80 chars)
  ↓
return top-3 scored chunks with source filename labels
  ↓
inject into system prompt under [source_filename] headers
```

---

## 5. Runtime Stack

### Frontend

| Technology | Version | Purpose | Why chosen |
|---|---|---|---|
| React | 19 | UI framework | Auto-batching for streaming updates; concurrent rendering ready |
| Vite | 7 | Build tool | Sub-50ms HMR; esbuild-powered; content-hash production builds |
| Tailwind CSS | 4 | Styling | CSS-first config via `@theme`; `@property` typed custom properties for gradient |
| Framer Motion | 12 | Animation | FLIP animation (`layoutId`) across DOM nodes — CSS cannot do this |
| TypeScript | 5.9 | Language | Strict mode; shared types with backend via generated api-zod |
| posthog-js | latest | Analytics | GDPR-safe memory-only mode; graceful no-op without key |

### Backend

| Technology | Version | Purpose | Why chosen |
|---|---|---|---|
| Node.js | 24 LTS | Runtime | Native fetch, ReadableStream, crypto.randomUUID — no polyfills |
| Express | 5 RC | HTTP framework | Native async error propagation; mature middleware ecosystem |
| @anthropic-ai/sdk | latest | AI streaming | Claude streaming via typed SDK; Replit integration proxy |
| Zod | 3 | Validation | Runtime schema validation; generated from OpenAPI spec |
| Helmet | 8 | Security | 8 security headers in one middleware |
| Pino | 9 | Logging | Structured JSON; minimal overhead; automatic PII redaction |
| @upstash/redis | latest | Rate limiting | HTTP REST — no persistent connection; free tier sufficient |
| esbuild | 0.27 | Build | ~200ms server bundle; single ESM output with source maps |

### Toolchain

| Technology | Purpose |
|---|---|
| pnpm 10 workspaces | Monorepo; strict symlink isolation; version catalog |
| TypeScript project references | Composite lib builds; `--noEmit` for leaf artifacts |
| OpenAPI 3.1 + Orval | Code-generated React Query hooks and Zod schemas |
| @replit/vite-plugin-* | Dev banner, cartographer, error overlay |

---

## 6. API Contract

Defined in `lib/api-spec/openapi.yaml`. Run codegen with:
```bash
pnpm --filter @workspace/api-spec run codegen
```

### POST /api/chat

```typescript
// Request (Zod-validated)
{
  messages: Array<{ role: "user" | "assistant", content: string }> // max 50, content max 8000 chars
  profile?: {
    type: "architect" | "engineer" | "researcher" | "developer" | "student" | "urban_planner" | "unknown"
    context: string
    identified: boolean
    identifiedAtTurn: number | null
  }
  turnCount: number  // 0–30
}

// Response: text/plain stream (raw Claude output — no JSON envelope)
// Error 400: { error: "invalid_request", details: ZodError.flatten() }
// Error 429: { error: "rate_limit", message: string }
// Error 500: { error: "stream_error" }
```

### POST /api/waitlist

```typescript
// Request (Zod-validated)
{
  email: string        // valid email format
  visitorType: VisitorType
  conversationLength: number  // 0–20
  referrer?: string
}

// Response 201: { success: true, message: string, domainTld: string }
// Error 400: { error: "invalid_request", details: ZodError.flatten() }
```

### GET /api/healthz

```typescript
// Response 200: { status: "ok", uptime: number, timestamp: string, version: string }
```

---

## 7. Security Controls

| Control | Implementation | Layer |
|---|---|---|
| HTTPS enforced | Replit TLS + HSTS (1 year) | Infrastructure |
| Input validation | Zod schemas, every route, 400 on violation | Application |
| Payload cap | 64KB on all request bodies | Application |
| CORS allowlist | Regex: `.replit.app`, `.replit.dev`, `localhost` | Application |
| Clickjacking | `X-Frame-Options: SAMEORIGIN` via Helmet | Application |
| MIME sniffing | `X-Content-Type-Options: nosniff` via Helmet | Application |
| Log redaction | Pino redacts `authorization`, `cookie`, `set-cookie` | Application |
| Rate limiting | 30 req/hr/IP (memory + Redis) | Application |
| Content injection | User content in `messages[]`, never in `system` prompt | Application |
| Origin isolation | `Cross-Origin-Opener-Policy: same-origin` | Application |

---

## 8. Performance Characteristics

| Metric | Target | Current |
|---|---|---|
| Time to first token | < 600ms | Claude Sonnet p50 |
| Static TTFB | < 50ms | CDN edge |
| JS bundle (gzip) | < 150KB | 127KB ✅ |
| CSS bundle (gzip) | < 20KB | 14KB ✅ |
| Server cold start | < 3s | esbuild single bundle |
| Rate limit check | < 1ms (memory) / < 30ms (Redis) | In-memory Map |

---

## 9. Environment Variables

| Variable | Required | Set by | Purpose |
|---|---|---|---|
| `PORT` | Yes | Workflow | Server listen port |
| `BASE_PATH` | Yes | Workflow | Vite base path |
| `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` | Yes | Replit AI Integrations (auto) | Claude proxy URL |
| `AI_INTEGRATIONS_ANTHROPIC_API_KEY` | Yes | Replit AI Integrations (auto) | Dummy key for SDK compat |
| `VITE_POSTHOG_KEY` | No | Manual secret | Enable PostHog analytics |
| `UPSTASH_REDIS_REST_URL` | No | Manual secret | Redis rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | No | Manual secret | Upstash auth |
| `AIRTABLE_API_KEY` | No | Manual secret | Waitlist persistence |
| `AIRTABLE_BASE_ID` | No | Manual secret | Airtable base |
| `AIRTABLE_TABLE_NAME` | No | Manual secret | Table name (default: Waitlist) |

**Never set `AI_INTEGRATIONS_*` variables manually — they break the integration proxy.**

---

## 10. What Was Deliberately Excluded

| Technology | Why excluded |
|---|---|
| Next.js / SSR | No SEO pages; conversation starts on user interaction, not page load |
| GraphQL | One endpoint — REST is correct |
| Embedding-based RAG | 230-line knowledge base; BM25 keyword scoring is sufficient |
| WebSockets | Unidirectional streaming — HTTP chunked transfer is the right primitive |
| JWT / sessions | No user accounts in Phase 0; waitlist is anonymous |
| Redis (required) | Optional — in-memory fallback covers single-instance deployment |
| Vector database | Not warranted until KB exceeds ~10,000 chunks |
| SSE framing | Raw HTTP stream is simpler with identical browser support |
