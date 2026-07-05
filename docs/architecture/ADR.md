# Architecture Decision Records (ADRs)

> Format: each ADR captures the decision, the context that drove it, the options considered, and the consequences accepted.
> Status: Proposed → Accepted → Deprecated → Superseded

---

## ADR-001: Single-page conversational interface with no navigation

**Status:** Accepted

**Context:**
A traditional landing page for a postgraduate program would include: hero section, program overview, curriculum, faculty, testimonials, pricing, application form. This is the standard template. The question was whether following this template would communicate what makes MIAW different or reinforce the category it is trying to escape.

**Decision:**
One surface. No navigation. No scroll. The entire experience is a conversation with Claude. The visitor clicks or presses a key; the AI begins. Information is delivered through dialogue, not content sections.

**Consequences:**
- Positive: The medium is the message. A program about AI-native practice is introduced by an AI-native interface.
- Positive: Forces the copy/prompt to do the qualification work — low-fit visitors self-select out early.
- Positive: Zero visual debt. Nothing to maintain, update, or redesign for individual sections.
- Negative: Not crawlable by search engines. SEO is near-zero.
- Negative: Visitors who want to read at their own pace have no option. Some qualified prospects may drop off.
- Accepted: SEO can be addressed later with a static `/about` page. The conversion quality benefit outweighs volume loss.

---

## ADR-002: Claude Sonnet as AI model (via Replit AI Integrations)

**Status:** Accepted

**Context:**
The AI model drives the quality of every visitor interaction. The options were: Claude Sonnet, Claude Opus, GPT-4o, Gemini 1.5 Pro, Llama 3 (self-hosted).

**Decision:**
`claude-sonnet-4-6` via the Replit AI Integrations proxy. The proxy injects credentials automatically — no API key management required in development or production.

**Options considered:**

| Model | Quality | Cost | Latency | Streaming | Decision |
|---|---|---|---|---|---|
| Claude Sonnet | High | Medium | Fast | Native | **Selected** |
| Claude Opus | Highest | High | Slow | Native | Overkill for short conversations |
| GPT-4o | High | Medium | Fast | Native | No Replit integration; key management complexity |
| Gemini 1.5 Pro | Good | Low | Medium | Native | Integration available but less mature |
| Llama 3 (self-hosted) | Good | Infrastructure | Variable | Yes | Operational overhead not justified |

**Consequences:**
- Anthropic API availability is now a dependency. Rate limits and downtime affect the product.
- Model upgrades (Sonnet → newer versions) require code change but are low-risk (API-compatible).
- The Replit AI Integrations proxy URL must never be set manually — only the SDK reads it.

---

## ADR-003: Raw HTTP streaming, not Server-Sent Events or WebSockets

**Status:** Accepted

**Context:**
Claude's API streams responses as text deltas. Three protocols could carry these to the browser: SSE (text/event-stream), WebSockets, or raw HTTP chunked transfer.

**Decision:**
Raw HTTP chunked transfer. The `/api/chat` endpoint writes raw text to `res.write()` and pipes it directly from the Anthropic stream. The client reads `response.body` as a `ReadableStream`.

**Options considered:**

| Protocol | Pros | Cons |
|---|---|---|
| Raw HTTP stream | Zero parsing overhead, works through all proxies, simplest code | Not resumable; no reconnect on drop |
| SSE | Standard protocol, auto-reconnect, EventSource API | Requires `data: ...\n\n` envelope; parsing adds code for no benefit at this scale |
| WebSockets | Bidirectional, low overhead per message | Overkill for unidirectional streaming; requires persistent connection management; proxy complications |

**Consequences:**
- Client must handle connection drops gracefully (30-second timeout implemented).
- No server-push capability for future features without revisiting this decision.
- The endpoint can't be tested with standard REST tools without streaming support.

---

## ADR-004: Keyword BM25-inspired RAG, not embedding vectors

**Status:** Accepted

**Context:**
To ground Claude's responses in accurate program information, some form of retrieval-augmented generation is needed. The canonical modern approach uses dense embeddings (OpenAI, Cohere) with a vector database (Pinecone, pgvector). An alternative is keyword-based retrieval.

