// ---------------------------------------------------------------------------
// Generative Layout Engine — MIAW canvas panels
//
// Pure functions that compute non-overlapping, viewport-filling LayoutSlots
// for every panel. No React, no side-effects — deterministic and testable.
//
// Design goals
//   1. Panels always fit within the visible viewport (zero overflow / clipping).
//   2. No two panels overlap under any panel combination or viewport size.
//   3. Proportions honour each panel's natural width; they scale together when
//      the viewport is narrower than the summed natural width.
//   4. Every panel receives an explicit height so its internal zoom controller
//      can auto-adapt (e.g. MindMapPanel SVG fit, TimelinePanel SVG fit).
//
// Global-view layout (5 panels)
//   Row 1: MindMap (wide) | Faculty | Guests          ← proportional widths
//   Row 2: Timeline | Institutions                    ← timeline left, institutions right
//
// Single-panel layout
//   Panel placed right-of-chat, filling available vertical space.
// ---------------------------------------------------------------------------

export interface LayoutSlot {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PanelId =
  | "program"
  | "institutions"
  | "faculty"
  | "guests"
  | "timeline"
  | "mindmap"
  | "workshop";

// ── Viewport constants ────────────────────────────────────────────────────────

/** Vertical space consumed by the nav-pill row + breathing room below (px). */
const PILL_ZONE_H = 64;

/** Minimum clearance from every canvas edge (px). */
const MARGIN = 14;

/** Gap between adjacent panels (px). Exported so callers can compute panelAreaLeft. */
export const GAP = 10;

// ── Panel natural & minimum widths ───────────────────────────────────────────
//
// Natural widths: the width at which each panel looks best — its design-intent
// size before any constraint-based scaling is applied.
//
// Minimum widths: below these the content becomes illegible. The engine never
// produces slots narrower than these, even on very small viewports.

const NATURAL_WIDTHS: Record<PanelId, number> = {
  program:      300,
  institutions: 560,
  faculty:      460,
  guests:       460,
  timeline:     900,  // overridden to full-width in global layout
  mindmap:      700,
  workshop:     460,
};

const MIN_WIDTHS: Record<PanelId, number> = {
  program:      180,
  institutions: 180,
  faculty:      260,
  guests:       260,
  timeline:     400,
  mindmap:      360,
  workshop:     260,
};

// ── Row height split (Global view) ───────────────────────────────────────────

/** Fraction of available height given to the four list/grid panels (row 1). */
const ROW1_H_RATIO = 0.56;

/** Minimum row heights in pixels. */
const ROW1_H_MIN = 180;
const ROW2_H_MIN = 120;

// ── computeGlobalLayout ──────────────────────────────────────────────────────

/**
 * Compute pixel-exact LayoutSlots for all five Global-view panels given the
 * current viewport dimensions.
 *
 * @param vw            - Viewport width in px
 * @param vh            - Viewport height in px
 * @param panelAreaLeft - X coordinate where the panel area begins, i.e. the
 *   right edge of the chat panel (including its left offset) plus a small gap.
 *   Defaults to MARGIN (14 px) when no chat panel is present.
 *   Pass `chatPanelInitialX + chatPanelWidth + GAP` from the caller so panels
 *   are guaranteed to never overlap the conversation panel.
 *
 * Algorithm:
 *   1. Subtract pill zone, margins, and inter-panel gaps to get the truly
 *      available area.
 *   2. Split available height into two rows using ROW1_H_RATIO.
 *   3. Scale row-1 panel widths proportionally so their sum exactly fills
 *      the available width, respecting each panel's minimum width.
 *   4. Timeline spans most of row 2 width; institutions takes the right portion.
 *
 * Layout (left → right):
 *   Row 1: Faculty (WHO WE ARE) | MindMap (curriculum map, wide) | Guests (GUEST LECTURES)
 *   Row 2: Timeline (COURSE TIMELINE, wide) | Institutions (right)
 */
export function computeGlobalLayout(vw: number, vh: number, panelAreaLeft = MARGIN): Partial<Record<PanelId, LayoutSlot>> {
  const top    = PILL_ZONE_H + MARGIN;
  // Available width starts after the chat panel (or MARGIN if no chat panel).
  const availW = vw - panelAreaLeft - MARGIN;
  const availH = vh - top - MARGIN;

  // ── Row heights ────────────────────────────────────────────────────────────
  const row1H = Math.max(ROW1_H_MIN, Math.round(availH * ROW1_H_RATIO) - Math.round(GAP / 2));
  const row2H = Math.max(ROW2_H_MIN, availH - row1H - GAP);
  const row2Y = top + row1H + GAP;

  // ── Row 1: Faculty | MindMap (wide, center) | Guests ──────────────────────
  // MindMap takes the combined natural width of program + institutions + GAP
  // so it fills the space those two panels previously occupied.
  const mindmapNatural = NATURAL_WIDTHS.program + NATURAL_WIDTHS.institutions + GAP;
  const mindmapMin     = MIN_WIDTHS.program + MIN_WIDTHS.institutions + GAP;

  // Order: Faculty | MindMap | Guests
  const row1NaturalWidths = [NATURAL_WIDTHS.faculty, mindmapNatural, NATURAL_WIDTHS.guests];
  const row1MinWidths     = [MIN_WIDTHS.faculty,     mindmapMin,     MIN_WIDTHS.guests];

  const totalGaps    = GAP * 2; // 3 panels → 2 gaps
  const scalableW    = availW - totalGaps;
  const totalNatural = row1NaturalWidths.reduce((s, w) => s + w, 0);
  const scale        = Math.min(1, scalableW / totalNatural);

  const widths = row1NaturalWidths.map((nat, i) =>
    Math.max(row1MinWidths[i], Math.floor(nat * scale)),
  );
  // Distribute integer truncation remainder to the last panel.
  const assigned = widths.reduce((s, w) => s + w, 0);
  widths[widths.length - 1] += scalableW - assigned;

  let cursor = panelAreaLeft;
  const facultySlot:  LayoutSlot = { x: cursor, y: top, width: widths[0], height: row1H };
  cursor += widths[0] + GAP;
  const mindmapSlot:  LayoutSlot = { x: cursor, y: top, width: widths[1], height: row1H };
  cursor += widths[1] + GAP;
  const guestsSlot:   LayoutSlot = { x: cursor, y: top, width: widths[2], height: row1H };

  // ── Row 2: Timeline | Institutions ────────────────────────────────────────
  // Institutions takes its natural width on the right; timeline fills the rest.
  const instW      = Math.max(MIN_WIDTHS.institutions, Math.min(NATURAL_WIDTHS.institutions, Math.round(availW * 0.42)));
  const timelineW  = availW - instW - GAP;
  const instX      = panelAreaLeft + timelineW + GAP;

  return {
    // Row 1 — Faculty | MindMap | Guests
    faculty:      facultySlot,
    mindmap:      mindmapSlot,
    program:      mindmapSlot, // alias — not rendered separately in global view
    guests:       guestsSlot,
    // Row 2
    timeline:     { x: panelAreaLeft, y: row2Y, width: timelineW, height: row2H },
    institutions: { x: instX,         y: row2Y, width: instW,     height: row2H },
  };
}

// ── computeAdaptiveLayout ────────────────────────────────────────────────────

/**
 * Compute non-overlapping LayoutSlots for any number of simultaneously open
 * desktop panels. Called whenever the set of open panels changes so the canvas
 * always tiles without overlap.
 *
 * Grid rules:
 *   1 panel  → right-aligned single slot (mirrors computeSinglePanelSlot)
 *   2 panels → two proportional columns, full height
 *   3 panels → three proportional columns, full height
 *   4 panels → two columns × two rows (proportional widths, ROW1_H_RATIO split)
 *   5+       → delegates to computeGlobalLayout
 *
 * @param panels        - Ordered list of currently open panel IDs
 * @param vw            - Viewport width in px
 * @param vh            - Viewport height in px
 * @param panelAreaLeft - Left edge of the panel area (= chatRightEdge + GAP)
 */
export function computeAdaptiveLayout(
  panels: PanelId[],
  vw: number,
  vh: number,
  panelAreaLeft: number,
): Partial<Record<PanelId, LayoutSlot>> {
  const n = panels.length;
  if (n === 0) return {};

  // 5+ panels: fall back to the full global layout engine.
  if (n >= 5) return computeGlobalLayout(vw, vh, panelAreaLeft);

  const top    = PILL_ZONE_H + MARGIN;
  const availW = vw - panelAreaLeft - MARGIN;
  const availH = vh - top - MARGIN;

  const result: Partial<Record<PanelId, LayoutSlot>> = {};

  /**
   * Distribute `totalW` px across `ids` proportional to natural widths.
   * Respects minimum widths; distributes rounding remainder to the last item.
   */
  function scaleRow(ids: PanelId[], totalW: number): number[] {
    if (ids.length === 1) return [Math.max(MIN_WIDTHS[ids[0]], totalW)];
    const gaps         = (ids.length - 1) * GAP;
    const scalable     = Math.max(0, totalW - gaps);
    const naturals     = ids.map((id) => NATURAL_WIDTHS[id]);
    const totalNatural = naturals.reduce((s, w) => s + w, 0);
    const scale        = scalable / totalNatural;
    const widths       = ids.map((id, i) =>
      Math.max(MIN_WIDTHS[id], Math.floor(naturals[i] * scale)),
    );
    const assigned = widths.reduce((s, w) => s + w, 0);
    widths[widths.length - 1] += scalable - assigned; // fix rounding remainder
    return widths;
  }

  /** Place `ids` left-to-right in a horizontal row, writing into `result`. */
  function layoutRow(
    ids: PanelId[],
    rowX: number,
    rowY: number,
    rowW: number,
    rowH: number,
  ): void {
    const widths = scaleRow(ids, rowW);
    let cursor   = rowX;
    ids.forEach((id, i) => {
      result[id] = { x: cursor, y: rowY, width: widths[i], height: rowH };
      cursor += widths[i] + GAP;
    });
  }

  // 1–3 panels: single row at full available height.
  if (n <= 3) {
    layoutRow(panels, panelAreaLeft, top, availW, availH);
    return result;
  }

  // 4 panels: 2 × 2 grid (two rows, proportional columns per row).
  const row1H = Math.max(ROW1_H_MIN, Math.round(availH * ROW1_H_RATIO) - Math.round(GAP / 2));
  const row2H = Math.max(ROW2_H_MIN, availH - row1H - GAP);
  const row2Y = top + row1H + GAP;

  layoutRow(panels.slice(0, 2) as PanelId[], panelAreaLeft, top,  availW, row1H);
  layoutRow(panels.slice(2, 4) as PanelId[], panelAreaLeft, row2Y, availW, row2H);
  return result;
}

// ── computeSinglePanelSlot ───────────────────────────────────────────────────

/**
 * Compute a LayoutSlot for a single panel opened from a nav pill.
 *
 * The panel is placed to the right of the chat panel, filling the full
 * remaining horizontal and vertical space. Width is the panel's natural
 * width, clamped to the available area. The slot is right-aligned so it
 * never overflows the viewport.
 *
 * @param id             - Panel identifier
 * @param vw             - Viewport width in px
 * @param vh             - Viewport height in px
 * @param chatRightEdge  - Right edge of the conversation panel in px,
 *   i.e. `chatInitialX + chatWidth`. Defaults to the formula for the
 *   standard chat FloatingPanel: initialX=56, width=clamp(300px,38vw,520px).
 */
export function computeSinglePanelSlot(
  id: PanelId,
  vw: number,
  vh: number,
  chatRightEdge?: number,
): LayoutSlot {
  // Chat panel: initialX=56, width=clamp(300px, 38vw, 520px)
  const resolvedEdge = chatRightEdge ?? (56 + Math.round(Math.min(Math.max(vw * 0.38, 300), 520)));
  const availW = vw - resolvedEdge - MARGIN;
  const top    = PILL_ZONE_H + MARGIN;
  const availH = vh - top - MARGIN;

  // MindMap: full available width; height sized to the SVG's own aspect ratio
  // (308/700) so the panel wraps the SVG exactly — no empty glass slab below.
  if (id === "mindmap") {
    const SVG_RATIO = 308 / 700;
    const TITLE_H   = 44;
    const w         = Math.max(MIN_WIDTHS[id], availW);
    const contentH  = Math.round(w * SVG_RATIO);
    const h         = Math.min(contentH + TITLE_H, availH);
    const x         = vw - w - MARGIN;
    return { x, y: top, width: w, height: h };
  }

  // Institutions: full available width; height sized to the card grid's aspect
  // ratio (290/700) so the panel wraps the 3-row grid exactly.
  if (id === "institutions") {
    const SVG_RATIO = 290 / 700;
    const TITLE_H   = 44;
    const w         = Math.max(MIN_WIDTHS[id], availW);
    const contentH  = Math.round(w * SVG_RATIO);
    const h         = Math.min(contentH + TITLE_H, availH);
    const x         = vw - w - MARGIN;
    return { x, y: top, width: w, height: h };
  }

  const w = Math.min(NATURAL_WIDTHS[id], Math.max(MIN_WIDTHS[id], availW));
  const x = vw - w - MARGIN;

  return { x, y: top, width: w, height: availH };
}
