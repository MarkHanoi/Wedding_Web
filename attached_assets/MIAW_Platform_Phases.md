# MIAW — Platform Phases: Full Technical Brief

> Master In Intelligent Artificial Worlds — Digital Platform Roadmap
> Stack: React + Vite · Express 5 · Claude (Anthropic) · PostgreSQL · Stripe · Resend · Replit
> Last updated: May 2026

---

## PHASE 1A — What Exists Today

### 1.1 The Conversational Front Door

The entire user experience begins as a full-screen canvas. No navigation, no scroll, no traditional landing page structure. The user sees an animated gradient and a pixel-font `miaw` logo. Any click or keypress begins the conversation.

**The gradient engine** is built entirely in CSS using `@property` for typed percentage custom properties. Four radial colour blobs (defined per-day from a 7-palette rotation in `dailyPalette.ts`) animate with independent easing curves over 45–180 seconds depending on mode. The palette shifts automatically at midnight — a subtle signal that the system is alive and deliberate, not static.

**The chat panel** is a floating, resizable, draggable panel built with Framer Motion. It appears with a spring animation and stays docked at the left side of the canvas. Messages are bottom-anchored — conversations grow upward from the input, like a real messaging interface. The input bar sits at the bottom with a microphone button for voice input (Web Speech API, gracefully hidden on unsupported browsers).

**Language detection** runs on every message. The system reads the language of whatever the user types and responds in kind — Spanish, English, French, Arabic, Japanese, etc. — without any toggle or setting. The response language is passed to the Claude prompt dynamically.

---

### 1.2 Claude Integration + RAG System

Every message hits `POST /api/chat`. The server streams Claude's response back as plain text (no JSON chunking) over a `ReadableStream`, which the frontend accumulates into a single growing bubble in real time — minimum perceptible latency.

The model in use is `claude-sonnet-4-6` via Replit's AI Integrations (credentials auto-provisioned — never manually set). The API key and base URL are injected at runtime.

**The system prompt is dynamic.** Before each request, `systemPrompt.ts` assembles a context-aware prompt that includes:
- The visitor's inferred profile type (architect, engineer, researcher, student, practitioner, director)
- Relevant knowledge base chunks retrieved by the RAG system
- Conversation history (last N turns)
- Current turn count (behaviour changes after turn 4 and turn 8)
- Language code of the last user message

**The RAG system** (`rag.ts`, 191 lines) is keyword-scored — no embeddings, no vector database. It scores each knowledge chunk against the user's message using term frequency with length normalization, and returns the top 3 chunks. The knowledge base is 4 markdown files:

| File | Content |
|---|---|
| `curriculum.md` | 9 modules with full descriptions, tools, learning outcomes |
| `aec-context.md` | AEC industry framing — why AI matters in architecture |
| `faq.md` | Common questions: pricing, structure, admissions, format |
| `faculty.md` | Faculty profiles, backgrounds, research focus |

This is fast, zero-dependency, and adequate for the current knowledge base. It becomes the migration target for Phase 3 (where it gets replaced with actual embeddings over the full corpus).

---

### 1.3 Visitor Profiling System

`profile.ts` (178 lines) infers who the user is from what they say, without asking directly. It runs on every message and updates the profile state both on the server (for prompt context) and on the client (for UI decisions).

**Inference signals:**
- Vocabulary used — parametric, BIM, Rhino, Python, portfolio, research → different profiles
- Question types — operational vs. conceptual vs. credential-focused
- Self-identification phrases — "I am an architect", "working at a firm"
- Language register — formal/academic vs. exploratory/student-like

**Profile types:** `architect`, `engineer`, `researcher`, `student`, `practitioner`, `director`, `unknown`

The profile drives:
- Which knowledge chunks get prioritised in RAG
- How Claude's system prompt frames the programme (technical depth vs. career framing vs. research angle)
- Which quick-pick shortcuts appear after the first response
- When the CTA overlay shifts from "join waitlist" to "apply now"

---

### 1.4 The Conversation Arc

The conversation is designed as an **8-turn interview**, not a chatbot. Claude is instructed to:

