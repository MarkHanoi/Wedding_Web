---
name: Beach palette system
description: Full visual design system derived from Praia da Comporta beach photo — covers gradient colours, glass panel tints, and text contrast rules.
---

## Source
Praia da Comporta beach photo: `attached_assets/image_1783365684371.png`

## Three colour families (no blue, no seafoam, no grey-green)

| Family | Range | Purpose |
|--------|-------|---------|
| White/cream | `#FAF6F0` → `#E8D8B8` (all warm) | c1 blob, c4 highlight |
| Sand light | `#EAD8C0` → `#D0B880` | c2 accent, mix |
| Sand dark | `#D4A574` → `#B8845A` | c3 depth, terracotta |

**Any value with a noticeable blue or green component is wrong.** The palette is purely warm.

## CSS initial values & HeroPage constant
Both must match `DAILY_PALETTES[0]` (Golden Shore):
- `--c1` / `c1`: `#F0E4CC`
- `--c2` / `c2`: `#E8C99A`
- `--c3` / `c3`: `#D4A574`
- `--c4` / `c4`: `#FAF6F0`
- `base`: `#D8BC90`

## Text contrast rule (critical — two surfaces)
- Text ON dark glass → warm-cream: `rgba(255,240,218,0.45–0.92)`
- Text ON white input bg → warm-dark: `rgba(42,24,8,0.75–0.85)`
- Never: dark tint at <0.50 opacity on dark glass (illegible).
- Banned: `rgba(30,15,50,…)` legacy purple tint.

## Contract file
`docs/contract/design-contract.md` — full spec with colour table, typography, spacing, motion, and "What Is Forbidden" section.
