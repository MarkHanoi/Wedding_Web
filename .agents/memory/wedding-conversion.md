---
name: Wedding site conversion
description: Architecture decisions made when converting MIAW master's programme site to a wedding website for Clémence & Antonio
---

The project was converted from a postgraduate programme site (MIAW) to a wedding website.

## What was kept
- Animated pastel gradient background (`dailyPalette.ts` + CSS @property in `index.css`)
- Streaming chat architecture (Claude via Replit AI Integrations, plain text stream)
- FloatingPanel glass UI component
- MessageBubble, TypingIndicator, CursorPrompt, ErrorBoundary
- Express API server structure, rate limiting, alerting

## What was replaced / removed
- All MIAW academic content (curriculum, faculty, institutions, workshops, modules)
- ConversationCanvas (3000 lines) → WeddingCanvas (~500 lines, clean)
- All MIAW-specific routes (admin, apply, metrics, sessions, stripe, waitlist, og)
- All email templates
- All data files (faculty, guests, institutions, workshops)
- i18n, analytics, layout, topicImages libs
- FoundationsPage, AdvancedPage, TimelinePage

## Key decisions
- All wedding facts live in ONE file: `artifacts/api-server/knowledge/wedding.md` with `[PLACEHOLDER]` markers for unconfirmed details.
- RSVP is in-memory only (needs a database for production persistence).
- WeddingCanvas has three floating panels: Schedule (static `SCHEDULE` array in component), Venue, RSVP form.
- Quick-pick buttons appear after the AI's first message: Schedule | Venue | RSVP.
- System prompt uses warm/personal concierge voice, bilingual (French+English), with honesty instruction for placeholders.
- Splash shows "C & A" in DePixelBreit pixel font, "Clémence & Antonio" subtitle.

**Why:** Clean separation — all content is in the knowledge file (no code changes needed to update wedding info), architecture is minimal for a personal site.

**How to apply:** To update wedding details, edit `artifacts/api-server/knowledge/wedding.md` and restart the API Server. To update the static schedule timeline, also update the `SCHEDULE` array in `WeddingCanvas.tsx`.
