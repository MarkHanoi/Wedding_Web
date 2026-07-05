# Operations Runbook

> Deployment, configuration, monitoring, incident response, and maintenance procedures.

---

## 1. Environment Overview

### Production
- **Platform:** Replit Deployments (reserved VM)
- **URL:** `https://[project].replit.app` (or custom domain when configured)
- **Services:** Static CDN (frontend) + Node.js process (API server, port 8080)
- **Build:** Triggered on deploy — runs `pnpm run build` for all artifacts

### Development
- **Platform:** Replit workspace
- **Frontend:** `http://localhost:20778` (via workflow, proxied to `/`)
- **API:** `http://localhost:8080` (via workflow, proxied to `/api`)
- **Access via proxy:** `localhost:80/api/healthz`

---

## 2. Deployment

### Standard deploy

1. Ensure all changes are committed and pushed
2. Click **Deploy** in the Replit workspace header
3. Replit builds both artifacts and starts the Node.js process
4. Deployment logs are visible in Replit's deployment panel

### Build command (what Replit runs)
```bash
pnpm run build
```
This runs in sequence:
1. `pnpm run typecheck:libs` — builds composite lib packages
2. `pnpm --filter @workspace/api-server run build` — esbuild bundles the server
3. `pnpm --filter @workspace/miaw run build` — Vite builds the frontend
4. `pnpm --filter @workspace/scripts run typecheck` — validates scripts package

### Post-deploy verification

Run immediately after any deployment:

```bash
# Health check
curl https://[your-domain]/api/healthz
# Expected: {"status":"ok","uptime":N}

# Security headers
curl -D - -o /dev/null https://[your-domain]/api/healthz | grep -E "Strict|X-Frame|X-Content"
# Expected: All three headers present

# OG image
curl -o /dev/null -w "%{http_code}" https://[your-domain]/api/og
# Expected: 200

# Chat (streaming)
curl -X POST https://[your-domain]/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"hello"}],"turnCount":0}' \
  --max-time 15 | head -c 100
# Expected: streaming text beginning
```

---

## 3. Required Environment Variables

Set these in **Replit Secrets** for both development and production:

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | Yes | Express session signing key (min 32 chars) |

### Optional Secrets (production hardening)

| Variable | Required | Description |
|---|---|---|
| `VITE_POSTHOG_KEY` | No | PostHog project API key |
| `VITE_POSTHOG_HOST` | No | PostHog host (default: `us.i.posthog.com`) |
| `UPSTASH_REDIS_REST_URL` | No | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | No | Upstash Redis auth token |
| `AIRTABLE_API_KEY` | No | Airtable personal access token |
| `AIRTABLE_BASE_ID` | No | Airtable base ID (starts with `app`) |
| `AIRTABLE_TABLE_NAME` | No | Airtable table name (default: `Waitlist`) |

**Critical:** Never set `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` or `AI_INTEGRATIONS_ANTHROPIC_API_KEY` — these are injected automatically by Replit AI Integrations. Setting them manually breaks the integration.

### Setting production secrets

1. In the Replit workspace, open **Secrets** (lock icon in sidebar)
2. Add each secret as a key-value pair
3. For Replit Deployments: in the deployment settings, check that secrets are propagated (Replit handles this automatically)

---

## 4. Knowledge Base Updates

The knowledge base is in `artifacts/api-server/knowledge/` — 4 Markdown files loaded once at server startup.

### To update knowledge content

1. Edit the relevant `.md` file
2. Commit the change
3. **Restart the API server** (knowledge is not hot-reloaded)
   - In development: use the Replit workflow restart button for `artifacts/api-server: API Server`
   - In production: redeploy

### Knowledge file locations

| File | Content |
|---|---|
| `artifacts/api-server/knowledge/curriculum.md` | Module descriptions and deliverables |
| `artifacts/api-server/knowledge/faq.md` | Admissions, cost, timeline, methodology |
| `artifacts/api-server/knowledge/aec-context.md` | AEC sector context, world models, key technologies |
| `artifacts/api-server/knowledge/faculty.md` | Faculty profiles |

### Verifying RAG after knowledge update

```bash
# Test a specific module question
curl -X POST localhost:80/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"what is module F3 about?"}],"turnCount":2}' \
  --max-time 15 | head -c 300
```

---

## 5. Monitoring

### Production health check

The `/api/healthz` endpoint returns:
```json
{
  "status": "ok",
  "uptime": 12345.67,
  "timestamp": "2026-05-15T10:00:00.000Z",
  "version": "0.0.0"
}
```

Set up an uptime monitor (UptimeRobot, Better Uptime, or similar) to poll this every 5 minutes.

### Deployment logs

Accessible via:
1. Replit deployment panel → Logs tab
2. Programmatically: the `fetch_deployment_logs` tool in the Replit Agent environment

### Key log patterns to watch

| Pattern | Meaning | Action |
|---|---|---|
| `statusCode: 500` on `/api/chat` | Server error in chat handler | Check full error log with context |
| `statusCode: 429` on `/api/chat` (unusual volume) | Rate limit being triggered | Check if organic or abuse |
| `Airtable save failed` (WARN) | Waitlist entry not persisted to Airtable | Check Airtable API key; entries are in memory |
| `Server listening` appearing repeatedly | Server restarting | Check for crash loop |

### PostHog dashboard (when configured)

Key funnels to monitor:
1. `page_loaded` → `conversation_started` (should be > 50%)
2. `conversation_started` → `cta_shown` (should be > 30%)
3. `cta_shown` → `waitlist_submitted` (should be > 15%)

---

## 6. Rate Limiting

