# Clémence & Antonio — Wedding Website

The site has a cinematic wedding landing page and an Explore page with the story, weekend schedule, location, travel, FAQ, dress code and RSVP form.

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

RSVP submissions are currently held in API memory and are lost when the API process restarts. Use persistent storage before relying on the form for final guest responses.

## Design

- The main page and Explore page use the same Cormorant Garamond and Inter typography.
- A slowly animated warm gradient continues behind the Explore content.
- The couple’s photo is blended into the gradient on the Explore introduction.
- The gradient respects `prefers-reduced-motion`.

## Optional environment variables

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Override the RSVP API base URL for a separate custom domain |