**Decision:**
Custom keyword BM25-inspired scoring against 4 Markdown files (~230 lines total). No embeddings, no vector database.

**Options considered:**

| Approach | Accuracy | Complexity | Cost | Cold Start |
|---|---|---|---|---|
| BM25 keyword | Sufficient for small static KB | Low | Zero | < 100ms |
| Dense embeddings | Higher for semantic queries | Medium | API cost per update | Must pre-embed |
| Hybrid (BM25 + embeddings) | Highest | High | Ongoing | Pre-embed + index |

**Decision rationale:**
The knowledge base is ~230 lines across 4 files. It is curated, domain-specific vocabulary. Semantic similarity adds minimal value when terms like "Gaussian Splatting", "BIM", and "parametric design" are already exact. BM25 with domain boosters achieves high precision at zero operational cost.

**Revisit condition:**
If the knowledge base grows beyond ~50 files or ~5,000 lines, or if semantic queries ("what's the vibe of the program?") start failing, switch to embeddings. The `retrieveContext()` function is the only integration point.

**Consequences:**
- Knowledge updates require server restart (file reload on startup).
- No semantic understanding — exact vocabulary match only.
- Bigram support covers compound terms ("world model", "gaussian splatting").

---

## ADR-005: Express 5 over Fastify, Hono, or Elysia

**Status:** Accepted

**Context:**
The API server needs a Node.js HTTP framework. The market has multiple options with different performance and DX trade-offs.

**Decision:**
Express 5 (Release Candidate).

**Options considered:**

| Framework | Throughput | DX | Ecosystem | Async error handling |
|---|---|---|---|---|
| Express 5 | Moderate | Excellent | Mature | Native (no next(err)) |
| Fastify | High | Good | Large | Plugin-based |
| Hono | Very high | Good | Growing | Native |
| Elysia (Bun) | Highest | Good | Small | Native |

**Decision rationale:**
At MIAW's expected load (< 1,000 concurrent conversations), framework throughput is irrelevant. Express 5 adds native async error propagation (rejected promises in route handlers are caught automatically), which simplifies all route code. The middleware ecosystem (helmet, cors, pino-http) is mature and well-understood. Hono would be the alternative if edge deployment (Cloudflare Workers) were a target.

**Consequences:**
- Express 5 is still in RC — stable for production but official release pending.
- The ecosystem assumption (middleware compatibility) holds; all used packages support Express 5.

---

## ADR-006: Framer Motion for animations, not CSS-only

**Status:** Accepted

**Context:**
The logo animation (large center → small top-left on conversation start) involves a position and size change between two different DOM nodes in different parent containers. CSS `transition` can only animate properties on a single element — it cannot animate between two separate elements.

**Decision:**
Add Framer Motion (12) for:
1. Shared layout animation (`layoutId="logo"`) — FLIP animation between landing and conversation logo
2. Message bubble enter animations (replacing CSS `@keyframes message-enter`)
3. Streaming cursor (blinking `motion.span`)

**Options considered:**

| Approach | Logo FLIP | Message anims | Bundle cost | DX |
|---|---|---|---|---|
| Framer Motion | Native (layoutId) | Excellent | +44KB gzip | Declarative |
| GSAP | Via manual FLIP impl | Good | +25KB gzip | Imperative |
| CSS transitions only | Impossible (cross-node) | Good | 0KB | Limited |
| Web Animations API | Manual FLIP | Moderate | 0KB | Verbose |

**Decision rationale:**
Framer Motion's `layoutId` is the only declarative primitive that handles cross-node position animation correctly. The bundle cost (44KB gzip) is accepted because the animation quality is uniquely achievable and materially improves the experience. Manual FLIP via GSAP or WAAPI would require ~100 lines of coordinate calculation that Framer handles automatically.

**Bundle impact:**
- Before: 127KB gzip (app)
- After: 44KB (framer) + 124KB (app) + 1.4KB (react) = 169KB split across 3 chunks

