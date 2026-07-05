# MIAW — Enterprise Architecture (TOGAF)

> Architecture Domain: Digital Product — Conversational AI Platform
> Framework: TOGAF 10 (simplified application)
> Status: Phase A complete (Architecture Vision), Phases B–D current state documented

---

## 1. Architecture Vision

### 1.1 Problem Statement

The Architecture, Engineering, and Construction (AEC) sector lacks practitioners who fluently combine domain expertise with AI engineering capability. Existing postgraduate education either teaches AI to non-practitioners (theoretical, tool-centric) or teaches domain practice to AI engineers (shallow domain knowledge). No program systematically develops the hybrid practitioner.

MIAW exists to close that gap. The website is the first touchpoint: it must qualify and activate the specific profile of practitioner who would benefit, and do so at global scale with minimal operational overhead.

### 1.2 Architecture Drivers

| Driver | Description | Priority |
|---|---|---|
| Conversion quality | Attract right-fit applicants, not volume | Critical |
| Operational simplicity | Run with zero dedicated ops team initially | Critical |
| Time-to-value | Visitor to waitlist in under 3 minutes | High |
| Scalability | Handle cohort-announcement traffic spikes | High |
| Brand differentiation | Platform must feel as advanced as the program | High |
| Cost at scale | Run on minimal infrastructure indefinitely | Medium |

### 1.3 Architecture Principles

| # | Principle | Rationale |
|---|---|---|
| AP-01 | Conversation over content | The program's differentiation is its depth — demonstrate it through interaction, not marketing copy |
| AP-02 | Intelligence through specificity | Never claim intelligence; show it through the precision of questions and responses |
| AP-03 | Minimal surface, maximum depth | One interaction model, no navigation, no scroll — remove all friction that isn't conversation |
| AP-04 | Graceful degradation | Every integration (Redis, Airtable, PostHog) has an in-memory fallback; the core experience never breaks |
| AP-05 | Contract-first API design | OpenAPI spec is the source of truth; client hooks and server validation are generated from it |
| AP-06 | No vendor lock-in on core experience | The conversation is powered by Claude via a standard Anthropic SDK — model can be swapped |
| AP-07 | Privacy by design | No cookies, no persistent client storage, memory-only analytics, GDPR-safe from day one |

---

## 2. Business Architecture

### 2.1 Business Context

