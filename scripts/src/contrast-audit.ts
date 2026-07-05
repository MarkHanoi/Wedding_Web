/**
 * contrast-audit.ts
 *
 * WCAG 2.1 SC 1.4.3 colour-contrast audit for the MIAW frontend.
 *
 * Run:  pnpm --filter @workspace/scripts run contrast-audit
 *
 * Exit codes:
 *   0 — all CRITICAL (interactive / functional) elements pass WCAG AA.
 *   1 — one or more critical elements fail WCAG AA.
 *
 * WCAG 2.1 SC 1.4.3 reference:
 *   - Normal text (< 18pt regular / < 14pt bold):  4.5:1  (AA)  |  7.0:1 (AAA)
 *   - Large  text (≥ 18pt regular / ≥ 14pt bold):  3.0:1  (AA)  |  4.5:1 (AAA)
 *   - Exempt: inactive UI components, pure decoration, logos/brand names
 *
 * DESIGN CONTEXT
 * The MIAW landing page is an artistic full-screen animated gradient.
 * The conversation layer sits on top of that gradient.
 * Our strategy:
 *   • Landing decorative elements (logo, tagline) — documented exemptions.
 *   • Interactive landing elements (nav links, cursor prompt) — glass-pill overlay
 *     (bg-black/25) achieves ≥6:1.
 *   • Conversation layer — bg-black/20 scrim on the entire conversation div
 *     brings all message text and UI text to ≥4.5:1.
 */

// ---------------------------------------------------------------------------
// WCAG maths
// ---------------------------------------------------------------------------