**Consequences:**
- Framer Motion is now a production dependency. Security audits and version upgrades must include it.
- `LayoutGroup` must wrap any component tree using shared layout animations.
- AnimatePresence must be used wherever elements with `layoutId` are conditionally rendered.

---

## ADR-007: pnpm monorepo with TypeScript project references

**Status:** Accepted

**Context:**
The product has two deployed artifacts (frontend, API server) and one shared library (API spec). These need to coexist in one repository, share type definitions, and be independently buildable.

**Decision:**
pnpm workspaces with a catalog (`pnpm-workspace.yaml`), TypeScript composite libs with declaration emit, and leaf artifacts that typecheck with `--noEmit`.

**Consequences:**
- Dependency versions are pinned in the catalog — consistent across all packages.
- `pnpm run typecheck` at root runs the full solution check.
- No two workspace packages can depend on each other unless explicitly declared.
- Adding a new shared lib requires adding it to root `tsconfig.json` references.

---

## ADR-008: In-memory rate limiting with optional Redis upgrade

**Status:** Accepted

**Context:**
The chat endpoint must be rate-limited to prevent Claude API cost abuse. Options ranged from no limiting (risky) to full Redis-backed distributed limiting.

**Decision:**
Two-layer system: in-memory `Map<ip, {count, resetAt}>` (always active) + Upstash Redis via `@upstash/ratelimit` (active only when env vars are present). The in-memory layer resets on server restart; the Redis layer survives restarts.

**Consequences:**
- In-memory counts are lost on deploy (acceptable — rate limit window is 1 hour).
- Without Redis, a server restart resets all limits (an attacker could exploit this, but the attack surface is low for a waitlist site).
- Redis is a pay-per-request service — free tier covers launch volume.

---

## ADR-009: Fire-and-forget Airtable integration

**Status:** Accepted

**Context:**
Saving waitlist entries to Airtable involves a network request to an external API. If Airtable is down or slow, the user's `POST /api/waitlist` response would be delayed.

**Decision:**
The `saveToAirtable()` call is not awaited. The in-memory write happens synchronously; Airtable save fires as a background promise with error logging. The 201 response is always returned after the in-memory write.

**Consequences:**
- If the server crashes immediately after the in-memory write but before the Airtable save completes, the entry is lost.
- The accepted risk: server crashes at the exact millisecond of waitlist submission are extremely rare, and the in-memory fallback retains data while the process is alive.
- Airtable failures are logged at `WARN` level — visible in production logs.

---

## ADR-010: PostHog with memory-only persistence

**Status:** Accepted

**Context:**
Analytics are needed to understand conversion rates, visitor profiles, and drop-off points. Standard analytics write cookies or localStorage to persist a user identity across sessions.

**Decision:**
PostHog with `persistence: "memory"`. All analytics data is session-scoped. No cookies. No localStorage. GDPR-safe without a consent banner.

**Consequences:**
- No cross-session user tracking. Return visitors appear as new visitors.
- Funnel analysis works within a single session (landing → turn 1 → turn 8 → waitlist).
- Cohort analysis is not possible without cross-session identity.
- No consent banner required under GDPR (no persistent identifiers).

---

## ADR-011: CSS @property for gradient animation

**Status:** Accepted

**Context:**
The animated mesh gradient background is core to the brand. It needs to flow continuously without JavaScript involvement.

**Decision:**
CSS `@property` with typed `<percentage>` custom properties. Each gradient blob's X/Y position is a typed CSS variable animated via `@keyframes`. The browser interpolates natively.

**Browser support note:**
CSS `@property` requires Chrome 85+, Firefox 128+, Safari 16.4+. Browsers that don't support it render a static gradient (acceptable fallback).

**Consequences:**
- Zero JavaScript runtime cost for the gradient.
- No `requestAnimationFrame` loop — the animation is GPU-accelerated by default.
- Adding new animation states (e.g., gradient reacts to conversation sentiment) would require JavaScript to update CSS variables.

---

## ADR-012: OpenAPI 3.1 contract-first API design

**Status:** Accepted