```
┌─────────────────────────────────────────────────────────────────┐
│                        MIAW Ecosystem                           │
│                                                                 │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │   Prospect  │───▶│  MIAW.ai     │───▶│   Waitlist        │  │
│  │  (Visitor)  │    │  (This site) │    │   (Airtable)      │  │
│  └─────────────┘    └──────────────┘    └───────────────────┘  │
│                             │                     │            │
│                             ▼                     ▼            │
│                     ┌──────────────┐    ┌───────────────────┐  │
│                     │ Claude API   │    │  Admissions Team  │  │
│                     │ (Anthropic)  │    │  (Human review)   │  │
│                     └──────────────┘    └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Value Streams

**Value Stream 1: Prospect Qualification**
```
Visitor arrives → Gradient landing → Click/keypress → AI interview (8 turns) → Waitlist CTA
```
Each step has a defined conversion checkpoint. The AI interview is not decoration — it serves as a lightweight qualification screen that also builds the prospect's connection to the program before any enrollment decision.

**Value Stream 2: Cohort Intelligence**
```
Waitlist entries (with visitor type) → Analytics → Faculty brief → Cohort composition decisions
```
Every waitlist entry captures `visitorType` (architect, engineer, researcher, etc.) and conversation length. This feeds directly into cohort composition planning.

**Value Stream 3: Demand Signaling**
```
Waitlist size + profile mix → Pricing decisions + Program shape + Faculty selection
```
The first cohort is being co-designed. High architect-to-developer ratio may influence which modules are expanded. The platform captures this data automatically.

### 2.3 Business Capabilities

| Capability | Current Implementation | Maturity |
|---|---|---|
| Prospect engagement | Claude conversational AI (8 turns) | Optimised |
| Profile classification | Keyword-based visitor type inference | Developing |
| Waitlist management | In-memory + Airtable | Basic |
| Analytics | PostHog event tracking | Basic |
| Rate control | IP-based, 30 req/hr | Sufficient |
| Brand experience | Animated gradient, pixel logo | Optimised |

### 2.4 Stakeholder Map

| Stakeholder | Primary Interest | Concern |
|---|---|---|
| Program Director | Qualified applicant pipeline | Volume vs. quality balance |
| Faculty | Student preparation level | Technical prerequisites not met |
| Prospective Student | Is this right for me? | Time commitment, cost, job outcomes |
| Investor / Funder | Demand signal | Is the market real? |
| Admissions Reviewer | Efficient shortlisting | Insufficient data per applicant |
| Ops Team | Low maintenance | Integration failures, data loss |

---

## 3. Information Architecture

### 3.1 Core Data Entities

```
┌────────────────────────────────────────────────────────────────┐
│                      Data Model                                │
│                                                                │
│  Conversation (in-memory, session-scoped)                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  sessionId    : string (client-generated UUID)          │   │
│  │  messages[]   : { role, content, timestamp }            │   │
│  │  turnCount    : number (0–8)                            │   │
│  │  profile      : VisitorProfile                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  VisitorProfile (inferred, updated each turn)                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  type         : architect | engineer | developer |      │   │
│  │                 researcher | designer | urban | unknown  │   │
│  │  context      : string (first 200 chars of user text)   │   │
│  │  identified   : boolean                                 │   │
│  │  identifiedAtTurn : number | null                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  WaitlistEntry (persisted to Airtable + in-memory fallback)    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  email        : string (validated format)               │   │
│  │  visitorType  : VisitorProfile.type                     │   │
│  │  conversationLength : number                            │   │
│  │  referrer     : string | undefined                      │   │
│  │  createdAt    : ISO timestamp                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  KnowledgeBase (loaded once at server startup, cached)         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  4 Markdown files → parsed into ~60 chunks              │   │
│  │  curriculum.md, faq.md, aec-context.md, faculty.md      │   │
│  │  Chunked by section, scored per-request with BM25       │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flows

**Chat Request Flow:**
```
Client sends { messages[], profile, turnCount }
  → Zod validates schema
  → RAG retrieves top-3 knowledge chunks (BM25 scoring)
  → System prompt assembled (profile + RAG context + phase)
  → Anthropic SDK streams response
  → Raw text chunks written to HTTP response body
  → Client accumulates stream into single bubble
  → Profile re-inferred client-side from full conversation
```

**Waitlist Submit Flow:**
```
Client sends { email, visitorType, conversationLength, referrer }
  → Zod validates (email format, type enum, bounds)
  → Entry written to in-memory array (synchronous, always succeeds)
  → Airtable save fired as background task (async, logged on failure)
  → 201 response returned immediately
  → Analytics event fired client-side
```

### 3.3 Data Residency and Privacy

| Data | Where Stored | Retention | PII? |
|---|---|---|---|
| Conversation content | Client memory only | Session | Partial |
| Messages sent to Claude | Anthropic API (transient) | Per their policy | Yes |
| Waitlist email | In-memory + Airtable | Until cohort closes | Yes |
| Analytics events | PostHog (EU/US instance) | PostHog policy | Pseudonymous |
| Rate limit counters | In-memory / Upstash Redis | 1 hour TTL | IP address |
| Server logs | Replit log sink | 7 days | IP via pino-http |

**GDPR considerations:**
- No cookies set by the application
- PostHog configured with `persistence: "memory"` — no localStorage writes
- Airtable entries require a data processing agreement with Airtable Inc.
- Server logs contain IP addresses — ensure log retention aligns with applicable law
- Future: add explicit consent capture at waitlist step

---

## 4. Application Architecture

