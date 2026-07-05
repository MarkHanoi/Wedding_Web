# Cloudflare Pages + Replit Backend Setup (PoC Deployment)

This guide explains how to deploy a React/Vite frontend from GitHub to Cloudflare Pages while keeping the AI backend running on Replit.

---

# Architecture Overview

Development:

```text
Replit (frontend + backend)
```

Production PoC:

```text
Cloudflare Pages (frontend)
        ↓
Replit Deployment (API backend)
        ↓
Claude API
```

The frontend is hosted on Cloudflare Pages.

The backend (`/api/chat`) remains deployed on Replit.

---

# 1. Push Project to GitHub

From Replit:

* Commit changes
* Push repository to GitHub

Cloudflare will deploy directly from GitHub.

---

# 2. Create Cloudflare Pages Project

Go to:

* Cloudflare Dashboard
* Workers & Pages
* Create Application
* Pages
* Connect to GitHub

Select repository:

```text
MarkHanoi/Master-Foundation
```

---

# 3. Configure Build Settings

Use these exact settings:

## Framework preset

Select:

```text
React
```

(There may not be a Vite option. React works correctly.)

---

## Build command

```text
npm run build
```

---

## Build output directory

```text
dist
```

---

## Root directory

Leave empty or:

```text
/
```

---

# 4. Fix Worker Deploy Commands (IMPORTANT)

If Cloudflare auto-adds Worker deploy commands, replace them.

Go to:

```text
Settings → Build configuration
```

Use:

## Build command

```text
pnpm run build
```

OR:

```text
npm run build
```

(depending on package manager)

---

## Deploy command

```text
echo "skip deploy"
```

---

## Version command

```text
echo "skip deploy"
```

This prevents Cloudflare from trying to deploy a Worker automatically.

We only want static Pages hosting.

---

# 5. Deploy Backend on Replit

The AI backend still runs on Replit.

In Replit:

* Open Deploy tab
* Create Deployment
* Publish app

You will receive a URL like:

```text
https://master-foundation--paramdiecinueve.replit.app
```

This URL becomes the API backend.

---

# 6. Configure Environment Variable in Cloudflare

Go to:

```text
Cloudflare Pages
→ master-foundation
→ Settings
→ Variables and Secrets
```

Add:

## Variable name

```text
VITE_API_URL
```

## Value

```text
https://master-foundation--paramdiecinueve.replit.app
```

IMPORTANT:

* No trailing slash
* Must be the Replit deployment URL
* NOT the Pages URL

---

# 7. Redeploy Cloudflare Pages

After adding environment variables:

Go to:

```text
Deployments
```

Click:

```text
Retry deployment
```

OR:

```text
Redeploy
```

Cloudflare injects environment variables at build time, so redeploy is required.

---

# 8. Verify Deployment

Frontend URL:

```text
https://master-foundation.pages.dev
```

Open browser DevTools → Network tab.

You should see requests like:

```text
POST https://master-foundation--paramdiecinueve.replit.app/api/chat
```

NOT:

```text
/api/chat
```

---

# 9. Required Frontend Refactor

The frontend must support external API URLs.

Example:

```ts
const BASE =
  (import.meta.env.VITE_API_URL ??
   import.meta.env.BASE_URL)
  .replace(/\/$/, "");
```

This allows:

* Replit local development
* Cloudflare production builds

without changing code.

---

# 10. Required Backend CORS Setup

Backend must allow Cloudflare Pages domains.

Example allowed origins:

```text
*.pages.dev
localhost:5173
custom domains
```

Optional env var:

```text
CORS_ALLOWED_ORIGINS
```

Example:

```text
https://miaw.ai,https://www.miaw.ai
```

---

# 11. Common Errors

## 405 Method Not Allowed

Cause:

* Frontend calling `/api/chat`
* Cloudflare Pages has no backend

Fix:

* Set `VITE_API_URL`

---

## CORS Error

Cause:

* Backend does not allow Pages domain

Fix:

* Update backend CORS config

---

## 404 Not Found

Cause:

* Wrong Replit deployment URL

Fix:

* Verify deployed backend URL

---

## 500 Internal Server Error

Cause:

* Missing Anthropic API key
* Backend runtime issue

Fix:

* Check Replit secrets and logs

---

# 12. Recommended Long-Term Architecture

Current setup:

```text
Cloudflare Pages → Replit Backend
```

Recommended future setup:

```text
Cloudflare Pages → Cloudflare Worker → Claude API
```

Benefits:

* Remove Replit dependency
* Same-origin `/api/chat`
* Better production architecture
* Lower latency
* Easier scaling

---

# Final Notes

This setup is ideal for:

* PoC deployments
* Testing
* Sharing staging links
* Separating frontend hosting from development environment

Development workflow:

```text
Replit → GitHub → Cloudflare Pages
```

Future migration path:

```text
VS Code + Claude + Cloudflare-native backend
```
