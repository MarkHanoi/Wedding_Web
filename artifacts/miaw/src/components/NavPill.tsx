// ---------------------------------------------------------------------------
// NavPill — individually draggable navigation pill (ADR-017)
//
// Architecture
// ────────────
// Each nav pill is a Framer Motion `motion.button` with `drag` enabled.
// Position is managed entirely by Framer's internal x/y motion values:
//
//   • The button has `position: absolute; left: 0; top: 0` in CSS.
//   • `initial={{ x: initialX, y: initialY }}` sets the starting offset.
//   • `animate` does NOT include x/y — Framer keeps them at whatever the
//     user dragged them to, resetting only when the component unmounts.
//   • On unmount + remount (e.g. conversation reset) the pill reappears at
//     its computed initial position — no persistent client state needed.
//
// Drag-vs-click disambiguation (ADR-017)
// ──────────────────────────────────────
// Framer Motion fires a synthetic `onClick` after a drag-end gesture, which
// would incorrectly toggle the panel immediately after the user repositions
// a pill. To prevent this:
//
//   1. `onDragStart` sets `draggedRef.current = true`.
//   2. The button's `onClick` handler checks that flag; if set, it resets
//      the flag and returns early — the toggle is suppressed.
//   3. A genuine tap (pointer-down + pointer-up with < DRAG_THRESHOLD px
//      of movement) never triggers `onDragStart`, so `onClick` fires normally.
//
// Z-index
// ───────
// Pills live at z=48 — above all floating panels (image panels 15–17,
// faculty 35, mindmap/timeline 36–38) but below the chat panel (z=50)
// which is always the topmost foreground element.
//
// Mobile / touch
// ──────────────
// `touchAction: "none"` on the button suppresses browser scroll during a
// drag gesture. Framer Motion handles the pointer events natively.
//
// Usage
// ─────
// <NavPill
//   id="how-to-apply"
//   label="How to apply"
//   active={showDirectApplyPanel}
//   onClick={() => setShowDirectApplyPanel(v => !v)}
//   initialX={computedX}
//   initialY={20}
// />
//
// Update workflow
// ───────────────
// To add a new pill: add an entry to PILL_CONFIGS in ConversationCanvas.tsx.
// No changes to this component needed.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useRef } from "react";

/** Z-index for all nav pills — above floating panels, below chat. */
export const PILL_Z = 48;

export interface NavPillProps {
  /** Stable key / aria id */
  id: string;
  /** Display text inside the pill */
  label: string;
  /** True when the panel this pill controls is currently open */
  active: boolean;
  /**
   * Called when the user taps the pill (not after a drag).
   * Should toggle the corresponding panel open/closed.
   */
  onClick: () => void;
  /**
   * Initial horizontal offset in px from the canvas left edge.
   * Computed by ConversationCanvas from the viewport width so the full
   * pill row starts centred. After the first render the user can drag
   * the pill anywhere; this value is only used on (re)mount.
   */
  initialX: number;
  /**
   * Initial vertical offset in px from the canvas top edge.
   * All pills share the same Y so they form a horizontal row on mount.
   */
  initialY: number;
  /**
   * Visual variant. "global" renders a pearl/white pill to signal that
   * this is a special "view all" action rather than a single panel toggle.
   * Default: "default" (the standard translucent dark pill).
   */
  variant?: "default" | "global";
}

export default function NavPill({
  id,
  label,
  active,
  onClick,
  initialX,
  initialY,
  variant = "default",
}: NavPillProps) {
  // ── ADR-017: drag-vs-click disambiguation ─────────────────────────────────
  // Set to true in onDragStart; checked (and cleared) in onClick.
  const draggedRef = useRef(false);

  return (
    <motion.button
      // ── Identity ──────────────────────────────────────────────────────────
      key={id}
      type="button"
      aria-pressed={active}

      // ── Positioning ───────────────────────────────────────────────────────
      // CSS positions the button at (0,0); Framer's x/y provide the real
      // offset. This keeps position entirely in Framer's motion-value space,
      // which means drag updates are applied without triggering React re-renders.
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        touchAction: "none",   // suppress browser scroll during drag on mobile
        zIndex: PILL_Z,
        cursor: "grab",
        border: "none",
        background: "none",
        padding: 0,
      }}

      // ── Initial position (only applied on mount) ──────────────────────────
      initial={{ x: initialX, y: initialY, opacity: 0, scale: 0.94 }}
      // x/y intentionally omitted from animate — Framer preserves whatever
      // the user dragged them to; only opacity/scale are animated.
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.12 } }}
      transition={{ duration: 0.2, ease: "easeOut" }}

      // ── Drag ──────────────────────────────────────────────────────────────
      drag
      dragMomentum={false}   // no inertia — precise placement, matches FloatingPanel
      dragElastic={0}        // no rubber-banding at viewport edges
      whileDrag={{ scale: 1.07, cursor: "grabbing" }}
      onDragStart={() => { draggedRef.current = true; }}

      // ── Click (tap-only, suppressed after drag) ───────────────────────────
      onClick={() => {
        if (draggedRef.current) {
          // This click event was triggered by a drag-end, not a real tap.
          draggedRef.current = false;
          return;
        }
        onClick();
      }}
    >
      {variant === "global" ? (
        /* Global pill — pearl/white, distinct "view all" affordance */
        <span
          className="text-xs rounded-full px-3.5 py-1.5 inline-block transition-all"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: active ? 600 : 400,
            letterSpacing: "0.10em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            background: active
              ? "rgba(255,255,255,0.92)"
              : "rgba(255,255,255,0.18)",
            color: active ? "rgba(0,0,0,0.82)" : "rgba(255,255,255,0.90)",
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: active
              ? "0 0 0 2px rgba(255,255,255,0.30), 0 2px 12px rgba(255,255,255,0.15)"
              : "none",
          }}
        >
          {label}
        </span>
      ) : (
        /* Default pill — standard translucent dark */
        <span
          className="text-white text-xs bg-black/25 hover:bg-black/40 rounded-full px-3.5 py-1.5 transition-colors inline-block"
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: active ? 500 : 300,
            letterSpacing: "0.12em",
            opacity: active ? 1 : 0.75,
            textDecoration: active ? "underline" : "none",
            textUnderlineOffset: "3px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {label}
        </span>
      )}
    </motion.button>
  );
}
