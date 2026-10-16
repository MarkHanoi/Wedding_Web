# Design Contract — Clémence & Antonio Wedding Site

> **Version 1.0 · July 2026**
> This document is the single source of truth for all visual decisions.
> Any change to colour, typography, or motion must be reflected here first.

---

## 1. Source Inspiration

The entire visual system is derived from a single reference photograph of **Praia da Comporta** (or equivalent Atlantic beach) showing warm golden sand meeting white sea foam and pale aqua-grey water.

Reference file: `attached_assets/image_1783365684371.png`

---

## 2. Colour Palette

### 2.1 Core Warm Swatches

The moving Explore-page gradient uses a warm sand and cream palette. Its default CSS values are:

| Token | Hex |
|-------|-----|
| `--c1` | `#F0E4CC` |
| `--c2` | `#E8C99A` |
| `--c3` | `#D4A574` |
| `--c4` | `#FAF6F0` |
| Base | `#C8B898` |

Daily palette variations are defined in `dailyPalette.ts`; keep them within the warm sand and cream family.

### 2.2 Text and Surface Contrast

The landing page places white type over video, so preserve its legibility overlay. The Explore page uses warm-dark text on a light gradient:

| Usage | Token / rule |
|-------|--------------|
| Main text | `--wedding-ink` |
| Supporting text | `--wedding-muted` |
| Labels / accents | `--wedding-terra` |

### 2.3 Explore Navigation

Keep the section links sticky at the top of the continuous Explore page. The arrow-only return control stays at the right edge of the navigation.

### 2.4 Animated Gradient Background

The background is a 4-blob CSS mesh gradient that cycles through 11
beach-toned palettes (one per calendar day) using `dailyPalette.ts`.

Blob roles:
- **c1** — cream highlight
- **c2** — right/warm accent (golden sand, `#E8C99A` family)
- **c3** — bottom depth (wet sand, `#D4A574` family)
- **c4** — top/sky (pale cream sand, `#FAF6F0` family)
- **base** — CSS background fallback (`#C8B898`)

Animation: `meshFlow` 45s ease-in-out infinite. Colour transitions: 8s ease.

All palette variants stay within the warm sand and cream range. Respect `prefers-reduced-motion`.

---

## 3. Typography

### 3.1 Font Stack

| Role | Family | Fallback |
|------|--------|----------|
| Display / headings | `Cormorant Garamond` | `Georgia, serif` |
| Body / UI | `Inter` | `sans-serif` |

### 3.2 Scale & Styles

| Context | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| Hero name (Clémence & Antonio) | Cormorant Garamond | `clamp(40px, 8vw, 100px)` | 400 | 0.01em |
| Hero tagline ("We're Getting Married") | Cormorant Garamond | `clamp(14px, 2vw, 20px)` | 300 italic | 0.08em |
| Hero date | Inter | `clamp(11px, 1.4vw, 15px)` | 300 | 0.28em uppercase |
| Nav links | Inter | 0.78rem | 400 | 0.06em |
| Section headings | Cormorant Garamond | `clamp(2.15rem, 5vw, 3.7rem)` | 300 | −0.025em |
| Body / UI | Inter | 0.94rem | 300–400 | — |

---

## 4. Spacing & Layout

| Principle | Usage |
|-----------|-------|
| Continuous scroll | Story, weekend, location, travel, FAQ, dress code and RSVP stay on one page |
| Responsive width | Sections narrow on small screens and remain centered |
| Image blending | The couple photo fades into the moving gradient |
| Navigation | Sticky section links; arrow-only return control |

---

## 5. Motion

| Property | Value |
|----------|-------|
| Background mesh | 45s ease-in-out infinite loop |
| Palette colour transition | 8s ease (CSS custom property) |
| Hero stagger | staggerChildren 0.18s, delayChildren 0.3s |
| Hero item (fadeUp) | `opacity 0→1, y 20→0, duration 0.75s, ease [0.16,1,0.3,1]` |
| CTA bounce | `y 0→6→0, duration 2.4s, easeInOut, infinite` |
| `prefers-reduced-motion` | Disable mesh animation and CSS transitions |

---

## 6. Image Usage

| Asset | Usage |
|-------|-------|
| `Gemini_Generated_Image_viph59viph59viph_1792092122504.jpg` | Couple photo on the Explore introduction |
| `image_1783365684371.png` | Palette reference (not displayed) |

The couple photo uses `object-fit: cover` and a soft edge mask so it blends into the animated background.

---

## 7. What Is Forbidden

- ❌ Unrelated AI-program branding, content or chat UI
- ❌ Purple, blue or green tones in the Explore page's warm gradient
- ❌ Bright saturated accent colours
- ❌ Font families other than Cormorant Garamond and Inter

---

## 8. File Map

| File | Purpose |
|------|---------|
| `artifacts/miaw/src/lib/dailyPalette.ts` | All 11 gradient palettes |
| `artifacts/miaw/src/index.css` | CSS custom properties, mesh animation and page styles |
| `artifacts/miaw/src/components/HeroPage.tsx` | Static hero palette + navigation |
| `artifacts/miaw/src/components/WeddingCanvas.tsx` | Continuous Explore page and RSVP form |
| `docs/contract/design-contract.md` | **This file** |
