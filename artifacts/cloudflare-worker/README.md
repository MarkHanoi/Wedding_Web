# Cloudflare deployment

This is an additional deployment target. The existing Replit frontend/API remains
available until the Cloudflare deployment has been tested, the RSVP data has been
copied, and the domain is switched.

## Services used

- Cloudflare Workers serves the built Vite site and `/api/*`.
- Cloudflare D1 stores RSVPs, anonymous visit counts, and hashed admin login
  rate-limit keys.
- Cloudflare Email Service sends RSVP notifications from a verified sender.

## One-time Cloudflare setup

1. Sign in to Cloudflare and add the wedding domain. Keep Namecheap as the
   registrar unless you separately choose to transfer registration; the
   authoritative nameservers can be switched to Cloudflare while the registrar
   stays at Namecheap.
2. Use Node.js 22 or newer, then run `pnpm install --frozen-lockfile` in a terminal
   with this repository.
3. Authenticate Wrangler with `pnpm --filter @workspace/cloudflare-worker exec wrangler login`.
4. Create the D1 database with `pnpm --filter @workspace/cloudflare-worker run db:create`.
   Copy the returned database ID into `wrangler.jsonc`, replacing the all-zero
   placeholder ID.
5. Apply the D1 schema locally and remotely:
   `pnpm --filter @workspace/cloudflare-worker run db:migrate:local`
   and, after reviewing the database binding, `pnpm --filter @workspace/cloudflare-worker run db:migrate:remote`.
6. Add Worker secrets. Generate new values; do not reuse or paste Replit secrets:
   - `ADMIN_PASSWORD`: a unique password with at least 16 characters.
   - `SESSION_SECRET`: a newly generated random secret (at least 32 random bytes).

   Set them with:
   `pnpm --filter @workspace/cloudflare-worker exec wrangler secret put ADMIN_PASSWORD`
   and
   `pnpm --filter @workspace/cloudflare-worker exec wrangler secret put SESSION_SECRET`.
7. To enable notification email, activate Cloudflare Email Sending, verify a
   sender domain, and set `EMAIL_FROM` to an address on that verified domain:
   `pnpm --filter @workspace/cloudflare-worker exec wrangler secret put EMAIL_FROM`.
   Email Sending is currently beta and requires a Workers Paid plan. If it is not
   enabled, RSVP submissions still work and the admin panel reports email as
   unconfigured.

## Build and deploy

Run `pnpm run build:cloudflare` from the repository root. This builds the site
and deploys the Worker plus its static assets. The frontend uses same-origin
`/api` requests, so no public API URL or CORS configuration is needed.

Before switching DNS, test the `workers.dev` deployment, submit test RSVPs, verify
the admin dashboard and notification delivery, and compare the new D1 records
with the source database. Do not delete or disable the Replit deployment until
the new service and migrated data have been verified.

## Data transfer and domain cutover

The D1 schema is ready, but no RSVP data has been copied yet. PostgreSQL's
arrays, booleans, timestamps, and numeric IDs need conversion to D1-compatible
SQLite rows. Export the source RSVPs and anonymous visit counts, import them
before DNS cutover, and verify row counts and values. Do not put the export in
Git or a public folder.

The domain is still registered with Namecheap according to the current project
handoff. To move DNS management, add the domain in Cloudflare and replace the
Namecheap nameservers with the two assigned by Cloudflare. Review/copy any
required mail records before changing nameservers. Then point the website
hostname at the Worker and verify HTTPS. A registrar transfer is optional and
separate from changing DNS authority.
