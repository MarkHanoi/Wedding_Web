// ---------------------------------------------------------------------------
// dailyPalette.ts — day-based beach gradient rotation
//
// 11 palettes using only three colour families from Praia da Comporta:
//   WHITE  — bright cream / bleached foam   (#FAF6F0 → #F0E4CC)
//   SAND LIGHT — pale warm sand             (#EAD8C0 → #E8C99A → #DCCA98)
//   SAND DARK  — wet sand / terracotta      (#D4A574 → #C49060 → #B8845A)
//
// No blue. No seafoam. No grey-green.
//
// All palettes share the same structural role for each blob:
//   c1 — left blob  (white/cream anchor)
//   c2 — right blob (sand light accent)
//   c3 — bottom/base blob (sand dark depth)
//   c4 — top blob  (white highlight)
//   base — solid fallback behind the radial gradients
//
// ---------------------------------------------------------------------------

export interface DailyPalette {
  c1: string;
  c2: string;
  c3: string;
  c4: string;
  base: string;
}

export const DAILY_PALETTES: DailyPalette[] = [
  // 0 — Golden Shore: classic warm sand in full sun
  { c1: "#F0E4CC", c2: "#E8C99A", c3: "#D4A574", c4: "#FAF6F0", base: "#D8BC90" },

  // 1 — Morning Mist: pale cream, soft light, barely-warm sand
  { c1: "#F5EDDC", c2: "#DEBA90", c3: "#CCA07A", c4: "#FAF4EC", base: "#D4B888" },

  // 2 — Low Tide: richer wet-sand, warm amber depth
  { c1: "#E8D8B8", c2: "#D4A070", c3: "#C49060", c4: "#F2EAD4", base: "#C8A878" },

  // 3 — Noon Glare: high-key bleached sand, near-white highlight
  { c1: "#FAF0DC", c2: "#EAD0A0", c3: "#D8B880", c4: "#FEFAF0", base: "#DCC898" },

  // 4 — Sunset Shore: amber warmth, deep terracotta shadows
  { c1: "#ECD8B4", c2: "#D89A60", c3: "#C4885A", c4: "#F5ECE0", base: "#C8A078" },

  // 5 — Dune Glass: muted, sun-faded parchment, quiet warmth
  { c1: "#F0E8D0", c2: "#DCCA98", c3: "#C8B484", c4: "#FAF4E8", base: "#D0BC90" },

  // 6 — Copper Shore: terracotta warmth, cream counterpoint
  { c1: "#ECD8B8", c2: "#E0B080", c3: "#C89868", c4: "#F5EDD8", base: "#CCA878" },

  // 7 — Pale Dune: foam-dominant, very pale and luminous
  { c1: "#FAF2E4", c2: "#ECD8B0", c3: "#DCC490", c4: "#FEFAF4", base: "#DCCCA4" },

  // 8 — Deep Sand: darkest terracotta, rich wet-sand body
  { c1: "#E4CCB0", c2: "#D8A068", c3: "#C09058", c4: "#F0E4CC", base: "#C8A070" },

  // 9 — Bleached Bone: sun-faded parchment, barely-there warmth
  { c1: "#F5EEE0", c2: "#E8D4A8", c3: "#D8C090", c4: "#FEFAF4", base: "#DCCCA4" },

  // 10 — Warm Dusk: amber-gold, late afternoon glow
  { c1: "#E8D0A4", c2: "#D0B880", c3: "#C0A46C", c4: "#F0E8D4", base: "#C8A870" },
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