**Context:**
Without a shared API contract, client and server types drift. The frontend might expect a field the backend doesn't send, or vice versa.

**Decision:**
`lib/api-spec/openapi.yaml` is the single source of truth. Orval generates React Query hooks and Zod schemas from it. Server routes use the generated Zod schemas for validation.

**Consequences:**
- Any API change requires updating the spec first, then running `pnpm --filter @workspace/api-spec run codegen`.
- The streaming `/api/chat` endpoint is documented in the spec but excluded from hook generation (raw stream, not JSON).
- Spec drift is prevented by the codegen step being part of the standard workflow.

---

## ADR-013: No server-side rendering

**Status:** Accepted

**Context:**
The frontend could be server-side rendered (Next.js, Remix) for better SEO and faster initial paint.

**Decision:**
Static build (Vite). No SSR.

**Decision rationale:**
The conversation starts on user interaction (click or keypress), not on page load. The first meaningful content is the animated gradient + logo — both are CSS. There is no content to pre-render that would benefit SEO (the conversation is dynamic). SSR would add infrastructure complexity (persistent Node.js process for rendering) and dev complexity (hydration) for zero measurable user benefit.

**SEO impact:**
The site is effectively invisible to search engines. Accepted. The discovery model is direct (social sharing of the domain) not organic search. If SEO becomes a priority, add a static `/about` route rendered at build time.

**Revisit condition:**
If organic search becomes a meaningful acquisition channel, evaluate Next.js App Router with a hybrid model (static shell + client conversation).

---

## ADR-014: Resizable floating panels

**Status:** Accepted

**Context:**
All interactive panels (chat, image reference, application form) are draggable via Framer Motion. Users requested the ability to resize them — especially image panels to see more detail and the application form to see more content at once.

**Decision:**
Add a bottom-right resize handle to `FloatingPanel`. The component manages its own size state internally (`panelSize`) initialised from the `width`/`height` props. When the handle receives `pointerdown`, global `pointermove` + `pointerup` listeners track the drag delta and update `panelSize`. The `resizable` prop gates the feature — existing callers without the prop are unaffected.

**Options considered:**

| Approach | Complexity | Notes |
|---|---|---|
| CSS `resize: both` | Trivial | Conflicts with `overflow: hidden` required for glass look; not composable with Framer drag |
| React-resizable / react-rnd | Low | External dep; adds ~20 kB; we already have Framer Motion |
| Custom pointer-capture on handle | Low | No dep; fits the existing Framer drag model; chosen |

**Key implementation details:**
- Resize listeners attach to `window` (not the handle) so the gesture stays stable when the pointer leaves the element — identical to how browser native resize works.
- `setPointerCapture` is intentionally avoided: Framer Motion holds pointer capture during its own drag, and double-capture causes dropped events.
- Minimum dimensions: 200 × 140 px — prevents panels from collapsing to nothing.
- The handle is inset 5 px from the panel corner to stay within the 16 px `border-radius` clip zone; it is visually subtle (diagonal line grip, opacity 0.28 → 0.65 on panel hover).

**Consequences:**
- Positive: Users can adapt panel size to their viewport and content needs.
- Positive: Zero added runtime dependencies.
- Negative: Resize state is local — if the panel unmounts and remounts (e.g. after closing and reopening) it resets to the initial size. Acceptable for ephemeral panels.
- Negative: Resize and drag gestures are handled by different listeners (Framer vs. window); the implementation must call `e.stopPropagation()` on `pointerdown` on the handle to prevent Framer from interpreting it as a drag start.

---

## ADR-015: Daily palette rotation for gradient canvas

**Status:** Accepted

**Context:**
The gradient canvas uses CSS `@property` animated colour blobs. A static palette becomes predictable; returning visitors see the same visual every time.

**Decision:**
Seven pastel palettes are defined in `lib/dailyPalette.ts`, one per day of the week (cycling by `dayOfYear % 7`). The palette is selected once at mount, stored in a ref, and applied as inline CSS custom properties on the gradient canvas element. The body background is also synced to the palette's `base` colour to prevent flash.