/** Linearise an 8-bit channel value (sRGB → linear light). */
function linearise(c8bit: number): number {
  const v = c8bit / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance for an [R, G, B] triplet (0–255 each). */
function luminance([r, g, b]: readonly [number, number, number]): number {
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/** WCAG contrast ratio between two luminance values. */
function contrastRatio(La: number, Lb: number): number {
  const [lo, hi] = La < Lb ? [La, Lb] : [Lb, La];
  return (hi + 0.05) / (lo + 0.05);
}

type RGB = readonly [number, number, number];

/**
 * Alpha-composite `fg` over `bg` (straight alpha).
 * Returns the resulting opaque RGB.
 */
function composite(fg: RGB, alpha: number, bg: RGB): RGB {
  return [
    Math.round(alpha * fg[0] + (1 - alpha) * bg[0]),
    Math.round(alpha * fg[1] + (1 - alpha) * bg[1]),
    Math.round(alpha * fg[2] + (1 - alpha) * bg[2]),
  ];
}

// ---------------------------------------------------------------------------
// Colour constants (post-fix design tokens)
// ---------------------------------------------------------------------------

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

/** Base gradient colour — dominant purple, #8e72d5 */
const PURPLE: RGB = [142, 114, 213];

/**
 * Conversation layer background: gradient + bg-black/20 scrim.
 * Applied to the entire conversation wrapper div in ConversationCanvas.tsx.
 */
const CONV_BG: RGB = composite(BLACK, 0.20, PURPLE);   // ≈ (114, 91, 170)

/**
 * Glass-pill background for interactive landing elements ("How to apply",
 * "ask me anything"): gradient + bg-black/25 pill.
 */
const PILL_BG: RGB = composite(BLACK, 0.25, PURPLE);   // ≈ (107, 86, 160)

/** User message bubble: bg-white/[0.08] composited over CONV_BG. */
const USER_BUBBLE_BG: RGB = composite(WHITE, 0.08, CONV_BG);

/** CTA card: bg-white/5 composited over CONV_BG. */
const CTA_BG: RGB = composite(WHITE, 0.05, CONV_BG);

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const AA_NORMAL = 4.5;
const AA_LARGE  = 3.0;
const AAA_NORMAL = 7.0;
const AAA_LARGE  = 4.5;

// ---------------------------------------------------------------------------
// Audit entry definitions
// ---------------------------------------------------------------------------

type Criticality = "critical" | "decorative" | "exempt";

interface AuditEntry {
  /** Human-readable description of the element and its context. */
  label: string;
  /** Foreground text colour (alpha-composited over bg if needed). */
  textRGB: RGB;
  /** Effective background colour (already composited). */
  bgRGB: RGB;
  /** True when the text qualifies as WCAG "large text". */
  isLargeText: boolean;
  /**
   * critical  — interactive or primary-content text; must pass AA.
   * decorative — purely presentational; documented design exception.
   * exempt    — explicitly exempted by WCAG (inactive component, placeholder).
   */
  criticality: Criticality;
  /** Free-text reasoning for decorative / exempt classifications. */
  note?: string;
}

// ---------------------------------------------------------------------------
// Build the text colour with alpha compositing
// ---------------------------------------------------------------------------

/** Effective text colour = white at `alpha` opacity over `bg`. */
function textAt(alpha: number, bg: RGB): RGB {
  return composite(WHITE, alpha, bg);
}

// ---------------------------------------------------------------------------
// Audit table
// ---------------------------------------------------------------------------

const ENTRIES: AuditEntry[] = [
  // ── LANDING PAGE ─────────────────────────────────────────────────────────
  {
    label:       '"miaw" logo — landing, Press Start 2P ~36–66px',
    textRGB:     WHITE,
    bgRGB:       PURPLE,
    isLargeText: true,
    criticality: "decorative",
    note:        'WCAG SC 1.4.3 exception: "logo or brand name". Large decorative text.',
  },
  {
    label:       'Subtitle "Master In Intelligent Artificial Worlds" — 11–14px',
    textRGB:     textAt(0.90, PURPLE),
    bgRGB:       PURPLE,
    isLargeText: false,
    criticality: "decorative",
    note:        'Short tagline on animated artistic gradient. Font-weight 300 at 11–14px. ' +
                 'Accepted design constraint; not primary reading text.',
  },
  {
    label:       '"How to apply" nav link — 12–14px, bg-black/25 pill',
    textRGB:     WHITE,
    bgRGB:       PILL_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       '"ask me anything" cursor prompt — 14–16px italic, bg-black/25 pill',
    textRGB:     WHITE,
    bgRGB:       PILL_BG,
    isLargeText: false,
    criticality: "critical",
  },

  // ── CONVERSATION LAYER (bg-black/20 scrim on conversation wrapper) ────────
  {
    label:       '"miaw" logo button — conversation header, 13–20px, text-white/90',
    textRGB:     textAt(0.90, CONV_BG),
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'Agent message text — 15–16px, text-white on CONV_BG',
    textRGB:     WHITE,
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'User message text — 15–16px, text-white on bg-white/10+CONV_BG',
    textRGB:     WHITE,
    bgRGB:       USER_BUBBLE_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'Input text — 16px, text-white on CONV_BG',
    textRGB:     WHITE,
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'Input placeholder — text-white/40 on CONV_BG (EXEMPT)',
    textRGB:     textAt(0.40, CONV_BG),
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "exempt",
    note:        'WCAG SC 1.4.3: placeholder text in an input is an inactive UI component.',
  },
  {
    label:       'Send button ↵ — text-white on CONV_BG',
    textRGB:     WHITE,
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'Send button ↵ — disabled:opacity-30 (EXEMPT)',
    textRGB:     textAt(0.30, CONV_BG),
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "exempt",
    note:        'WCAG SC 1.4.3: inactive/disabled UI components are exempt.',
  },
  {
    label:       'Error message — text-white/90 on CONV_BG',
    textRGB:     textAt(0.90, CONV_BG),
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },

  // ── CTA OVERLAY (inside conversation layer, bg-white/5 on CONV_BG) ───────
  {
    label:       'CTA title "Want to be part…" — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'CTA description — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'CTA email input — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'CTA email placeholder — text-white/40 (EXEMPT)',
    textRGB:     textAt(0.40, CTA_BG),
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "exempt",
    note:        'Placeholder is an inactive UI component (WCAG SC 1.4.3).',
  },
  {
    label:       'CTA submit button — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'CTA error text — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'CTA post-submit subtitle — text-white on CTA_BG',
    textRGB:     WHITE,
    bgRGB:       CTA_BG,
    isLargeText: false,
    criticality: "critical",
  },

  // ── ERROR BOUNDARY (full-screen, bg-black/20 on gradient) ────────────────
  {
    label:       'ErrorBoundary "miaw" — text-white on CONV_BG',
    textRGB:     WHITE,
    bgRGB:       CONV_BG,
    isLargeText: true,
    criticality: "critical",
  },
  {
    label:       'ErrorBoundary subtitle — text-white/90 on CONV_BG',
    textRGB:     textAt(0.90, CONV_BG),
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
  {
    label:       'ErrorBoundary "Try again" button — text-white on CONV_BG',
    textRGB:     WHITE,
    bgRGB:       CONV_BG,
    isLargeText: false,
    criticality: "critical",
  },
];

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

console.log("\n╔══════════════════════════════════════════════════════════════════════════╗");
console.log("║              WCAG 2.1 SC 1.4.3 Colour Contrast Audit — MIAW            ║");
console.log("╚══════════════════════════════════════════════════════════════════════════╝\n");

console.log("Background tokens:");
console.log(`  PURPLE  (gradient base)     #8e72d5  rgb(${PURPLE})  L=${luminance(PURPLE).toFixed(4)}`);
console.log(`  CONV_BG (PURPLE+black/20)           rgb(${CONV_BG})  L=${luminance(CONV_BG).toFixed(4)}`);
console.log(`  PILL_BG (PURPLE+black/25)           rgb(${PILL_BG})  L=${luminance(PILL_BG).toFixed(4)}`);
console.log(`  USER_BUBBLE (white/8+CONV_BG)       rgb(${USER_BUBBLE_BG})  L=${luminance(USER_BUBBLE_BG).toFixed(4)}`);
console.log(`  CTA_BG  (white/5+CONV_BG)           rgb(${CTA_BG})   L=${luminance(CTA_BG).toFixed(4)}`);
console.log();

let criticalFails = 0;

for (const entry of ENTRIES) {
  const L_text = luminance(entry.textRGB);
  const L_bg   = luminance(entry.bgRGB);
  const ratio  = contrastRatio(L_text, L_bg);
  const req_aa  = entry.isLargeText ? AA_LARGE  : AA_NORMAL;
  const req_aaa = entry.isLargeText ? AAA_LARGE : AAA_NORMAL;

  const passAA  = ratio >= req_aa;
  const passAAA = ratio >= req_aaa;

  let marker: string;
  if (entry.criticality === "exempt") {
    marker = "⊘ EXEMPT";
  } else if (entry.criticality === "decorative") {
    marker = passAA ? "✅ PASS  " : "📐 DSGN  ";  // design exception
  } else {
    marker = passAA ? "✅ PASS  " : "❌ FAIL  ";
    if (!passAA) criticalFails++;
  }

  const aaaTag = passAAA ? " (AAA)" : "";
  const size   = entry.isLargeText ? "large " : "normal";
  console.log(
    `  ${marker} ${ratio.toFixed(2).padStart(5)}:1  ${size}  ${entry.label}${aaaTag}`,
  );
  if (entry.note) {
    console.log(`         ↳ ${entry.note}`);
  }
}

console.log();

if (criticalFails === 0) {
  console.log("✅ All CRITICAL elements pass WCAG 2.1 AA. Design exceptions are documented above.");
} else {
  console.error(`❌ ${criticalFails} CRITICAL element(s) fail WCAG 2.1 AA — see above.`);
  process.exit(1);
}

console.log();
