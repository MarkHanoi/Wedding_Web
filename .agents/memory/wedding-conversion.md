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
- The information-page intro shows the marriage announcement, names, and date over the sea background, with no inset photo.
- Schedule, venue and RSVP are sections on one continuous page, reached by sticky anchor links rather than separate pages or floating panels.
- The sticky information-page header contains the section links and an arrow-only return control near the right viewport edge; omit the C&A mark and return text.
- Wedding details are presented in the Explore page; keep confirmed facts consistent across its sections.

**Why:** The wedding information should stay easy to navigate without breaking the continuous-page flow. The couple requested a minimal, photo-free intro.

**How to apply:** Keep the information-page intro to the marriage announcement, names, and date, without an inset photo. Match the main hero's font, weight, and date styling; preserve white text over the dark sea treatment. Keep section links in the information-page header and the return control as an accessible arrow-only button. When wedding information changes, keep every language version aligned and confirmed facts consistent across sections. RSVP submissions are currently in-memory and are lost when the API restarts.
