# Backend — Plain Language Guide
**What the backend is, what it does, and why it matters**
Last updated: May 2026

---

## What is the "backend"?

The backend is the part of MIAW that runs on a server — not in the visitor's browser. When someone has a conversation with the AI, the actual AI is running on Anthropic's servers, but the MIAW backend acts as a secure coordinator: it receives the visitor's message, prepares the context Claude needs, sends the request to Anthropic, and streams the response back to the browser.

Think of the backend as a post office. The visitor sends a message. The post office (backend) reads it, wraps it in the right envelope with the right instructions, sends it to Claude, and then passes the response back continuously as it arrives — one word at a time.

---

## What the backend handles

### 1. The AI conversation

Every message the visitor sends goes to the backend first. The backend does several things before forwarding to Claude:

- **Checks that the message is safe to process** — it validates the format and rejects anything malformed or too long
- **Checks if this visitor has sent too many messages** — the rate limit prevents a single person from sending hundreds of messages in an hour (which would be expensive)
- **Figures out who the visitor probably is** — it looks at what the visitor has said so far and infers whether they are likely an architect, engineer, researcher, etc.
- **Retrieves relevant program information** — it searches the knowledge base for the most relevant facts about MIAW's curriculum, FAQ, and context, and includes them in the prompt for Claude
- **Builds the full instruction set for Claude** — it assembles a detailed set of instructions that tells Claude how to behave, what voice to use, what phase of the conversation this is, and what the visitor's profile is
- **Streams the response back** — as Claude generates words, the backend immediately passes them to the browser without waiting for the full response to finish

### 2. The waitlist

When a visitor submits their email at the end of a conversation, the backend:

- Validates that the email is a real email address format
- Saves it immediately to an in-memory list (always instant, never fails)
- Tries to also save it to Airtable in the background (so the program team can access it easily)
- Returns a confirmation to the browser in under a millisecond

If Airtable is temporarily unavailable, the email is still saved and visible as long as the server is running. This is logged and the team can be notified.

### 3. Security

The backend applies a set of security protections on every single request — not just some:

- **Only accepts requests from the MIAW website** — requests from other websites or automated tools are rejected
- **Limits the size of messages** — prevents anyone from sending a 10MB payload to crash the server
- **Forces HTTPS** — all traffic is encrypted
- **Prevents common web attacks** — through a set of standard security headers

### 4. The knowledge base

The backend loads the MIAW knowledge base when it starts up. This is a set of four text files that contain:
- The full curriculum description (9 modules)
- Frequently asked questions about cost, timeline, admissions
- Context about the AEC sector and why AI matters now
- Faculty profiles

Every time Claude is about to respond, the backend searches this knowledge base and finds the most relevant sections to include. This is what ensures Claude gives accurate program-specific answers rather than generic AI responses.

---

## What happens if something goes wrong

The backend is designed so that each part can fail independently without bringing everything down:

- **If Airtable is down** → emails are still saved in memory; nothing fails for the visitor
- **If Redis (rate limiting database) is down** → rate limiting continues using local memory
- **If the Claude API is slow or down** → the conversation shows an error message to the visitor after 30 seconds, and the team can check Anthropic's status page
- **If the server crashes** → in-memory data (emails, rate limit counters) is lost, but the knowledge base and all code are safely stored in the version control system and the server restarts automatically

---

## How the backend connects to Claude

MIAW uses a service called Replit AI Integrations to talk to Anthropic (Claude's maker). This means:

- There is no API key to manage or rotate — Replit handles the credentials automatically
- Claude is accessed through a standard, secure API
- The model being used is `claude-sonnet-4-6` — a high-quality, fast model suitable for conversational use
- The cost of each Claude call is billed to the Replit account

---

## What the backend does NOT handle (Phase 0)

- **User accounts** — there is no login system
- **Payment processing** — no Stripe or payment gateway
- **Email sending** — the backend does not send confirmation emails to waitlist members
- **Video** — no video infrastructure
- **Database** — no traditional relational database (just in-memory storage and Airtable)

All of these are planned for Phase 1.

---

## Cost of running the backend

The backend itself is very low-cost at current scale:

| Item | Monthly estimate |
|---|---|
| Replit hosting (server) | ~$20 |
| Claude API (1,000 conversations) | ~$50 |
| Redis (rate limiting) | Free tier |
| Airtable (waitlist storage) | Free tier |

The biggest variable cost is Claude API usage, which scales directly with the number of conversations. Rate limiting is already in place to prevent any single visitor from running up costs.

---

## Phase 1 preview

In Phase 1, the backend will grow significantly. It will need to handle:
- **User accounts** — creating accounts, logging in, managing sessions (using Clerk)
- **Database** — storing student progress, assignments, grades (using PostgreSQL)
- **Payments** — processing enrollment fees (using Stripe)
- **Video management** — managing video uploads and playback (using Mux)
- **Email** — sending enrollment confirmations, assignment notifications, etc.

See `phases/PHASE_0_TO_1_TRANSITION.md` for the full plan.