1. Open with a question that establishes who the person is (turn 0)
2. Explore their context for 4–5 turns (curiosity mode)
3. Qualify and frame the programme for their specific background (turns 5–7)
4. At turn 8 (or earlier on detected high intent), surface the CTA

**The CTA Overlay** (`CTAOverlay.tsx`) fades in at the end of the conversation with two paths:
- **Join the waitlist** — email capture, Airtable persistence
- **Apply now** — opens the full application form

The overlay text adapts to the inferred visitor type — the copy shown to a researcher is different from the copy shown to a practising architect.

---

### 1.5 The Global View — Information Architecture

Once a user interacts, the layout engine activates a **"Global View"** — a multi-panel canvas that spreads 8 information panels across the screen simultaneously. The layout is computed by `layout.ts` using pixel-aware slot allocation.

**Active panels:**

| Panel | Description |
|---|---|
| **Chat** | The conversation, docked left with reduced width |
| **Mind Map** | SVG-based radial diagram of the 9 curriculum modules, zoomable/pannable |
| **Program** | Accordion-style curriculum — modules, credits, ECTS |
| **Module Detail** | Opens on module click — description, tools, outcomes |
| **Timeline** | Full course calendar (2383-node drawio file converted to SVG, zoom/pan) |
| **Faculty** | Cards for all faculty with photo, role, speciality |
| **Person Detail** | Opens on faculty click — bio, publications, research |
| **Institutions Map** | SVG world map showing partner institutions |
| **Institution Detail** | Opens on institution click |
| **Guests** | External expert speakers with photo and affiliation |

All panels are independently draggable (pointer-capture), resizable (ResizeObserver), and z-orderable (click to bring forward). Each has its own zoom/pan with `Ctrl+scroll` or `+/−` buttons. A **NavPill** floats at the bottom with shortcut toggles for each panel.

---

### 1.6 Application Flow

The application is a **multi-step conversational form** embedded inside the chat, not a separate page. When a user clicks "Apply Now", the panel slides into application mode — the background gradient shifts to a slower 120-second animation cycle (contemplative, deliberate).

**7 sequential fields collected:**
1. Full name
2. Email address
3. Professional background (structured options + free text)
4. Motivation — why MIAW (long text, encouraged to be honest)
5. Portfolio or work link (optional)
6. How they heard about it (source attribution)
7. Confirmation + intent declaration

Each field is presented one at a time, with the assistant responding to each answer before moving to the next. The application prompt (`applicationPrompt.ts`) is a separate Claude context from the main chat — different system prompt, focused on collecting detailed, honest answers rather than selling the programme.

**On submission, the application triggers:**
- Write to PostgreSQL `applications` table (durable persistence)
- Best-effort save to Airtable (non-blocking)
- Two emails via Resend (see §1.9)
- A unique status token returned to the user as a trackable link in the chat
- Stripe Checkout flow (enrollment deposit)

---

### 1.7 Stripe Payment Integration

`/routes/stripe.ts` (276 lines) + `/lib/stripe.ts` (159 lines) handle the full payment lifecycle.

**Checkout creation** (`POST /api/stripe/create-checkout`):
- Dynamically builds a Stripe Price object if `STRIPE_PRICE_ID` is not pre-configured
- Default enrollment fee: €600 (configurable via `ENROLLMENT_FEE_EUR` env var)
- Includes the application token in Stripe metadata for reconciliation
- Returns a hosted Checkout URL

**Webhook handler** (`POST /api/stripe/webhook`):
- Verifies Stripe signature with `STRIPE_WEBHOOK_SECRET` before processing
- `checkout.session.completed` → marks application as `payment_received` in DB
- `payment_intent.payment_failed` → marks as `payment_failed`, triggers alert
- Sends `EnrollmentConfirmation` email on successful payment

---

### 1.8 Admin Dashboard

`/routes/admin.ts` is the largest file in the codebase (1,263 lines). It exposes a full REST API for the admissions team, protected by an `Authorization` header token.

**API surface:**

