# Clémence & Antonio — Wedding Website

The site has a cinematic wedding landing page and an Explore page with the story, weekend schedule, location, travel, FAQ, dress code and RSVP form.

## Project scope

Keep this repository focused on the wedding landing page, Explore page and the RSVP service. Do not restore the unrelated MIAW AI-program materials, chat endpoint or design-preview sandbox.

## Run & operate

- On a fresh import, run `pnpm install --frozen-lockfile`.
- The managed previews are `artifacts/miaw: web` and `artifacts/api-server: API Server`.
- `pnpm --filter @workspace/miaw run dev` starts the frontend on port 5000.
- `pnpm --filter @workspace/api-server run dev` starts the RSVP API on port 8080.
- `pnpm run typecheck` checks the application packages.
- `pnpm run build:full` builds and typechecks the frontend and API.

## Page structure

- `artifacts/miaw/src/components/HeroPage.tsx` — main landing page and Explore entry.
- `artifacts/miaw/src/components/WeddingCanvas.tsx` — the continuous Explore page and RSVP form.
- `artifacts/miaw/src/lib/dailyPalette.ts` — rotating warm wedding palettes.
- `artifacts/api-server/src/routes/rsvp.ts` — RSVP submission and count endpoints.
- `artifacts/api-server/src/routes/health.ts` — API health check.

## RSVP

- RSVPs are stored in the managed PostgreSQL database and remain available after API restarts.
- `artifacts/api-server/src/db/001_rsvp_admin.sql` is the schema source. The development database has these tables; publish the app to apply the development schema to production.
- The old in-memory RSVP list was not persistent, so submissions made before this change cannot be recovered.
- Email notifications are sent from and to `lookwithinjourney@gmail.com` through Gmail SMTP. Set the `GMAIL_APP_PASSWORD` secret to enable delivery; use a Google App Password, not the account password.
- The admin dashboard is at `/admin`. Sign-in is restricted to `lookwithinjourney@gmail.com` and requires a unique `ADMIN_PASSWORD` secret of at least 16 characters. Sessions are signed with `SESSION_SECRET`, which is already available to the app.
- Site analytics count anonymous page opens only. They do not identify guests or connect visits to RSVP names.

## Design

- The main page and Explore page use the same Cormorant Garamond and Inter typography.
- A slowly animated warm gradient continues behind the Explore content.
- The Explore introduction contains the couple’s names and wedding date over the sea background, without an inset photo.
- The gradient respects `prefers-reduced-motion`.

## Optional environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Override the RSVP API base URL for a separate custom domain |

## Cloudflare deployment path

The project now includes an optional Cloudflare Workers + D1 deployment in
`artifacts/cloudflare-worker`. It serves the Vite static site, RSVP API, admin
dashboard API, analytics endpoint, and D1 data from one origin. See that
directory's README for account setup, secret entry, data migration, testing,
and DNS cutover. The Replit preview/runtime remains unchanged until the
Cloudflare deployment and data migration have been verified.
