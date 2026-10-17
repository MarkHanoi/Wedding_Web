---
name: Publish-time database provisioning
description: Replit-managed PostgreSQL production provisioning and schema sync during publishing.
---

For this project, keep Replit-managed PostgreSQL schema changes in the supported publish flow. A failed initial publish may leave production without a database; after the development database has its intended schema, retry publishing so Replit can provision production and apply the schema. Do not attempt to write to production directly.

**Why:** Replit creates the production database from development during publishing, and a failed promotion may occur before that provisioning completes.

**How to apply:** When the API health check fails because the production database is unavailable, check that the development database has the project schema, then republish. Do not treat a missing production database as a request to create a separate database or bypass the health check.