### Current limits
- **30 requests/hour** per IP address
- Window: 1 hour rolling
- Storage: In-memory (resets on restart) + Upstash Redis (persistent, if configured)

### Adjusting the limit

In `artifacts/api-server/src/routes/chat.ts`:
```typescript
const RATE_LIMIT = { requests: 30, window: "1h" };
```

### Checking current rate limit counts

No admin interface. If Redis is configured:
```bash
# Via Upstash Redis console or REST API
GET ratelimit:ip:<ip_address>
```

### If abuse is detected

1. Check deployment logs for the abusing IP
2. If Replit Deployments supports IP blocking, block at that layer
3. Temporarily lower the rate limit and redeploy
4. Consider adding a CAPTCHA layer (Phase 2 feature)

---

## 7. Waitlist Data Access

### In-memory (development)

The in-memory array resets on each server restart. For development purposes only.

### Airtable (production)

1. Log into Airtable with the account used to generate the API key
2. Navigate to the base specified in `AIRTABLE_BASE_ID`
3. Open the `Waitlist` table (or `AIRTABLE_TABLE_NAME`)
4. Each entry has: Email, VisitorType, ConversationLength, Referrer, CreatedAt

### Export waitlist

From Airtable: File → Download CSV (or use the Airtable API).

---

## 8. Incident Response

### P0: Site completely down (no response from /)

1. Check Replit deployment panel — is the deployment active?
2. Check Node.js process logs for crash
3. `curl https://[domain]/api/healthz` — if this fails, API server is down
4. Check if it's a Replit platform issue (status.replit.com)
5. If server is crashing: check deployment logs for stack trace, fix and redeploy

### P1: Chat endpoint returning errors

1. Check deployment logs: `fetch_deployment_logs` with message filter `api/chat`
2. Verify Anthropic API status: status.anthropic.com
3. Check rate limit is not being triggered for all users
4. Test with a minimal payload: `curl -X POST .../api/chat -d '{"messages":[{"role":"user","content":"hi"}],"turnCount":0}'`

### P2: Waitlist entries not appearing in Airtable

1. Entries ARE being saved in-memory — no data loss
2. Check deployment logs for `Airtable save failed` (WARN level)
3. Verify `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` are correctly set in secrets
4. Check Airtable API status at airtable.com
5. Manually export in-memory entries if needed (requires access to running process)

### P3: Performance degradation (slow responses)

1. Check Claude API latency at status.anthropic.com
2. Check if rate limiting is causing queue backup
3. Verify Replit deployment resources are not throttled
4. Check Redis latency if Upstash is configured

---

## 9. Development Workflows

### Starting development

Both workflows should be running:
- `artifacts/api-server: API Server` — Express server, auto-rebuilds on file change
- `artifacts/miaw: web` — Vite dev server with HMR

### Running typechecks
```bash
# Full solution typecheck
pnpm run typecheck

# Individual package
pnpm --filter @workspace/miaw run typecheck
pnpm --filter @workspace/api-server run typecheck
```

### Regenerating API types
```bash
pnpm --filter @workspace/api-spec run codegen
```

Run this after any change to `lib/api-spec/openapi.yaml`.

### Production build test
```bash
pnpm run build
```

This must pass before any deployment. If it fails, do not deploy.

### Checking security headers
```bash
curl -D - -o /dev/null localhost:80/api/healthz | grep -E "Strict|X-Frame|X-Content|Referrer"
```

---

## 10. Maintenance Schedule

| Task | Frequency | Owner |
|---|---|---|
| Knowledge base review | Monthly | Program Director |
| System prompt evaluation (3 test personas) | Monthly | AI/Tech team |
| Dependency audit (`pnpm audit`) | Monthly | Tech |
| Upstash Redis usage check | Monthly | Tech |
| Airtable data backup | Weekly | Ops |
| Deployment log review | Weekly | Tech |
| PostHog funnel review | Weekly | Growth |
| Claude API model version review | When Anthropic releases new Sonnet | Tech |

---

## 11. Backup and Recovery

### Frontend
Static build is recreated from source on every deployment. No backup needed — source code is the backup.

### API server
Same as frontend — built from source on deploy.

### Waitlist data
**Primary:** Airtable (cloud, their backup responsibility)
**Secondary:** Export Airtable CSV weekly
**Tertiary:** In-memory (lost on restart — not a backup)

### Knowledge base
Stored in Git repository — version-controlled and backed up.

### Configuration
All secrets are in Replit Secrets. Document which secrets are set but never store their values in version control.

---

## 12. Cost Management

### Current monthly costs (estimated)

| Service | Usage | Cost |
|---|---|---|
| Replit Hosting | Reserved VM deployment | ~$20/month |
| Anthropic API | 1,000 conversations/month | ~$50/month |
| Upstash Redis | Free tier (10k requests/day) | €0 |
| Airtable | Free tier (1,200 records/base) | €0 |
| PostHog | Free tier (1M events/month) | €0 |
| **Total** | | **~$70/month** |

### Cost controls

1. **Claude API:** Rate limiting (30 req/hr/IP) prevents runaway costs. Monitor via Anthropic usage dashboard.
2. **Airtable:** Free tier supports ~1,200 waitlist entries. Upgrade when approaching limit.
3. **PostHog:** Free tier supports 1M events/month — sufficient for launch.

### When to upgrade

| Trigger | Upgrade |
|---|---|
| > 10,000 Claude API calls/month | Review model selection (Haiku for qualification turns?) |
| > 1,000 Airtable records | Upgrade to Airtable Plus ($10/month) |
| > 1M PostHog events/month | Upgrade PostHog plan |
| High Redis request volume | Review rate limit window sizing |
