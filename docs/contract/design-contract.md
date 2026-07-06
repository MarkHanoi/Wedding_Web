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

### 2.1 Core Beach Swatches

These six values are the atoms of the system. Every other colour is derived from them.

| Token | Hex | Role |
|-------|-----|------|
| `--sand-light` | `#EAD8C0` | Pale cream sand, highlights, foam tint |
| `--sand-mid` | `#E8C99A` | Golden sand — dominant warm accent |
| `--sand-warm` | `#D4A574` | Mid sand — gradient depth |
| `--sand-dark` | `#C28B62` | Wet/terracotta sand — deepest warm |
| `--seafoam` | `#B8CECC` | Pale seafoam — cool left anchor |
| `--water` | `#8CB0AC` | Deeper water — coolest, most saturated |
| `--base` | `#C8B898` | Warm sand base — CSS background fallback |

### 2.2 Text Colour Rules (surface-aware)

Text colour depends on the background surface it sits on. Two surfaces exist:

#### On dark glass panels (`.floating-panel` background)

Use warm-cream rgba so text reads white against the dark tinted glass:

| Usage | Value |
|-------|-------|
| Primary text / names | `rgba(255, 240, 218, 0.92)` |
| Body text | `rgba(255, 240, 218, 0.88)` |
| Secondary text | `rgba(255, 240, 218, 0.75)` |
| Tertiary / label | `rgba(255, 240, 218, 0.52)` |
| Hint / muted | `rgba(255, 240, 218, 0.45)` |
| Error text | `rgba(255, 160, 140, 0.90)` — warm coral |
| Panel title / close | `rgba(255, 255, 255, 0.75)` |

#### On light-background inputs (`rgba(255,255,255,0.55)`)

Use warm-dark brown so text reads dark against the white-tinted input:

| Usage | Value |
|-------|-------|
| Input / button text | `rgba(42, 24, 8, 0.82)` |
| Input border | `rgba(255, 255, 255, 0.20)` |
| Selected button bg | `rgba(255, 255, 255, 0.22)` |
| Unselected button bg | `rgba(255, 255, 255, 0.55)` |

| **Do NOT use** | Reason |
|---|---|
| `rgba(30, 15, 50, …)` | Legacy purple tint — replaced |
| Dark tint at <0.50 opacity on dark glass | Insufficient contrast |

### 2.3 Glass Panel Surfaces

| Panel type | Background | Notes |
|-----------|-----------|-------|
| Standard (Schedule, Venue, RSVP) | `rgba(38, 22, 8, 0.38)` | Warm sand glass |
| Chat panel | `rgba(28, 14, 4, 0.55)` | Darker warm sand glass |
| Blur | `blur(32px) saturate(140%)` | Both panel types |
| Border | `rgba(255, 255, 255, 0.18)` | Standard |
| Border (chat) | `rgba(255, 255, 255, 0.13)` | Slightly more transparent |
| Inset highlight | `rgba(255, 255, 255, 0.14)` | Box-shadow top edge |
| Reduced-motion fallback | `rgba(0, 0, 0, 0.55 / 0.65)` | No blur |

### 2.4 Navigation Bar

| Property | Value |
|----------|-------|
| Background | `rgba(10, 7, 3, 0.96)` |
| Blur | `blur(12px)` |
| Border-bottom | `rgba(255, 255, 255, 0.06)` |
| Nav link (default) | `rgba(255, 255, 255, 0.62)` |
| Nav link (hover) | `rgba(255, 255, 255, 0.92)` |
| RSVP button bg | `rgba(255, 255, 255, 0.94)` |
| RSVP button text | `#0a0a0a` |

### 2.5 Animated Gradient Background

The background is a 4-blob CSS mesh gradient that cycles through 11
beach-toned palettes (one per calendar day) using `dailyPalette.ts`.

Blob roles:
- **c1** — left/cool anchor (seafoam, `#B8CECC` family)
- **c2** — right/warm accent (golden sand, `#E8C99A` family)
- **c3** — bottom depth (wet sand, `#D4A574` family)
- **c4** — top/sky (pale cream sand, `#EAD8C0` family)
- **base** — CSS background fallback (`#C8B898`)

Animation: `meshFlow` 45s ease-in-out infinite. Colour transitions: 8s ease.

All 11 palette variants stay strictly within the warm sand ↔ seafoam range.
No purples, no cool blues, no pinks.

---

## 3. Typography

### 3.1 Font Stack

| Role | Family | Fallback |
|------|--------|----------|
| Display / headings | `Cormorant Garamond` | `Georgia, serif` |
| Monogram "C & A" (nav + chat title) | `Cormorant Garamond` | `Georgia, serif` |
| Body / UI | `Inter` | `sans-serif` |
| `DePixelBreit` | declared via `@font-face` in `index.css`, available if needed; currently unused | — |