| Endpoint | Description |
|---|---|
| `GET /api/admin/applications` | Paginated list with filters (status, date range, source) |
| `GET /api/admin/applications/:id` | Full application detail |
| `PATCH /api/admin/applications/:id/status` | Update status — triggers status email |
| `POST /api/admin/applications/:id/notes` | Internal notes (not visible to applicant) |
| `GET /api/admin/metrics` | Conversion funnel: visits → conversations → CTAs → applications → payments |
| `GET /api/admin/waitlist` | Full waitlist with source attribution |
| `POST /api/admin/emails/test` | Send a test email for any template |

**Application statuses:** `submitted`, `under_review`, `interview_scheduled`, `accepted`, `rejected`, `waitlisted`, `payment_received`, `enrolled`

Every status change automatically fires the `StatusUpdate` email template to the applicant.

---

### 1.9 Email System — 5 Production Templates

All templates built with React Email, rendered server-side, sent via Resend.

| Template | Trigger | Content |
|---|---|---|
| `WaitlistConfirmation` | Waitlist join | Welcome, what to expect, programme teaser |
| `ApplicationAck` | Application submit | Personal tone, application summary, next steps |
| `AdmissionsNotification` | Application submit | Full data for the team, quick action buttons |
| `EnrollmentConfirmation` | Stripe payment | Payment confirmed, onboarding instructions |
| `StatusUpdate` | Admin status change | Dynamic copy adapted to the new status |

Sender address and name configurable via `FROM_EMAIL` env var. Domain verification handled in Resend.

---

### 1.10 Rate Limiting + Resilience

**Two-layer rate limiting** on the chat endpoint:
- **In-memory Map** — always active, keyed by IP, 20 requests/hour
- **Upstash Redis** — activated when `UPSTASH_REDIS_REST_URL` is set, survives server restarts

On rate-limit hit: stream closes gracefully with an in-conversation message, never an HTTP error page.

All persistence (Airtable, PostgreSQL) is **best-effort and non-blocking** — a failure to write never interrupts the user experience. Errors are logged via Pino (structured JSON) and trigger the **alerting system** (`alerting.ts`, 269 lines) which notifies via webhook on critical failures.

---

### Phase 1B — What Remains to Close Phase 1

| Missing piece | Details | Estimate |
|---|---|---|
| **Authentication** | Student login, gated content. Options: Clerk (fastest), custom JWT vs PostgreSQL | €800–1,200 |
| **Video delivery** | Lecture recordings, workshop sessions, expert talk archives via Mux (adaptive bitrate, chapters, viewer analytics) | €1,500–2,200 |
| **Student portal shell** | Post-login dashboard — cohort info, module access, schedule | €400–600 |
| **Phase 1B total** | | **€2,700–4,000** |

---

## PHASE 2 — LMS + Community (To Build)

### 2.1 Student Portal

After authentication, each enrolled student gets a personal dashboard:
- Their cohort (intake month + year)
- Module progress — unlocked, in progress, completed
- Upcoming sessions (live schedule integration)
- Final project current state
- Feedback received on submissions

This is the hub — everything else in the LMS branches from here.

---

### 2.2 Content Delivery — Module Structure

Each of the 9 modules becomes a structured content object:
- **Theory sessions** — recorded lectures (Mux-hosted, chapter markers, progress tracking)
- **Practical sessions** — screen recordings, tutorial walkthroughs
- **Reference materials** — PDFs, tool links, resource lists
- **Submission brief** — what the student must deliver for this module
- **Workflow** — the specific AI workflow (e.g. Workflow 4 = AI Prototyping using Visual Programming)

Access control: modules unlock sequentially by default, or set to open access per cohort. Completion is tracked per-student.

---

### 2.3 The Submission + Rubric System

This is the **most strategically important part of Phase 2** because it doubles as the data collection layer for Phase 3.

**Submission schema (designed for training data, not just assessment):**
```json
{
  "student_id": "...",
  "module_id": "module-4-prototyping",
  "workflow_id": "workflow-4",
  "tools_used": ["Grasshopper", "Midjourney", "Python"],
  "process_notes": "What did you try, what failed, what worked",
  "outcome_description": "What did you produce and why",
  "files": ["model.gh", "render.png", "script.py"],
  "ai_prompts_used": ["the actual prompts used in the workflow"],
  "timestamp": "..."
}
```

