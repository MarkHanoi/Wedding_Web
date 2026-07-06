---
name: Beach palette system
description: Full visual design system derived from Praia da Comporta beach photo — covers gradient colours, glass panel tints, and text contrast rules.
---

## Source
Praia da Comporta beach photo: `attached_assets/image_1783365684371.png`
Extracted palette: warm golden sand (`#E8C99A`, `#D4A574`), wet sand (`#C28B62`), sea foam (`#EAD8C0`), seafoam grey-green (`#B8CECC`), deep water (`#8CB0AC`), base (`#C8B898`).

## Key Decisions

**Gradient blobs:** c1 = cool seafoam left, c2 = warm sand right, c3 = wet sand depth, c4 = pale cream top. 11 daily palettes all stay strictly in sand/seafoam family.

**Glass panel tints:** `rgba(38,22,8,0.38)` standard, `rgba(28,14,4,0.55)` chat. NOT purple/blue. Warm dark brown base.

**Text contrast rule (critical):**
- Text ON dark glass → warm-cream: `rgba(255,240,218,0.52–0.92)`
- Text ON white input bg → warm-dark: `rgba(42,24,8,0.82–0.85)`
- Never use dark tint at <0.50 opacity on dark glass — illegible.
- Banned: `rgba(30,15,50,…)` legacy purple tint.

**Why:** Using dark-tinted text at low opacity on a dark glass panel creates near-zero contrast. The surface-aware rule fixes this without changing the overall dark-glass aesthetic.

## Contract file
`docs/contract/design-contract.md` — full spec including colour table, typography, spacing, motion, and what is forbidden.
