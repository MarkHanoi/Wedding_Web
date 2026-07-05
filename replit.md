# MIAW — Master In Intelligent Artificial Worlds

A full-screen conversational AI website. When you open it, you get an animated mesh gradient canvas with a big "miaw" pixel-font logo — click anywhere or press a key, and the agent (powered by Claude) takes over. It interviews you for up to 8 turns, then presents a waitlist CTA. No traditional landing page, no nav, no scroll. Just Claude.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/miaw run dev` — run the frontend (port 20778)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (artifacts/miaw)
- API: Express 5 (artifacts/api-server)
- AI: Anthropic Claude via Replit AI Integrations (claude-sonnet-4-6)
- Analytics: posthog-js (optional — set VITE_POSTHOG_KEY)
- Rate limiting: in-memory fallback + Upstash Redis when configured
- Waitlist persistence: in-memory fallback + Airtable when configured

## Where things live

- `artifacts/miaw/src/components/ConversationCanvas.tsx` — main UI, all conversation + profile state
- `artifacts/miaw/src/lib/analytics.ts` — PostHog typed event helpers
- `artifacts/miaw/src/components/` — MessageBubble, TypingIndicator, CursorPrompt, CTAOverlay, ErrorBoundary
- `artifacts/api-server/src/routes/chat.ts` — Claude streaming endpoint (POST /api/chat) with rate limiting
- `artifacts/api-server/src/routes/waitlist.ts` — waitlist capture (POST /api/waitlist) with Airtable
- `artifacts/api-server/src/routes/og.ts` — OG image endpoint (GET /api/og) returns branded SVG
- `artifacts/api-server/src/lib/rag.ts` — keyword-based knowledge retrieval
- `artifacts/api-server/src/lib/profile.ts` — visitor type inference (architect/engineer/researcher/etc)
- `artifacts/api-server/src/lib/systemPrompt.ts` — dynamic system prompt builder
- `artifacts/api-server/knowledge/` — 3 knowledge base markdown files (curriculum 9 modules, aec-context, faq)
- `lib/api-spec/openapi.yaml` — API contract (healthz + waitlist)

## Architecture decisions

- Chat streams raw text directly from Claude — no JSON chunking, minimum latency. Frontend accumulates into a single streaming bubble.
- RAG is keyword-scored (no embeddings) — fast, zero deps, good enough for a small static knowledge base.
- Visitor profile is inferred client-side AND server-side each turn; client state updates after each response.
- Rate limiting: in-memory Map (always on) + Upstash Redis when env vars present (survives restarts).
- Waitlist: in-memory array + Airtable save (best-effort, logged on failure, never blocks the response).
- Analytics: PostHog gracefully no-ops when VITE_POSTHOG_KEY is not set. GDPR-safe: memory persistence only.
- CSS @property for flowing mesh gradient — blob positions animate as typed percentage variables.
- Error boundary wraps the full app — any React error shows a branded fallback instead of a blank screen.

## Design

- Font: Press Start 2P (Google Fonts) for "miaw" logo — large chunky pixel blocks
- Gradient: 4 radial blobs (blue left, pink right) with CSS @property animation — 45s slow flow
- "How to apply" centered at top; "ask me anything" cursor centered-right
- Inter (weight 300) for subtitle and all body text

## Optional environment variables

| Variable | Purpose |
|---|---|
| `VITE_POSTHOG_KEY` | PostHog project key — enables analytics |
| `VITE_POSTHOG_HOST` | PostHog host (default: us.i.posthog.com) |
| `UPSTASH_REDIS_REST_URL` | Redis-backed rate limiting (survives restarts) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token |
| `AIRTABLE_API_KEY` | Persist waitlist entries to Airtable |
| `AIRTABLE_BASE_ID` | Airtable base ID |
| `AIRTABLE_TABLE_NAME` | Table name (default: "Waitlist") |
| `AIRTABLE_APPLICATIONS_TABLE` | Airtable table for application records (default: "Applications") |
| `RESEND_API_KEY` | Resend API key — enables transactional emails (applicant ack + admissions notification) |
| `ADMISSIONS_EMAIL` | Where admissions notifications are sent (required for team emails) |
| `FROM_EMAIL` | Sender address (default: `MIAW Admissions <hello@miaw.ai>`) — requires domain verification in Resend |
| `DATABASE_URL` | Postgres connection string — enables durable application persistence (P2-F admin dashboard) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) — enables enrollment payment via Stripe Checkout (P4-B) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) — required for webhook signature verification |
| `STRIPE_PRICE_ID` | Optional pre-configured Stripe Price ID — if absent, a dynamic price is built from `ENROLLMENT_FEE_EUR` |
| `ENROLLMENT_FEE_EUR` | Enrollment fee in whole EUR (default: `600`) — used when `STRIPE_PRICE_ID` is not set |

## User preferences

- Background gradient: slow-moving, flowing, "alive" — fully pastel palette. Animation: 45s normal / 120s application mode / 180s acknowledged. Daily palette rotation: 7 pastel moods (one per day of year, cycling) defined in `artifacts/miaw/src/lib/dailyPalette.ts`. cuanto más pastel mejor.
- Font for "miaw" logo: Press Start 2P at large size (clamp 52px→108px) — chunky visible pixel blocks.

## Gotchas

- Knowledge files must be at `artifacts/api-server/knowledge/` (relative to process.cwd() when the server starts)
- The chat endpoint streams plain text, not JSON — the frontend reads `response.body` with a ReadableStream reader
- CSS @property requires Chrome 85+, Firefox 128+, Safari 16.4+ — falls back to static gradient in older browsers
- The Anthropic integration uses `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (auto-provisioned by Replit — never set these manually)
- posthog-js is in devDependencies (Vite static artifact) — correct per workspace conventions

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Implementation plan: `attached_assets/MIAW_Phase0_Implementation_Plan_v2_1778821821133.md`
- T-28 (system prompt tuning) is a human task — run the 3 test personas in the spec and refine the prompt
