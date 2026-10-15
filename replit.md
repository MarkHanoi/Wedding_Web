# Clémence & Antonio — Wedding Website

A wedding website for Clémence & Antonio. The video landing page leads into one continuous, scrollable information page with the weekend schedule, location, travel notes, dress code and RSVP form.

## Run & Operate

- On a fresh import, run `pnpm install --frozen-lockfile` before starting either service.
- Replit artifact previews use the managed workflows `artifacts/miaw: web` and `artifacts/api-server: API Server`.
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080)
- `pnpm --filter @workspace/miaw run dev` — frontend (port 5000)
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite (`artifacts/miaw`)
- API: Express 5 (`artifacts/api-server`)
- AI: Anthropic Claude via Replit AI Integrations (`claude-sonnet-4-6`)
- Rate limiting: in-memory fallback + Upstash Redis when configured

## Where things live

- `artifacts/miaw/src/App.tsx` — splash screen → WeddingCanvas
- `artifacts/miaw/src/components/WeddingCanvas.tsx` — continuous wedding information page and RSVP form
- `artifacts/miaw/src/components/` — MessageBubble, TypingIndicator, CursorPrompt, FloatingPanel, ErrorBoundary
- `artifacts/miaw/src/lib/dailyPalette.ts` — 11 rotating pastel palettes (one per day)
- `artifacts/api-server/src/routes/chat.ts` — Claude streaming endpoint (POST /api/chat) with rate limiting
- `artifacts/api-server/src/routes/rsvp.ts` — RSVP capture (POST /api/rsvp, GET /api/rsvp/count)
- `artifacts/api-server/src/routes/health.ts` — health check
- `artifacts/api-server/src/lib/systemPrompt.ts` — wedding concierge system prompt builder
- `artifacts/api-server/knowledge/wedding.md` — **all wedding content lives here** — fill in placeholders

## Filling in wedding details

Wedding facts for the API live in **`artifacts/api-server/knowledge/wedding.md`**. Update both that file and the matching visible information in `artifacts/miaw/src/components/WeddingCanvas.tsx` when event details are confirmed. Do not restore the previous Quinta Amala venue.

After editing the knowledge file, restart the API Server workflow for changes to take effect.

## Architecture decisions

- Chat streams raw text from Claude — no JSON chunking, minimum latency.
- Knowledge base is loaded once at server start from `artifacts/api-server/knowledge/wedding.md`.
- RSVP data is stored in-memory (survives restarts only while the process is alive). For production, add a database or Airtable connection.
- Gradient: 4 radial blobs with CSS @property animation — 45s slow flow, daily palette rotation.
- Rate limiting: 40 messages/hour per IP. In-memory Map always on; Upstash Redis when env vars present.

## Design

- Font: DePixelBreit (pixel font) for "C & A" logo — chunky visible pixel blocks
- Gradient: 4 radial blobs (pastel), 11-palette daily rotation defined in `dailyPalette.ts`; the scroll page keeps the gradient fixed behind its content
- Body text: Inter weight 300–400

## Optional environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Override API base URL (e.g. for custom domains) |
| `UPSTASH_REDIS_REST_URL` | Redis-backed rate limiting (survives restarts) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash auth token |
| `ALERT_WEBHOOK_URL` | Slack/Discord webhook for error spike alerts |

## User preferences

- Background gradient: slow-moving, flowing, "alive" — fully pastel palette. Animation: 45s. Daily palette rotation: 11 pastel moods cycling. cuanto más pastel mejor.
- Font for logo: DePixelBreit (pixel font) at large size (clamp ~48–104px) — chunky visible pixel blocks.

## Gotchas

- Knowledge files must be at `artifacts/api-server/knowledge/` (relative to process.cwd() when the server starts)
- The chat endpoint streams plain text — the frontend reads `response.body` with a ReadableStream reader
- CSS @property requires Chrome 85+, Firefox 128+, Safari 16.4+
- The Anthropic integration uses `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` + `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (auto-provisioned by Replit — never set these manually)
