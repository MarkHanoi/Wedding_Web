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
- The information-page intro shows the marriage announcement, names, date, and the couple’s photo; match the main hero’s typography and date format, but retain dark text for the light backdrop and fade photo edges into the moving gradient.
- Schedule, venue and RSVP are sections on one continuous page, reached by sticky anchor links rather than separate pages or floating panels.
- The sticky information-page header contains the section links and an arrow-only return control near the right viewport edge; omit the C&A mark and return text.
- The API's wedding knowledge and guest-facing page contain overlapping details and must be synchronized.

**Why:** The wedding information should stay easy to navigate without breaking the continuous-page flow. The couple requested a minimal intro with its photo and typography consistent with the main hero. Event facts also appear in both the visible page and the API's AI knowledge, so updating only one source can give guests conflicting details.

**How to apply:** Keep the information-page intro to the marriage announcement, the couple’s names, date and photo. Match the main hero's font, weight, sizing and date styling while maintaining contrast on the light background; use a soft mask to blend the photo with the moving gradient. Keep section links in the information-page header and the return control as an accessible arrow-only button. When wedding information changes, update `artifacts/api-server/knowledge/wedding.md` and the corresponding content in `artifacts/miaw/src/components/WeddingCanvas.tsx`. RSVP submissions are currently in-memory and are lost when the API restarts.
