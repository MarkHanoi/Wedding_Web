// ---------------------------------------------------------------------------
// dailyPalette.ts — day-based pastel gradient rotation
//
// 7 distinct pastel palettes, one per day of the year (cycling). Every visitor
// on the same calendar day sees the same mood — the gradient "wakes up" with a
// different hue family each morning, then drifts slowly through it all day.
//
// All palettes share the same structural role for each blob:
//   c1 — left blob (cool anchor)
//   c2 — right blob (warm accent)
//   c3 — bottom/base blob (continuation of c2)
//   c4 — top blob (sky, openness)
//   base — solid fallback behind the radial gradients
//
// Profile-driven evolution (GRADIENT_PALETTES in ConversationCanvas.tsx) still
// fires on top of the daily palette — it only updates specific blobs, so the
// day's overall mood is preserved while the character shift occurs.
// ---------------------------------------------------------------------------

export interface DailyPalette {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  base: string;
}

export const DAILY_PALETTES: DailyPalette[] = [
  // 0 — Lavender & Rose: the default mood, familiar and warm
  { c1: "#a8bef7", c2: "#f4a8d8", c3: "#f7b8e2", c4: "#b8d8fd", base: "#c4b4ee" },

  // 1 — Mint & Coral: fresh, alive, slightly warmer right side
  { c1: "#a0dcc8", c2: "#f5b298", c3: "#f8c0a4", c4: "#b4ecd4", base: "#beddd0" },

  // 2 — Peach & Sage: warm left, cool earthy right — grounded
  { c1: "#f8c4a0", c2: "#a8d8b0", c3: "#b4e0b8", c4: "#fad4b0", base: "#ddd4c4" },

  // 3 — Lilac & Honey: soft purple anchor, golden warmth on right
  { c1: "#c8b4f0", c2: "#f5e090", c3: "#f7e89c", c4: "#d4bcf6", base: "#d4c8f0" },

  // 4 — Sky & Blush: airy light blue, gentle rose — open and tender
  { c1: "#a4d4f8", c2: "#f4a4b4", c3: "#f7b4c4", c4: "#bce8fc", base: "#c4d8f0" },

  // 5 — Sage & Mauve: botanical left, dusty purple right — quiet
  { c1: "#b0d8b4", c2: "#d4a8e0", c3: "#dcb8e8", c4: "#c0e8c4", base: "#c8d8c4" },

  // 6 — Periwinkle & Apricot: blue-purple cool, warm apricot right
  { c1: "#acacf4", c2: "#f4bca0", c3: "#f7c8a8", c4: "#bcc4f8", base: "#c8c4f0" },

  // 7 — Powder & Butter: icy pale blue, creamy soft yellow — light and airy
  { c1: "#c0dff8", c2: "#f8eea0", c3: "#faf4b0", c4: "#d0ecfc", base: "#dce8f0" },

  // 8 — Blush & Seafoam: warm dusty pink left, cool seafoam right — tender contrast
  { c1: "#f0b4c4", c2: "#9ed8cc", c3: "#ace0d4", c4: "#f4c4d0", base: "#d4d8d4" },

  // 9 — Violet & Champagne: deep soft violet, warm champagne — intimate and editorial
  { c1: "#c0a8f0", c2: "#f5e4c0", c3: "#f7eacc", c4: "#ccb4f4", base: "#d0c4e8" },

  // 10 — Dusk & Cream: muted blue-grey left, warm cream right — calm and grounded
  { c1: "#b0c4e0", c2: "#f4e0c0", c3: "#f6e8cc", c4: "#c0d0e8", base: "#ccd4e0" },
];

/** Return the palette for the current calendar day (deterministic — same for
 *  every visitor on the same date). Cycles through all 11 palettes indefinitely. */
export function getTodaysPalette(): DailyPalette {
  const now = new Date();
  // Day-of-year: 1-based, so Jan 1 = day 1. We mod by palette count.
  const start = new Date(now.getFullYear(), 0, 0).getTime();
  const dayOfYear = Math.floor((now.getTime() - start) / 86_400_000);
  return DAILY_PALETTES[dayOfYear % DAILY_PALETTES.length];
}