**Rubric evaluation by faculty:**
```json
{
  "submission_id": "...",
  "evaluator_id": "...",
  "criteria": {
    "conceptual_quality":       { "score": 4, "comment": "..." },
    "technical_execution":      { "score": 3, "comment": "..." },
    "ai_integration_depth":     { "score": 5, "comment": "..." },
    "documentation_quality":    { "score": 4, "comment": "..." },
    "originality":              { "score": 3, "comment": "..." }
  },
  "overall_feedback": "...",
  "recommended_resources": ["..."]
}
```

Both stored as structured JSON — every evaluation becomes a labeled training example for Phase 3.

---

### 2.4 Peer Review System

Module 3+ introduces structured peer review. Each student evaluates 2 peers per module using the same rubric. Benefits:
- Multiplies evaluation throughput without adding faculty time
- Generates cross-student annotation data (valuable for Phase 3)
- Develops critical AI literacy — evaluating AI-assisted work is itself a skill

---

### 2.5 The Community Layer

Per-module discussion forums with structured thread types:
- **Resource shares** — tools, papers, tutorials the student found useful
- **Work-in-progress** — informal feedback on early-stage work
- **Questions** — addressed by faculty or peers
- **Gallery** — final submitted work, visible to the full cohort

A **template repository** grows organically: students can publish parametric scripts, AI workflow templates, prompt libraries, Grasshopper and Dynamo definitions. Reusable, credited, searchable.

---

### 2.6 Live Session Integration

Expert talks and workshops happen live. Phase 2 adds:
- **Livekit or Zoom API** integration for streaming sessions to enrolled students
- **Session recording** → auto-uploaded to Mux after each live session
- **Chat archive** — the live Q&A saved to the knowledge base for Phase 3 ingestion
- **Attendance tracking** — who attended live vs. watched the recording

---

### 2.7 Certificates + Credentials

**On module completion:**
A generated PDF certificate (React-PDF, server-side rendered) containing:
- Student name
- Module title + ECTS credits
- Faculty signature (image)
- Unique verification hash (verifiable via public URL)

**On cohort completion:**
The full MIAW Masters certificate, including final project title and jury result.

---

### 2.8 Analytics for the Programme Team

A faculty-facing analytics dashboard:
- Per-student engagement curves — when do they disengage?
- Rubric score distributions per module — where is the cohort struggling?
- Tool adoption rates — which AI tools are actually being used?
- Submission quality trends across the cohort timeline
- Conversion rates from lecture → practical → submission

This is **programme intelligence** — it tells faculty what to adjust for Cohort 2.

---

### Phase 2 Cost Estimate

| Deliverable | Estimate |
|---|---|
| Student portal + module access | €2,000–2,500 |
| Content delivery + Mux integration | €1,500–2,000 |
| Submission system + structured schema | €2,000–2,500 |
| Rubric evaluation interface (faculty) | €1,500–2,000 |
| Peer review system | €1,000–1,500 |
| Community forums + gallery | €2,500–3,000 |
| Live session integration (Livekit/Zoom) | €1,400–1,800 |
| Certificates (module + Masters) | €800–1,200 |
| Analytics dashboard | €1,500–2,000 |
| **Phase 2 total** | **€14,200–18,500** |

---

## PHASE 3 — The MIAW Model (To Build)

### 3.1 The Concept

A fine-tuned language model trained on the specific intersection of: architecture + computation + AI practice + the pedagogical voice of MIAW's faculty. Not a general AI assistant — a **domain-specific intelligent tutor** that knows the programme, knows the tools, knows the student's context, and improves with every cohort.

> *"La idea de generar nuestro LLM con nuestros sesgos y aprendiendo de todo lo que vayamos haciendo en el master es brutal"* — Sergio MIAU

---

### 3.2 Data Collection (Happens During Phase 2)

By the end of Cohort 1, the system will have produced:

| Source | Volume |
|---|---|
| Module submissions | ~90 (10 students × 9 modules) with structured metadata |
| Faculty rubric evaluations | ~180 with per-criterion scores and written feedback |
| Peer review annotations | ~360 cross-student evaluations |
| Community forum threads | ~100+ (questions, answers, resources) |
| Live session transcripts | ~15 expert talks + 3 workshops |
| Student prompt libraries | Real prompts that worked in practice |
| Existing knowledge base | Curriculum, faculty, AEC context, FAQ |

