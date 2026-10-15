---
name: Wedding site flow
description: Architecture and content synchronization rules for Clémence & Antonio's wedding website
---

## What was kept

- Animated pastel gradient background, including behind the information page.
- Full-screen video hero with the couple's names, date, audio control and Explore button.
- Express API server and RSVP route.

## Current page flow

- Explore opens a single continuous scroll page with the story, weekend schedule, location, dress code, travel, FAQ and RSVP.
- Schedule, venue and RSVP are sections on one continuous page, reached by sticky anchor links rather than separate pages or floating panels.
- The sticky information-page header contains the section links and an arrow-only return control; omit the C&A mark and return text.
- The API's wedding knowledge and guest-facing page contain overlapping details and must be synchronized.

**Why:** The wedding information should stay easy to navigate without breaking the continuous-page flow. Event facts also appear in both the visible page and the API's AI knowledge, so updating only one source can give guests conflicting details.

**How to apply:** Keep section links in the information-page header and the return control as an accessible arrow-only button. When wedding information changes, update `artifacts/api-server/knowledge/wedding.md` and the corresponding content in `artifacts/miaw/src/components/WeddingCanvas.tsx`. RSVP submissions are currently in-memory and are lost when the API restarts.