### 3.2 Scale & Styles

| Context | Font | Size | Weight | Tracking |
|---------|------|------|--------|----------|
| Hero name (Clémence & Antonio) | Cormorant Garamond | `clamp(40px, 8vw, 100px)` | 400 | 0.01em |
| Hero tagline ("We're Getting Married") | Cormorant Garamond | `clamp(14px, 2vw, 20px)` | 300 italic | 0.08em |
| Hero date | Inter | `clamp(11px, 1.4vw, 15px)` | 300 | 0.28em uppercase |
| Nav links | Inter | 0.78rem | 400 | 0.06em |
| Panel title | Inter | 0.78rem | 400 | 0.12em uppercase |
| Panel body / schedule | Inter | 0.88rem | 400 | — |
| Panel labels | Inter | 0.68rem | 400 | 0.12em uppercase |
| Panel secondary | Inter | 0.72rem–0.82rem | 400 | 0.06–0.10em |
| Quick-pick buttons | Inter | 0.78rem | 300 | 0.04em |
| Chat input | Inter | 16px (mobile safe) | 400 | — |
| Chat C & A title | Cormorant Garamond | `clamp(12px, 1.4vw, 17px)` | 400 | 0.06em |

### 3.3 Text on Panel Glass

All text inside floating panels uses the warm-dark tint system (§ 2.2).
White text (`rgba(255,255,255,x)`) is used for:
- Panel title / close button
- Chat messages (assistant + user)
- Quick-pick button labels
- Back button label

---

## 4. Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| Panel border-radius | 16px (mobile: 12px) | All floating panels |
| Panel padding (body) | 12–20px | Varies by panel |
| Panel gap (items) | 10–16px | Schedule items, form fields |
| Input border-radius | 8px | All form inputs |
| Button border-radius (pill) | 100px | Quick-picks, nav buttons |
| Button border-radius (rect) | 3px | RSVP nav button |
| Nav height | 56px | Fixed |

---

## 5. Motion

| Property | Value |
|----------|-------|
| Background mesh | 45s ease-in-out infinite loop |
| Palette colour transition | 8s ease (CSS custom property) |
| Panel enter | `opacity 0→1, scale 0.95→1, duration 0.22s, ease [0.25,0.1,0.25,1]` |
| Panel exit | `opacity 1→0, scale 1→0.92, duration 0.16s, ease easeIn` |
| Message enter | `opacity 0→1, y 10→0, duration 0.35s, ease [0.25,0.1,0.25,1]` |
| Hero stagger | staggerChildren 0.18s, delayChildren 0.3s |
| Hero item (fadeUp) | `opacity 0→1, y 20→0, duration 0.75s, ease [0.16,1,0.3,1]` |
| CTA bounce | `y 0→6→0, duration 2.4s, easeInOut, infinite` |
| `prefers-reduced-motion` | Disable mesh animation and CSS transitions |

---

## 6. Image Usage

| Asset | Usage |
|-------|-------|
| `Gemini_Generated_Image_d4d3xcd4d3xcd4d3_1783284816056.png` | Hero page beach photo (venue preview card) |
| `image_1783365684371.png` | Palette reference (not displayed) |

Hero photo is displayed in a `16/7` aspect-ratio card, `borderRadius: 12px`,
with `objectFit: cover` and a dark radial overlay for text legibility.

---

## 7. What Is Forbidden

- ❌ Purple / violet tints in any surface (legacy from MIAW academic site)
- ❌ Cool-blue glass panels
- ❌ `rgba(30, 15, 50, …)` — use `rgba(42, 24, 8, …)` instead
- ❌ Hex colours outside the sand/seafoam family in gradients or surfaces
- ❌ Bright saturated accent colours (no reds, greens, or electric blues)
- ❌ Font families other than Cormorant Garamond, Inter, or DePixelBreit

---

## 8. File Map

| File | Purpose |
|------|---------|
| `artifacts/miaw/src/lib/dailyPalette.ts` | All 11 gradient palettes |
| `artifacts/miaw/src/index.css` | CSS custom properties, mesh animation, glass panel rules |
| `artifacts/miaw/src/components/HeroPage.tsx` | Static hero palette + navigation |
| `artifacts/miaw/src/components/WeddingCanvas.tsx` | Chat canvas, RSVP/Schedule/Venue panels |
| `artifacts/miaw/src/components/FloatingPanel.tsx` | Base glass panel component |
| `artifacts/miaw/src/components/MessageBubble.tsx` | Chat message rendering |
| `docs/contract/design-contract.md` | **This file** |