**Combined: approximately 500,000–1,000,000 tokens** of structured, domain-specific, pedagogically annotated content. Every piece tagged, attributed, and scored.

---

### 3.3 Fine-Tuning Pipeline

**Base model options:**

| Model | Size | Notes |
|---|---|---|
| Llama 3.1 70B | 70B | Strong generalist, good LoRA fine-tuning |
| Mistral 7B | 7B | Smaller, cheaper to serve, surprisingly capable |
| Qwen 2.5 | 7B–72B | Strong multilingual (Spanish/English support matters) |

**Training format — instruction-following pairs built from the rubric data:**
```json
{
  "instruction": "A student has submitted this parametric model for Module 4 (AI Prototyping). Evaluate it against MIAW's rubric and suggest specific improvements.",
  "input": "[submission_description + tools_used + process_notes]",
  "output": "[faculty evaluation text with per-criterion scores]"
}
```

**LoRA adapters** keep the fine-tune lightweight — modifying ~1% of weights rather than full fine-tuning. Trainable on a single A100 in hours, not days. Each cohort produces a new LoRA checkpoint — additive improvement.

---

### 3.4 What the MIAW Model Does

**1. Intelligent Tutor (Student Portal)**
Lives inside the student portal. Answers questions about modules, tools, and design decisions with MIAW-specific context. Knows the student's submission history and gives personalised, contextual advice — not generic AI answers.

**2. Feedback Pre-Screening**
Before faculty sees a submission, the model evaluates it on the rubric, flags likely weak areas, and suggests relevant resources. Faculty receives a pre-analysis that saves review time and focuses human attention where it matters most.

**3. Prompt Coaching**
The model knows which AI prompts have worked in practice (from the student prompt library). It can coach students on prompt engineering for their specific workflow — not theory, but empirical knowledge from past cohorts.

**4. The Admissions Agent**
Replaces the current generic Claude integration with a model that has MIAW's exact voice, knows the specific questions admissions has learned to ask, and is calibrated from real conversations with accepted vs. rejected applicants. The interview gets sharper with each cohort.

**5. Knowledge Compounding**
Each new cohort's data gets added to the training set. The model gets better every 6 months. Cohort 3 gets a smarter tutor than Cohort 1. The programme's intellectual capital compounds in a proprietary asset.

---

### 3.5 Hosting + Infrastructure

| Item | Cost |
|---|---|
| Fine-tune compute (AWS p3.2xlarge or RunPod A100) | €500–1,500 one-time per cohort |
| Inference hosting (7B model, dedicated GPU) | €200–400/month |
| Dataset curation + annotation tooling | €2,000–4,000 |
| Integration into student portal + admissions agent | €3,000–5,000 |
| **Phase 3 total** | **€8,000–15,000** |

---

## Total Investment Summary

| Phase | Scope | Status | Estimate |
|---|---|---|---|
| **Phase 1A** | Conversational AI site, RAG, profiling, applications, Stripe, admin, 5 email templates | ✅ Complete | ~€6,000 delivered |
| **Phase 1B** | Auth (student login) + Mux video delivery + student portal shell | 🔲 To build | €2,700–4,000 |
| **Phase 2** | LMS, submissions, rubrics, peer review, community, live sessions, certificates, analytics | 🔲 To build | €14,200–18,500 |
| **Phase 3** | Data curation, fine-tune pipeline, MIAW model v1, intelligent tutor + admissions agent | 🔲 To build | €8,000–15,000 |
| **Total remaining** | | | **~€24,900–37,500** |

---

## Strategic Note

The original €20,400 estimate described a commodity LMS — well-built, but one that any institution could replicate. This roadmap ends with a **proprietary asset**: a domain-specific model trained on the unique output of MIAW students, evaluated by MIAW faculty, and calibrated to MIAW's specific pedagogical voice.

No competing AEC postgraduate programme will have this. The programme doesn't just teach AI — it becomes an AI.
