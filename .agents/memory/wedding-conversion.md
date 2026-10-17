---
name: Wedding site flow
description: Architecture and content synchronization rules for Clémence & Antonio's wedding website
---

## What was kept

- Animated pastel gradient background, including behind the information page.
- Full-screen video hero with the couple's names, date, audio control and Explore button.
- Express API server and RSVP route.

## Current page flow

- Explore opens a single continuous scroll page in this order: story, weekend schedule, travel, dress code, FAQ, and RSVP; there is no standalone Location / The place section.
- The information-page intro shows the marriage announcement, names, and date over the sea background, with no inset photo.
- Schedule, travel and RSVP are sections on one continuous page, reached by sticky anchor links rather than separate pages or floating panels. Keep event venues and map links in the weekend schedule.
- The sticky information-page header contains the section links and an arrow-only return control near the right viewport edge; omit the C&A mark and return text.
- Wedding details are presented in the Explore page; keep confirmed facts consistent across its sections.

**Why:** The wedding information should stay easy to navigate without breaking the continuous-page flow. The couple requested a minimal, photo-free intro and removal of the standalone Location / The place section.

**How to apply:** Keep the information-page intro to the marriage announcement, names, and date, without an inset photo. Match the main hero's font, weight, and date styling; preserve white text over the dark sea treatment. Do not add a standalone Location / The place section; keep venue details and map links within the weekend schedule and keep sticky links aligned across languages. Preserve the accessible arrow-only return control. When wedding information changes, keep every language version aligned and confirmed facts consistent across sections. RSVPs and anonymous visit counts use managed PostgreSQL; apply schema to development before using Publish to sync production.

## Review-feedback scope

Apply text-only review changes to the Explore page, not the main landing page; do not change colors or visual styling unless explicitly requested.

**Why:** The user specified the second page and copy-only changes for review feedback.

**How to apply:** Keep copy edits in the Explore page and its translations. Leave the main hero and CSS untouched unless the user directs otherwise.
