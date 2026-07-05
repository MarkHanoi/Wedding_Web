# Frontend — Plain Language Guide
**What the frontend is, what it does, and why it works the way it does**
Last updated: May 2026

---

## What is the "frontend"?

The frontend is everything the visitor sees and interacts with. When someone opens the MIAW website, the frontend is what loads in their browser — the animated purple-pink gradient, the "miaw" pixel logo, the conversation with Claude, and the email form at the end.

The frontend runs entirely inside the visitor's browser. The server does not have to do any work to display the visual elements — they arrive pre-built, like a static file. The server only gets involved when the visitor starts a conversation (to talk to Claude) or submits their email.

---

## How it works in plain English

**Landing state:** The visitor opens the URL. They see the animated gradient with the large "miaw" logo. The subtitle "Master In Intelligent Artificial Worlds" appears. A cursor hint says "ask me anything."

**Conversation start:** The visitor clicks anywhere on the screen, or presses any key, or clicks "How to apply." This triggers the AI to introduce itself. The "miaw" logo animates — it physically moves from the center of the screen to the top-left corner and shrinks into a small button. This is intentional: it signals that the space has reorganized around the conversation.

**Conversation:** The AI sends a message that starts streaming word by word — the visitor sees the text appear in real time, like watching someone type. The visitor can see a blinking cursor while the AI is responding. When it finishes, the visitor types their reply. This repeats for up to 8 turns.

**Waitlist capture:** After 8 turns of conversation, the AI naturally invites the visitor to join the waitlist. An email input field appears inline — not a popup or a separate page, just a field in the conversation flow. The visitor types their email and submits.

**Conversation reset:** Clicking the small "miaw" logo in the top-left corner resets the entire conversation to the beginning.

---

## What technology is used, and why (without jargon)

**React** is the library used to build the interface. Think of it as a system for building interactive screens efficiently — when something changes (a new message arrives), only the relevant part of the screen updates, not the whole page. This is what allows each new word from Claude to appear without the screen flickering or reloading.

**Vite** is the tool that packages all the code into files the browser can load. It makes the site fast to develop (changes appear in under a second) and fast to load in production (files are compressed and optimized automatically).

**Tailwind CSS** is how the visual styling is written. Instead of a separate visual design file, styling instructions are written directly alongside the content they describe. The animated gradient uses a modern browser feature called CSS `@property` — this lets the browser animate the gradient blobs smoothly without any code running on your computer at all. It is hardware-accelerated and costs no battery life.

**Framer Motion** is a library specifically for animations. The logo movement — from large and centered to small and top-left — requires animating across two different parts of the page simultaneously. This is something regular CSS cannot do; Framer Motion handles it natively. Without it, the logo would have to disappear and reappear rather than physically travel across the screen.

---

## What the frontend does NOT do

- It does not store any data on the visitor's computer (no cookies, no saved history)
- It does not send any information to the server unless the visitor actively types a message or submits their email
- It does not have hidden analytics running in the background without a PostHog key being configured
- It does not work without the backend API server — if the server is down, the conversation will not work

---

## Visitor profile detection

As the visitor types, the frontend analyzes their messages to infer their professional background — whether they are an architect, software engineer, researcher, student, urban planner, or engineer. This detection happens entirely inside the browser. It does not send data to any separate server; it reads the conversation text and matches it against a list of signal words.

This detected profile is included with each message sent to Claude, so Claude can tailor its responses to the visitor's background. If the visitor identifies as a structural engineer, Claude connects the program's modules to structural workflows. If the visitor is a software developer, Claude discusses the technical depth differently.

---

## What the files look like (for non-developers)

The frontend is made of several logical pieces:

- The **gradient canvas** — the animated background, always present
- The **logo** — animates between two positions; clicking it resets the conversation
- The **message list** — where the conversation appears
- The **input bar** — where the visitor types; disabled while Claude is responding
- The **typing indicator** — three dots that pulse while Claude is thinking
- The **CTA overlay** — the email field that appears at the end of the conversation
- The **error boundary** — if something goes wrong technically, a branded error screen appears instead of a blank page

---

## When would the frontend need to change?

- **New design decisions:** Changing colors, fonts, layout, animation speed
- **New conversation rules:** Changing when the CTA appears, what happens after email submission
- **New analytics events:** Tracking new user behaviors in PostHog
- **Mobile redesign:** Building a different layout for phone users
- **Language support:** Showing different text based on the visitor's browser language
- **New content on the page:** Adding a faculty section, an FAQ page, or a static "About" page

---

## Phase 1 preview

In Phase 1, the frontend will change significantly. Instead of a single full-screen conversation, the site will have:
- A login/signup page (using Clerk for authentication)
- A student dashboard (showing enrolled modules, progress, deadlines)
- Video lesson pages (using Mux for streaming)
- A payment flow (using Stripe)
- An admin panel (for program directors to see applicants and students)

The technology will shift from the current setup (Vite + React) to Next.js — a framework that makes it easier to build multi-page applications with proper navigation, user accounts, and SEO. See `phases/PHASE_0_TO_1_TRANSITION.md` for the full transition plan.
