---
name: Wedding site flow
description: Architecture and content synchronization rules for Clémence & Antonio's wedding website
---

## What was kept

- Animated pastel gradient background, including behind the information page.
- Full-screen video hero with the couple's names, date, audio control and Explore button.
- Express API server and RSVP route.

## Current page flow

- Explore opens a single continuous scroll page in this order: story, weekend schedule, location, travel, FAQ, dress code and RSVP.
- The information-page intro shows only “We’re getting married,” the couple’s names, the date, and a reserved photo space; do not add a tagline.
- Schedule, venue and RSVP are sections on one continuous page, reached by sticky anchor links rather than separate pages or floating panels.
- The sticky information-page header contains the section links and an arrow-only return control near the right viewport edge; omit the C&A mark and return text.
- The API's wedding knowledge and guest-facing page contain overlapping details and must be synchronized.

**Why:** The wedding information should stay easy to navigate without breaking the continuous-page flow. The couple requested a minimal intro with a reserved photo space and no tagline. Event facts also appear in both the visible page and the API's AI knowledge, so updating only one source can give guests conflicting details.

**How to apply:** Keep the information-page intro to the marriage announcement, the couple’s names, date and photo space. Keep section links in the information-page header and the return control as an accessible arrow-only button. When wedding information changes, update `artifacts/api-server/knowledge/wedding.md` and the corresponding content in `artifacts/miaw/src/components/WeddingCanvas.tsx`. RSVP submissions are currently in-memory and are lost when the API restarts.