**Consequences:**
- Positive: The site feels fresh across sessions without any server-side logic.
- Positive: The palette ref is stable for the page lifetime — no re-renders triggered by palette selection.
- Negative: Palette changes mid-session are not possible without a page reload. Acceptable: the gradient evolves continuously through the animation anyway.

---

## ADR-016: Unified gradient state effect

**Status:** Accepted

**Context:**
Multiple effects were competing to update CSS custom properties on the gradient canvas: depth saturation (increases with turn count), profile shift (semantic hue from visitor type), and topic shift (evocative hue from open image panels). With separate effects, they raced and overwrote each other unpredictably.

**Decision:**
A single `useEffect` manages all four colour layers in priority order: (1) daily palette as base, (2) depth saturation, (3) profile semantic shift, (4) topic shift. Layers are blended additively. The acknowledged-state convergence effect remains separate because it is a terminal state.

**Consequences:**
- Positive: Predictable layer ordering — no more effect races.
- Positive: A single dependency array controls when the gradient recalculates.
- Negative: The combined effect has more dependencies; future gradient layers must be added here rather than in a new effect.

---

## ADR-017: Individually draggable nav pills (Framer Motion)

**Status:** Accepted

**Context:**
Nav pills were originally a static centred flex row. Users on smaller viewports found pills overlapping the chat panel. The goal was to let users reposition pills freely while keeping the toggle behaviour intact.

**Decision:**
Each pill is an independent `NavPill` component wrapping Framer Motion's `drag` prop. Positions are computed from `window.innerWidth` using `NAV_PILL_APPROX_WIDTHS` so the row is centred at mount; after the first render Framer owns the x/y state. Drag-vs-click disambiguation is a boolean ref set in `onDragStart` and checked in `onClick` — no pixel threshold needed. Pills exit with `AnimatePresence` when `applicationMode` starts.

**Consequences:**
- Positive: Pills can be repositioned to any part of the screen; toggle behaviour is unaffected.
- Positive: No external DnD library — Framer Motion (already a dependency) is used.
- Negative: Pill positions reset to the centred row on every page load. Persisting positions to `sessionStorage` is deferred.
- Negative: `NAV_PILL_APPROX_WIDTHS` must be kept in sync manually when pill labels change. Off-by-one in the widths causes a slightly off-centre initial row — acceptable.

---

## ADR-018: Guest Lectures panel (5th nav tab)

**Status:** Accepted

**Context:**
The program features 9 prominent guest lecturers from academia and practice (Carlo Ratti, Carlos Arroyo, Cristina Díaz Moreno, Ismail Seleit, Mariana Ibáñez, Mario Carpo, Matías del Campo, Neri Oxman, Sandra Manninger). These guests needed to be surfaced to visitors in the same discoverable, explorable way as core Faculty — without changing the single-surface conversational interface.

**Decision:**
A fifth nav pill "Guests" is added alongside How to apply / Program / Faculty / Timeline. It follows the identical architecture as the Faculty tab:

- `GuestPanel.tsx` — exports `GUESTS: GuestMember[]` (single source of truth for identity data) + the `GuestPanel` floating panel component (3-column photo grid, same `PhotoPlaceholder` pattern as Faculty).
- `GuestDetailPanel.tsx` — exports `GUEST_DETAILS` record keyed by slug (bio paragraphs, lecture topics, affiliation) + the `GuestDetailPanel` floating panel component.
- `ConversationCanvas.tsx` — four new state variables (`showGuestPanel`, `guestPanelPos`, `selectedGuestSlug`, `guestDetailPanelPos`), two new `useCallback` helpers (`openGuestPanel`, `handleSelectGuest`), two new `AnimatePresence` rendering blocks, and "guests" added to `NAV_PILL_APPROX_WIDTHS` (84 px) and the `ids` array used for centred pill layout calculation.
- Photos served from `public/guests/` — same pattern as `public/faculty/`, referenced by URL path (never imported, avoiding Vite asset hash churn on content updates).