### 4.1 Component Map

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Frontend (React + Vite)                       │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  ConversationCanvas (root component)                         │    │
│  │  ├── Gradient canvas (CSS @property mesh animation)         │    │
│  │  ├── LayoutGroup (Framer Motion shared layout)              │    │
│  │  │   ├── motion.h1 "miaw" (landing, layoutId="logo")        │    │
│  │  │   └── motion.button "miaw" (conversation, layoutId="logo")│   │
│  │  ├── AnimatePresence → landing content (subtitle, cursor)   │    │
│  │  ├── Message list (role="log")                              │    │
│  │  │   └── MessageBubble × N (motion.div enter animation)     │    │
│  │  │       └── Streaming cursor (motion.span, blinks while    │    │
│  │  │           isStreaming on last message)                    │    │
│  │  ├── TypingIndicator (3-dot pulse while waiting)            │    │
│  │  ├── Input bar (disabled while streaming)                   │    │
│  │  └── CTAOverlay (email capture, shown at turn 8)            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  Supporting:                                                         │
│  ├── analytics.ts (PostHog typed events, no-op without key)         │
│  ├── ErrorBoundary (branded fallback on React error)                │
│  └── @workspace/api-spec (generated React Query hooks + Zod)        │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │ HTTP (via Replit proxy)
┌──────────────────────────────────────▼──────────────────────────────┐
│                      Backend (Express 5 / Node 24)                   │
│                                                                      │
│  Middleware stack:                                                   │
│  helmet → cors → json(64KB) → pino-http                             │
│                                                                      │
│  Routes:                                                             │
│  ├── GET  /api/healthz    → { status: "ok", uptime }                │
│  ├── POST /api/chat       → streaming text (Claude)                 │
│  │   ├── Zod: ChatRequestSchema                                     │
│  │   ├── Rate limit check (memory + Redis)                         │
│  │   ├── RAG: retrieveContext() → top-3 chunks                     │
│  │   ├── buildSystemPrompt(ragContext, profile, turnCount)          │
│  │   └── anthropic.messages.stream() → pipe to res                 │
│  ├── POST /api/waitlist   → { success, domainTld }                  │
│  │   ├── Zod: WaitlistRequestSchema                                 │
│  │   ├── In-memory write                                            │
│  │   └── Airtable save (fire-and-forget)                            │
│  └── GET  /api/og         → SVG (OG image for social sharing)       │
│                                                                      │
│  Libraries:                                                          │
│  ├── rag.ts (BM25-inspired keyword retrieval, 4 knowledge files)    │
│  ├── profile.ts (visitor type inference)                            │
│  ├── systemPrompt.ts (dynamic prompt builder)                       │
│  └── logger.ts (pino, structured JSON, redacted headers)            │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
           ┌───────────────────────────┼───────────────────────────┐
           ▼                           ▼                           ▼
   ┌───────────────┐         ┌──────────────────┐       ┌──────────────────┐
   │  Anthropic    │         │  Upstash Redis   │       │  Airtable        │
   │  Claude API   │         │  (rate limiting) │       │  (waitlist)      │
   │  (streaming)  │         │  optional        │       │  optional        │
   └───────────────┘         └──────────────────┘       └──────────────────┘
```

### 4.2 Interface Contracts

All interfaces are defined in `lib/api-spec/openapi.yaml` and code-generated. Key contracts:

**POST /api/chat**
```yaml
Request:
  messages: Array<{ role: "user"|"assistant", content: string (max 4000) }>
  profile?: { type, context, identified, identifiedAtTurn }
  turnCount: integer (0–20)

Response (200): text/plain stream
Response (400): { error: "invalid_request", message, details }
Response (429): { error: "rate_limited", message, retryAfter }
Response (500): { error: "internal_error" }
```

**POST /api/waitlist**
```yaml
Request:
  email: string (email format)
  visitorType: enum (architect|engineer|developer|researcher|designer|urban|unknown)
  conversationLength: integer (0–20)
  referrer?: string

