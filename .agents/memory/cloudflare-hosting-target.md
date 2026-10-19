---
name: Cloudflare hosting target
description: The user's standing hosting and data-storage direction for the wedding app.
---

For this app, the user wants the website, API, and data moved off Replit and kept in Cloudflare. They explicitly said not to use Replit's domain, publishing, or secrets setup.

**Why:** the user wants the app entirely off Replit.

**How to apply:** prioritize Cloudflare Workers and D1. Do not initiate or recommend Replit publishing or Replit secret setup unless the user explicitly changes this instruction. If asked about an existing Replit deployment, diagnose it without republishing.

For the local preview, Wrangler requires Node.js 22 even though the Replit workspace defaults to Node.js 20. A Replit console workflow running `wrangler dev` stayed healthy without a `waitForPort`; configuring it to wait on port 8008 caused Replit to mark the task failed even after Wrangler printed that it was listening.

**Why:** this Replit workflow runner did not register Wrangler's port probe reliably.

**How to apply:** keep the local Wrangler preview as a console workflow without `waitForPort`, and resolve Node.js 22 from the Nix store rather than changing the existing Replit runtime.
