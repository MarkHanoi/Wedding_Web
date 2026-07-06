// ---------------------------------------------------------------------------
// dailyPalette.ts — day-based beach gradient rotation
//
// 11 palettes drawn entirely from the Praia da Comporta beach palette:
//   warm golden sand, wet terracotta sand, sea foam off-white, pale seafoam
//   grey-green, and deeper aqua-grey water.
//
// All palettes share the same structural role for each blob:
//   c1 — left blob  (cool anchor — seafoam / water tones)
//   c2 — right blob (warm accent — golden sand tones)
//   c3 — bottom/base blob (deeper sand / wet sand)
//   c4 — top blob (sky / pale foam / cream sand)
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
  // 0 — Golden Shore: the primary beach mood, sand and seafoam in full sun
  { c1: "#B8CECC", c2: "#E8C99A", c3: "#D4A574", c4: "#EAD8C0", base: "#C8B898" },

  // 1 — Morning Mist: paler, cooler, sea fog on calm water
  { c1: "#B4C8C4", c2: "#DEBA90", c3: "#CCA07A", c4: "#E8E4D8", base: "#C0C4B8" },

  // 2 — Low Tide: richer wet-sand tones, deep aqua pool
  { c1: "#A0BCB8", c2: "#D4A070", c3: "#C49060", c4: "#E0D4B8", base: "#B4B498" },

  // 3 — Noon Glare: high-key bleached sand, shimmer on water
  { c1: "#C8D8D4", c2: "#EAD0A0", c3: "#D8B880", c4: "#F0EAD8", base: "#D4C8A8" },

  // 4 — Sunset Shore: amber warmth, long teal shadows
  { c1: "#98B8B4", c2: "#D89A60", c3: "#C4885A", c4: "#E0CCAA", base: "#B0A888" },

  // 5 — Sea Glass: muted, desaturated — the palette of tumbled glass
  { c1: "#A4BCBA", c2: "#DCCA98", c3: "#C8B484", c4: "#EAE2CC", base: "#BCBCA8" },

  // 6 — Copper Shore: terracotta warmth, cool seafoam counterpoint
  { c1: "#B4CCCA", c2: "#E0B080", c3: "#C89868", c4: "#EAD8B8", base: "#C4B490" },

  // 7 — Pearl Tide: foam-dominant, very pale and luminous
  { c1: "#C4D8D4", c2: "#ECD8B0", c3: "#DCC490", c4: "#F4EEE0", base: "#D0CCB4" },

  // 8 — Reef Dusk: deep seafoam shadows, terracotta accent
  { c1: "#98B4B0", c2: "#D8A068", c3: "#C09058", c4: "#E4D0AC", base: "#B0A888" },

  // 9 — Bleached Bone: sun-faded parchment, barely-there water
  { c1: "#C0D4D0", c2: "#E8D4A8", c3: "#D8C090", c4: "#F0EAD8", base: "#CCCAB4" },

  // 10 — Atlantic Calm: seafoam leads, cool deep-water energy
  { c1: "#8CB0AC", c2: "#D0B880", c3: "#C0A46C", c4: "#DCDACC", base: "#A8BCB8" },
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