Response (201): { success: true, message, domainTld }
Response (400): { error: "invalid_request", details }
```

### 4.3 Application Interaction Patterns

| Pattern | Where Used | Why |
|---|---|---|
| HTTP streaming (chunked transfer) | /api/chat | Minimum time-to-first-token; no envelope overhead |
| Fire-and-forget with catch | Airtable save | Response never blocked by third-party latency |
| In-memory fallback | Rate limit, waitlist | Core experience works without external dependencies |
| Client-side profile inference | ConversationCanvas | Profile updates without an extra round-trip |
| Generated API hooks | React Query hooks from OpenAPI | Single source of truth for request/response types |
| Shared layout animation | Framer Motion layoutId | Logo FLIP transition across DOM nodes |

---

## 5. Technology Architecture

### 5.1 Infrastructure Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Replit Deployment                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Replit Reverse Proxy (mTLS, path routing)              │   │
│  │  / → CDN static assets (Vite build)                    │   │
│  │  /api → Node.js process (port 8080)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────┐  ┌──────────────────────────────┐  │
│  │  Static Build (CDN)    │  │  Node.js Process (persistent)│  │
│  │  Vite output           │  │  Express 5, port 8080        │  │
│  │  artifacts/miaw/dist/  │  │  artifacts/api-server/dist/  │  │
│  │  content-hashed assets │  │  esbuild single bundle       │  │
│  └────────────────────────┘  └──────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
          │                           │
          ▼                           ▼
   ┌─────────────┐           ┌────────────────────────────┐
   │  Browser    │           │  External Services         │
   │  React 18   │           │  ├── Anthropic API         │
   │  FM 12      │           │  ├── Upstash Redis (opt)   │
   │  Tailwind 4 │           │  ├── Airtable (opt)        │
   └─────────────┘           │  └── PostHog (opt)         │
                             └────────────────────────────┘
```

### 5.2 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.9 | Strict end-to-end typing |
| Runtime | Node.js | 24 LTS | Native fetch, ReadableStream |
| Package manager | pnpm | 10 | Workspace isolation, catalogs |
| Frontend framework | React | 18 | Concurrent rendering, streaming |
| Build tool (client) | Vite | 7 | Sub-50ms HMR, content-hash builds |
| Build tool (server) | esbuild | latest | ~200ms server bundle |
| CSS framework | Tailwind CSS | 4 | CSS-first config, @property support |
| Animation | Framer Motion | 12 | Shared layout (FLIP), motion primitives |
| API framework | Express | 5 | Async error propagation, mature ecosystem |
| AI SDK | @anthropic-ai/sdk | latest | Streaming, typed responses |
| Validation | Zod | 3 | Runtime schema validation |
| Security | Helmet | 8 | 9 response security headers |
| Logging | Pino | 9 | Structured JSON, minimal overhead |
| API contract | OpenAPI | 3.1 | Code-generated hooks and schemas |
| Analytics | PostHog | latest | Privacy-first, no-cookie mode |
| Rate limiting | @upstash/ratelimit | latest | Distributed, HTTP REST |

### 5.3 Technology Decisions Not Made Yet

| Decision | Options | Current State | Priority |
|---|---|---|---|
| Custom domain TLS | Replit cert / Cloudflare | Replit managed | When domain confirmed |
| Video CDN | Cloudflare Stream / Mux | Not needed yet | Phase 2 |
| Auth provider | Replit Auth / Clerk | Not implemented | Phase 3 (admin) |
| Database (relational) | Postgres / Supabase | In-memory + Airtable | Phase 3 |
| Search (full-text) | Elasticsearch / Typesense | BM25 sufficient | Phase 3+ |
| Email provider | Resend / Postmark | Not implemented | Phase 2 |

---

## 6. Architecture Roadmap

### Current State (Phase 0 + P1 hardening)

Full conversational landing page. Production deployed. Security hardened. Core functionality complete.

### Phase 1 Target (P1 — Complete)

Security headers, Zod validation, CORS restriction, global error handling, OpenAPI /chat endpoint, PostHog analytics, Framer Motion animations, BM25 RAG.

### Phase 2 Target (Planned)

Application form (structured after waitlist), email confirmation flow, admin dashboard (read-only waitlist view), faculty profile pages.

### Phase 3 Target (Future)

User accounts, application status portal, cohort management, payment integration, LMS integration hook.

### Gap Analysis: Current → Phase 2

| Capability | Current Gap | Bridging Action |
|---|---|---|
| Email confirmation | No email sending | Add Resend integration |
| Application form | Email only | Post-CTA form page |
| Admin visibility | No dashboard | Read-only Airtable view (interim) |
| SEO | Single-page, no crawlable content | Add /about static page for bots |
| OG image dynamic | Static SVG | Add visitor-type-aware OG image |
