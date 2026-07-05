# Business Approach Guide

> How to talk about MIAW with different stakeholder groups — what they care about, what they fear, and how to address both.

---

## 1. The Core Pitch (All Audiences)

There is a gap at the intersection of AI and physical world design. Architects who want to build AI tools. AI engineers who want to work on physical systems. Almost nobody has both.

MIAW closes that gap. It is an 18-week postgraduate program structured around the design process itself — not around tools — using AI at every phase: reading territory, modeling, designing, simulating, communicating, documenting, fabricating. Students work with their own real projects, not fictional case studies. Every module produces a deliverable they can use in professional practice immediately.

The website is the program's first expression of its own methodology: an AI model qualifies and engages applicants in real time. No traditional landing page. Just a conversation.

---

## 2. Elevator Pitches by Duration

### 30 seconds
"MIAW is a new postgraduate program for architects and AEC professionals who want to integrate AI into every phase of their practice. Not another course about tools — a structured curriculum built around the design process, using real projects. The application site is a conversation with Claude. Click, talk to it, you'll understand what we mean."

### 2 minutes
"There's a growing gap in the AEC sector. Architects want to use AI but don't know how to build with it. AI engineers want to work on physical systems but lack the domain knowledge. Existing programs address one side or the other.

MIAW is 18 weeks, structured as 9 modules that follow the design process: territory, modeling, design, simulation, communication, documentation, fabrication, integration. At each phase, AI is not an add-on — it's integrated into how the work gets done.

The key differentiator: students work with their own live projects throughout. Every module produces a real deliverable. By graduation, they have a portfolio of AI-augmented work, not a certificate for watching videos.

The first cohort is being assembled now. Small — max 30 people — to ensure quality. Applications open via a waiting list. The site itself is worth a visit: it's a conversation with an AI that will ask who you are and what you work on before it tells you anything."

### 5 minutes (stakeholder meeting)
Add: cohort composition strategy (architecture + software hybrid), pricing range (€4,000–8,000, founder pricing for early applicants), delivery model (online-first, 1–2 optional in-person sessions, 8–10 hours/week), first cohort target (Q4 2026), MIAW Advanced pathway for research-oriented graduates.

---

## 3. Stakeholder Profiles and Approach

### 3.1 Program Director / Founder

**What they care about:**
- Cohort quality — the right people, not just numbers
- Differentiation from "AI for architects" commodity courses
- Revenue and sustainability model
- Faculty credibility

**What they fear:**
- Diluting the program to get more applicants
- Infrastructure that requires a tech team to maintain
- Competing with Coursera-scale players who can undercut on price

**How to approach:**
Lead with the qualification function of the site — every visitor who leaves their email had 8 turns of conversation with Claude. The program knows roughly who is applying before the formal application process begins. Emphasize the low-maintenance architecture: no database ops team, optional integrations that degrade gracefully, rate limiting that prevents Claude cost runaway.

---

### 3.2 Prospective Student (Architect Profile)

**What they care about:**
- Is this worth 18 weeks of my time alongside a full-time practice?
- Will I actually be able to do this with my real projects?
- Who else is in the cohort?
- What does it cost?

**What they fear:**
- Another course that teaches tools that will be obsolete in 6 months
- Content too theoretical or too coding-heavy
- Falling behind cohort peers who have stronger technical backgrounds

**How to approach:**
The website does this work automatically. The Claude conversation is calibrated to understand their practice before telling them about the program. When they ask "do I need to code?" the agent gives them the honest answer (basic Python recommended, taught within the program). When they describe their practice, the agent connects it to specific modules.

For human conversations: emphasize that the curriculum is structured by design phases, not by tools. A structural engineer gets different examples from a project architect. The program meets them where they are.

---

### 3.3 Prospective Student (Developer / AI Engineer Profile)

**What they care about:**
- Will this give me domain knowledge I can't get from building in isolation?
- Are the AEC professionals in the cohort serious practitioners?
- Is the technical level challenging enough?

**What they fear:**
- Spending 18 weeks learning things they already know (Python, APIs, Claude)
- Being the "tech person" in a room of non-technical architects with no overlap
- Career ROI — what does an AI engineer with AEC expertise actually do?

**How to approach:**
This profile needs to understand what they don't know they don't know. The AEC domain is complex — regulatory constraints, project delivery models, BIM data structures, construction tolerances. The AI engineer who has spent time working with architects knows how much harder the physical world problem is. Lead with specific technical depth: Gaussian Splatting for 3D capture, Grasshopper scripting via LLMs, structural FEM pipelines.