**Z-index allocation:**
- `GuestPanel`: z=32 (below Faculty at z=35, above image panels at z=15–17)
- `GuestDetailPanel`: z=34 (between GuestPanel and Faculty, never overlaps PersonDetailPanel at z=37)

**Initial position:**
- `GuestPanel` opens left-of-centre (≈18 % viewport width) so it can coexist with `FacultyPanel` (right-of-centre, ≈50 % viewport width) when both are open simultaneously.
- `GuestDetailPanel` opens ≈480 px right of `GuestPanel` — same offset used for `PersonDetailPanel` relative to `FacultyPanel`.

**Options considered:**

| Option | Assessment |
|---|---|
| Merge guests into the Faculty panel | Rejected — different relationship to the program; mixing them obscures both sets |
| Add guests as a section inside an existing panel | Rejected — creates a second-class experience; harder to discover |
| Separate tab following Faculty architecture | **Selected** — clean separation of concerns, identical UX pattern, zero new dependencies |

**Consequences:**
- Positive: Identical architecture to Faculty — no new patterns introduced, low cognitive overhead for future maintainers.
- Positive: `GUESTS` array and `GUEST_DETAILS` record are independent — identity and bio content can be updated separately.
- Positive: 5-pill row centres correctly on viewports ≥ 640 px wide; on very narrow screens pills remain draggable.
- Negative: `NAV_PILL_APPROX_WIDTHS["guests"]` (84 px) is a manual approximation. If the label changes, the value must be updated.
- Negative: Five pills at 84–132 px each + 4 × 14 px gaps = ~552 px total. On viewports narrower than 600 px the row will overflow the left edge at initial mount — mitigated by the `Math.max(8, …)` clamp in the position calculation.

---

## ADR-019: Institutions panel (6th nav tab)

**Status:** Accepted

**Context:**
MIAW's institutional relationships — the certifying body (UPM), the host school (ETSAM), and the universities represented by guest faculty — were not surfaced anywhere in the interface. Visitors, especially those evaluating the programme's academic credibility, need to understand who validates the degree and which institutions stand behind the guest curriculum. The timeline SVG already references UPM explicitly ("MIAU titulo propio UPM"); the remaining institutions are derived from faculty and guest affiliations.

**Decision:**
A sixth nav pill "Institutions" is added. It follows the identical architecture as the Program tab:

- `InstitutionsPanel.tsx` — exports `INSTITUTIONS: Institution[]` (single source of truth) + the `InstitutionsPanel` floating panel component. Layout mirrors `ProgramPanel`: coloured shortname accent, institution name, tagline, arrow on hover, click to open detail.
- `InstitutionDetailPanel.tsx` — exports `INSTITUTION_DETAILS` record keyed by `id` (description paragraphs, relationship summary, key facts list) + the `InstitutionDetailPanel` floating panel component. Layout mirrors `ModuleDetailPanel`.
- `ConversationCanvas.tsx` — four new state variables, two new `useCallback` helpers (`openInstitutionsPanel`, `handleSelectInstitution`), two new `AnimatePresence` rendering blocks, "institutions" added to `NAV_PILL_APPROX_WIDTHS` (116 px) and the `ids` array.

**Institution data sources:**
| Institution | Source |
|---|---|
| UPM (Universidad Politécnica de Madrid) | MIAW-timeline.svg — "titulo propio UPM" |
| ETSAM (E.T.S. Arquitectura de Madrid) | Faculty affiliation (host school) |
| MIT Senseable City Lab | Guest: Carlo Ratti |
| MIT School of Architecture + Planning | Guest: Mariana Ibáñez |
| MIT Media Lab | Guest: Neri Oxman |
| UCL Bartlett School of Architecture | Guest: Mario Carpo |
| University of Michigan TCAUP | Guests: Matías del Campo + Sandra Manninger |

**Z-index allocation:**
- `InstitutionsPanel`: z=29 (below GuestPanel z=32, above image panels z=15–17)
- `InstitutionDetailPanel`: z=31 (between the two institutions layers, below all people panels)

