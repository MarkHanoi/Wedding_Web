# MIAW — Documentation Index
**Master In Intelligent Artificial Worlds**
Last updated: May 2026

---

## What Is This?

This is the master documentation repository for the MIAW platform — a conversational AI agent that IS the website (Phase 0), evolving into a full learning management system and community platform (Phases 1 and 2) for the world's first postgraduate program dedicated to spatial AI and physical world modeling in the AEC sector.

---

## Document Map

```
docs/
├── README.md                              ← You are here
│
├── architecture/
│   ├── SYSTEM_DESIGN.md                   ← Full technical stack, component map, data flows
│   ├── ADR.md                             ← Architecture Decision Records (ADR-001–ADR-013)
│   └── TOGAF_OVERVIEW.md                  ← Enterprise architecture (all 4 TOGAF domains)
│
├── frontend/
│   ├── FRONTEND_TECHNICAL.md              ← Deep technical reference for developers
│   └── FRONTEND_NONTECHNICAL.md           ← Plain-language explanation for stakeholders
│
├── backend/
│   ├── BACKEND_TECHNICAL.md               ← API routes, middleware, schemas, server internals
│   └── BACKEND_NONTECHNICAL.md            ← Plain-language explanation for stakeholders
│
├── design/
│   └── UI_UX_GUIDE.md                     ← Design principles, decisions made, open questions
│
├── user-flows/
│   └── USER_FLOWS.md                      ← Full user journey maps (Phase 0, 1, 2)
│
├── ai/
│   └── AI_LLM_GUIDE.md                   ← AI strategy, model decisions, prompt engineering, RAG
│
├── business/
│   ├── BUSINESS_APPROACH.md               ← How to talk about MIAW with stakeholders
│   ├── VALUE_PROPOSITION.md               ← Market positioning, audience segments, KPIs
│   └── DIRECTOR_MEETING.md                ← Questions and briefing for program director call
│
├── operations/
│   └── RUNBOOK.md                         ← Deployment, monitoring, incident response
│
└── phases/
    ├── PHASE_0_CURRENT.md                 ← Current state: conversational agent
    ├── PHASE_0_TO_1_TRANSITION.md         ← Detailed transition plan Phase 0 → Phase 1
    ├── PHASE_1_PLAN.md                    ← Phase 1: Core platform MVP
    ├── PHASE_1_TO_2_TRANSITION.md         ← Detailed transition plan Phase 1 → Phase 2
    └── PHASE_2_PLAN.md                    ← Phase 2: Full LMS and community
```

---

## Quick Reference by Role

| You are… | Start here |
|---|---|
| A developer joining the project | `architecture/SYSTEM_DESIGN.md` → `frontend/FRONTEND_TECHNICAL.md` → `backend/BACKEND_TECHNICAL.md` |
| A designer or UX contributor | `design/UI_UX_GUIDE.md` → `user-flows/USER_FLOWS.md` |
| A program director or academic stakeholder | `business/VALUE_PROPOSITION.md` → `frontend/FRONTEND_NONTECHNICAL.md` |
| A technical partner or investor | `architecture/TOGAF_OVERVIEW.md` → `phases/PHASE_1_PLAN.md` |
| Planning the Phase 0 → 1 transition | `phases/PHASE_0_TO_1_TRANSITION.md` |
| Planning the Phase 1 → 2 transition | `phases/PHASE_1_TO_2_TRANSITION.md` |
| Handling an incident in production | `operations/RUNBOOK.md` |
| Working on AI/prompt behavior | `ai/AI_LLM_GUIDE.md` |
| Understanding why a decision was made | `architecture/ADR.md` |

---

## Phase Status

| Phase | Status | Stack | Description |
|---|---|---|---|
| **Phase 0** | ✅ Live | React + Vite + Express + Claude | Full-screen conversational AI agent. The website IS the agent. |
| **Phase 1** | ⏳ Planned | Next.js + PostgreSQL + Clerk + Mux + Stripe | Core platform: auth, video, payments, admin panel |
| **Phase 2** | ⏳ Planned | Phase 1 stack + Livekit + community | Full LMS: assignments, certificates, forums, live classes |

---

## Key Technical Facts (Phase 0 — Live)

| Item | Value |
|---|---|
| AI Model | Anthropic Claude Sonnet 4-6 via Replit AI Integrations |
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12 |
| Backend | Express 5 + Node.js 24 + TypeScript 5.9 |
| Hosting | Replit Autoscale Deployments |
| Analytics | PostHog (GDPR memory-only mode, no cookies) |
| Waitlist | Airtable (optional) + in-memory fallback |
| Rate limiting | Upstash Redis (optional) + in-memory fallback |
| Cost per conversation | ~$0.05–$0.15 (8 turns, Claude Sonnet) |
| JS bundle (gzip) | 127KB |

---

## Also See

- `TECH_STACK.md` (repo root) — authoritative technical stack reference
- `PRODUCTION_ROADMAP.md` (repo root) — task tracker with status columns
- `artifacts/api-server/knowledge/` — the RAG knowledge base files

---

## Documentation Conventions

- **Technical docs** (FRONTEND_TECHNICAL, BACKEND_TECHNICAL, ADR, SYSTEM_DESIGN) are written for developers and contain code, schema definitions, and implementation detail.
- **Non-technical docs** (FRONTEND_NONTECHNICAL, BACKEND_NONTECHNICAL, BUSINESS_APPROACH) are readable by a non-developer in under 10 minutes. No code blocks.
- **Phase transition docs** must include: what changes, what stays the same, migration tasks, rollback strategy, and a dependency graph.
- **Every architectural decision with lasting consequences** must have an entry in `architecture/ADR.md`.
- Update this README whenever a new document is added.

---

*MIAW project team · May 2026*