---

### 3.4 Investor / Program Funder

**What they care about:**
- Market size and timing
- Defensibility — why can't this be replicated by a large university?
- Revenue model at scale
- Founding team credibility

**What they fear:**
- Cohort model is not scalable
- AEC sector is notoriously slow to adopt new practices
- Programs like this have been tried before without commercial success

**How to approach:**
Lead with the demand signal the platform is generating — the waitlist captures profile data that shows the market composition. The defensibility argument is the curriculum: it is structured around the design process phases, not tools, which means it remains relevant as tools change. Universities can't move fast enough to do this credibly. The small cohort model (max 30) is a feature — high-touch, high outcomes, premium pricing.

---

### 3.5 Academic Partner / Faculty

**What they care about:**
- Intellectual credibility of the program
- Whether they're being asked to teach tools or concepts
- Student preparation level
- Their time investment

**What they fear:**
- Students who drop out mid-cohort
- Being associated with a program that doesn't deliver
- Being expected to teach Python basics

**How to approach:**
Emphasize the F0 foundation module — it brings everyone to a working technical baseline before domain-specific modules begin. Show the curriculum structure: faculty teaching F3 (Design) don't need to teach F0 (Foundations) — those concerns are separated by design. The admissions process (portfolio + interview) ensures a minimum preparation threshold.

---

## 4. Demo Flow

The best demo is the site itself. For live presentations:

1. Open `miaw.ai` in the browser (full-screen, no other tabs)
2. Click or press any key
3. The AI immediately asks who you are and what you work on
4. Answer truthfully — the personalization is real
5. Let the conversation run for 3–4 turns
6. At turn 4–5, ask a specific question: "what's in module F3?" or "do I need to code?"
7. Show that the agent gives a precise, accurate answer (pulled from RAG)
8. At turn 7–8, the waitlist invitation appears naturally

**Demo tips:**
- Do not try to break the AI during a demo — this is not the point
- If the agent says something imprecise, note it as an open item (it's an honest limitation)
- The animated gradient and logo animation land better on a large screen
- The logo animates from center to top-left when conversation starts — point this out

**What not to show:**
- The admin/backend — there is no admin UI yet
- The Airtable dashboard during a demo unless it's already populated with real data

---

## 5. Common Questions and Responses

**Q: When does the first cohort start?**
A: Targeting Q4 2026. Exact date depends on cohort composition reaching the minimum viable size.

**Q: How much does it cost?**
A: Range being finalized at €4,000–8,000 total. Early applicants will have access to founder pricing. Payment plans available.

**Q: Is there a certificate?**
A: A certificate of completion from MIAW, with project portfolio as the primary credential.

**Q: How is this different from existing programs?**
A: Three things: structured by design process phases, not tools; students work with their own real projects throughout; each module produces a deliverable directly applicable to professional practice. Most programs teach AI concepts with synthetic exercises. MIAW uses the student's live project as the working material.

**Q: Why should I trust a new program?**
A: The founding team has domain expertise in both AEC practice and AI engineering. The waitlist is already generating qualified applicants. The platform itself demonstrates the technical sophistication of the program.

**Q: Is it fully online?**
A: Online-first with 1–2 optional in-person intensives per cohort. Optional but strongly recommended.

---

## 6. Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Visitor to conversation start | > 60% | PostHog: `conversation_started` / unique visitors |
| Conversation completion (8 turns) | > 40% of starters | PostHog: `cta_shown` / `conversation_started` |
| Waitlist conversion | > 20% of CTA shown | PostHog: `waitlist_submitted` / `cta_shown` |
| Qualified applicant rate | > 50% of waitlist | Manual review post-submission |
| Cost per qualified applicant | < €5 | Claude API cost / qualified applicants |
| First cohort fill rate | 30 of 30 seats | Airtable waitlist size |

---

## 7. What the Platform Does Not Do (Honest Limitations)

- **It does not guarantee conversion.** The AI is calibrated to attract qualified applicants, not to maximize sign-ups.
- **It does not replace a human admissions process.** The portfolio and interview steps are still human.
- **It does not persist conversation history.** Each session starts fresh.
- **It does not handle international payment.** Stripe integration is planned for Phase 2.
- **It does not send confirmation emails.** Waitlist members receive no automated follow-up (yet).