**Initial position:**
- `InstitutionsPanel` opens right-of-centre (~60 % viewport width) — to the right of both Program (~52 %) and Faculty (~50 %), allowing all three to coexist without exact overlap.
- `InstitutionDetailPanel` opens ~360 px right of the list panel.

**6-pill row total width:**
How to apply (132) + Program (92) + Faculty (90) + Guests (84) + Institutions (116) + Timeline (98) + 5 × 14 px gaps = 682 px. On viewports ≥ 700 px the row centres correctly; on narrower screens pills are individually draggable.

**Consequences:**
- Positive: Academic credibility of the programme is now directly discoverable without any conversation.
- Positive: Identical architecture to Program and Institutions tabs — zero new patterns, low maintenance burden.
- Positive: Adding new institutions requires only appending to `INSTITUTIONS` and `INSTITUTION_DETAILS` — no other files change.
- Negative: Institution data (especially guest affiliations) should be reviewed whenever guest faculty changes.
- Negative: `NAV_PILL_APPROX_WIDTHS["institutions"]` (116 px) is a manual estimate. If the label changes, it must be updated.

---

## ADR-020: "Global" pill — all-panels tiled view

**Status:** Accepted

**Context:**
MIAW now has six independent nav pills, each opening a separate floating panel. Power users (faculty evaluating curriculum depth, institutional partners checking affiliations) need a way to get a full overview without clicking each pill individually. A single "view all" action that lays out every panel simultaneously without overlap addresses this.

**Decision:**
A seventh "Global" pill is added as the last item in the nav row. It is visually distinct from the six standard pills and opens all five content panels at once in a tiled, non-overlapping layout. Clicking it again when all panels are open closes everything.

**Visual distinction (`variant="global"` prop on NavPill):**
- Inactive: translucent white background (`rgba(255,255,255,0.18)`), white text, white 1 px border.
- Active: near-opaque pearl background (`rgba(255,255,255,0.92)`), near-black text, white glow ring.
- No underline decoration (used on standard pills to signal "active"); uses font-weight 600 instead.
- Standard pills remain `variant="default"` (no prop needed — it is the default).

**Tiled layout (computed at click-time from `window.innerWidth` / `window.innerHeight`):**

| Panel | Width | x position |
|---|---|---|
| Program | 320 px | 16 |
| Institutions | 340 px | 348 (16 + 320 + 12) |
| Faculty | 460 px | 700 (348 + 340 + 12) |
| Guests | 460 px | 1172 (700 + 460 + 12) |
| Timeline | full-width | 16, y = max(vh × 0.44, 320) |

Total row-1 width = 1652 px. On viewports ≥ 1680 px all four panels fit with zero overlap. On narrower viewports the Guests panel extends past the right edge; since all panels are individually draggable this is acceptable.

**Active-state derivation:**
`globalActive` is derived (not stored): `showProgramPanel && showInstitutionsPanel && showFacultyPanel && showGuestPanel && showTimelinePanel`. No new state variable is required.

**Close behaviour (`closeGlobalView`):**
Closes all five content panels plus their detail sub-panels (module, institution, person, guest). Also removes "timeline" from `zOrder`.

**Reset:**
The existing `resetAll` function already closes every panel individually; `zOrder` clean-up for timeline was added to the reset path as part of this ADR.

**Pill row total width (7 pills):**
How to apply (132) + Program (92) + Faculty (90) + Guests (84) + Institutions (116) + Timeline (98) + Global (82) + 6 × 14 px gaps = 778 px. Centred on viewports ≥ 800 px.

**Consequences:**
- Positive: Single gesture gives a full overview of all programme content — high value for faculty and institutional visitors.
- Positive: No new state — `globalActive` is purely derived, zero extra re-renders.
- Positive: The tiled positions are absolute coordinates, computed once at open-time; subsequent individual panel interactions (open/close/drag) work normally.
- Negative: Tiled layout is designed for ≥ 1680 px wide viewports. On 1280 px laptops the Guests panel is partially off-screen (draggable to recover).
- Negative: `NAV_PILL_APPROX_WIDTHS["global"]` (82 px) is a manual estimate. If the label changes, it must be updated.
