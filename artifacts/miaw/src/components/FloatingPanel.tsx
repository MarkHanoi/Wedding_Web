// ---------------------------------------------------------------------------
// FloatingPanel — base draggable, resizable glass panel
//
// Architecture:
//   • Framer Motion `drag` with `dragControls` so dragging is always started
//     EXPLICITLY — never by Framer's own auto-listener.
//
//     `dragListener={false}` is set unconditionally. For title-bar panels
//     (`dragFromEverywhere=false`) drag is started by `dragControls.start(e)`
//     in the title bar's onPointerDown. For full-panel draggable panels
//     (`dragFromEverywhere=true`) drag is started in the outer motion.div's
//     own onPointerDown — UNLESS the pointer target is the resize handle.
//
//     This removes the previous reliance on `stopImmediatePropagation` to
//     prevent Framer from starting a competing drag when the user grabs the
//     resize handle. That approach was fragile because Framer can register
//     listeners in the capture phase, which fires before any bubble-phase
//     stopPropagation call on a child element.
//
//   • Resize handle (bottom-right corner): gesture tracked via window-level
//     pointermove/pointerup so it stays smooth even when the pointer leaves
//     the handle. The target-check in handlePanelPointerDown ensures Framer's
//     drag is never started when the pointer lands on the handle.
//     Minimum dimensions: 200 × 140 px.
//
//   • Resize anchor fix (ADR-015, rev 2):
//     Framer tracks drag position as a CSS transform (x/y motion values)
//     separate from CSS left/top. On resize start we commit the panel's
//     current visual position into CSS left/top (setAnchor) AND zero the
//     Framer transform (dragX/dragY).
//
//     CRITICAL ORDERING CONSTRAINT: setAnchor() triggers a React state
//     update. We must zero dragX/dragY AFTER React has written the new
//     left/top into the DOM, not before. Zeroing before causes a one-frame
//     jump where the CSS transform collapses to translate(0,0) while left/top
//     still holds the old value.
//
//     Fix: set `pendingAnchorZeroRef.current = true` on resize start.
//     A useLayoutEffect watching `anchor` detects the flag and zeroes
//     dragX/dragY synchronously after React commits the DOM — both changes
//     land in the same paint frame, no jump.
//
// Z-index is passed as a prop and managed by the parent (ConversationCanvas).
//
// ADR-006 (Framer Motion), ADR-014 (Resizable Panels), ADR-015 (Resize anchor).
// ---------------------------------------------------------------------------

import { motion, useDragControls, useMotionValue, type MotionStyle } from "framer-motion";
import { useRef, useState, useCallback, useEffect, useLayoutEffect } from "react";
import type { ReactNode } from "react";

export interface FloatingPanelProps {
  children: ReactNode;
  /** Content rendered in the title bar. If omitted and no onClose, no bar. */
  title?: ReactNode;
  /** Renders a ✕ button in the title bar and calls this on click. */
  onClose?: () => void;
  /** Initial left offset (px) — drag adds a transform on top. */
  initialX?: number;
  /** Initial top offset (px). */
  initialY?: number;
  /** CSS width value — string for CSS expressions, number for px. */
  width?: number | string;
  /** CSS height value. Omit to let content define height. */
  height?: number | string;
  /** Stack order — caller manages this so click-to-front works correctly. */
  zIndex?: number;
  /** Called on any pointerdown on the panel (used by parent for z-order). */
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  /** When true the whole panel is the drag handle (no title bar needed). */
  dragFromEverywhere?: boolean;
  /** Extra class on the outer motion.div */
  className?: string;
  /** When true a resize handle is shown in the bottom-right corner. */
  resizable?: boolean;
}

/** Minimum panel dimensions in pixels. */
const MIN_WIDTH  = 200;
const MIN_HEIGHT = 140;

export default function FloatingPanel({
  children,
  title,
  onClose,
  initialX = 60,
  initialY = 80,
  width = 480,
  height,
  zIndex = 20,
  onPointerDown,
  dragFromEverywhere = false,
  className = "",
  resizable = false,
}: FloatingPanelProps) {
  const dragControls = useDragControls();

  // ── Drag motion values ────────────────────────────────────────────────────
  // We hold Framer's x/y as explicit motion values so we can zero them when
  // the user starts a resize gesture (see ADR-015 anchor fix below).
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // ── Anchor (CSS left / top) ───────────────────────────────────────────────
  // Normally equals initialX / initialY. At the moment a resize gesture
  // begins we commit the panel's actual visual position here and zero dragX/Y,
  // so left+0 === the exact pixel position the user sees. This guarantees the
  // top-left corner never moves during a resize.
  const [anchor, setAnchor] = useState<{ left: number; top: number }>({
    left: initialX,
    top: initialY,
  });

  // ── Resize state ─────────────────────────────────────────────────────────
  // Initialised from props; updated by the resize handle gesture.
  const [panelSize, setPanelSize] = useState<{
    width: number | string;
    height: number | string | undefined;
  }>({ width, height });

  // Stable ref for the resize origin — avoids stale closures in move listener.
  const resizeOriginRef = useRef<{
    clientX: number;
    clientY: number;
    width: number;
    height: number;
  } | null>(null);

  // Ref to the outer motion.div for getBoundingClientRect on resize start.
  const panelElRef = useRef<HTMLDivElement>(null);

  // Ref to the resize handle div — used to distinguish resize-handle
  // pointerdown events from regular panel drags (see handlePanelPointerDown).
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // ── ADR-015 rev-2: deferred motion-value zero ────────────────────────────
  // When a resize gesture begins we commit the visual position into CSS
  // left/top (setAnchor) and need to zero Framer's x/y transform at the
  // same time. If we zero them synchronously BEFORE the React re-render the
  // panel jumps for one frame (CSS left/top still holds the old initialX/Y
  // while the transform is already 0). Instead we set this flag, and a
  // useLayoutEffect fires AFTER React has written the new left/top into the
  // DOM but BEFORE the browser paints — zeroing both in the same frame.
  const pendingAnchorZeroRef = useRef(false);

  useLayoutEffect(() => {
    if (pendingAnchorZeroRef.current) {
      pendingAnchorZeroRef.current = false;
      dragX.set(0);
      dragY.set(0);
    }
  // anchor.left / anchor.top are the trigger — when they change after a
  // resize-start we know the DOM is ready and the zero is safe to apply.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor.left, anchor.top]);

  // ── Resize gesture handlers ───────────────────────────────────────────────

  const handleResizeMove = useCallback((e: PointerEvent) => {
    if (!resizeOriginRef.current) return;
    const dx = e.clientX - resizeOriginRef.current.clientX;
    const dy = e.clientY - resizeOriginRef.current.clientY;
    setPanelSize({
      width:  Math.max(MIN_WIDTH,  resizeOriginRef.current.width  + dx),
      height: Math.max(MIN_HEIGHT, resizeOriginRef.current.height + dy),
    });
  }, []);

  const handleResizeUp = useCallback(() => {
    resizeOriginRef.current = null;
    window.removeEventListener("pointermove", handleResizeMove);
    window.removeEventListener("pointerup",   handleResizeUp);
  }, [handleResizeMove]);

  const handleResizePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Prevent default to avoid text selection etc.
      e.preventDefault();

      // The outer handlePanelPointerDown will also fire (via bubble) and will
      // correctly skip starting a drag because the target is the resize handle.
      // We do NOT call stopPropagation here so the z-order onPointerDown prop
      // (bringImagePanelToFront) still fires correctly.

      const rect = panelElRef.current?.getBoundingClientRect();
      if (!rect) return;

      // ── ADR-015 rev-2 anchor fix ──────────────────────────────────────────
      // Commit the panel's current visual position (viewport-relative) into
      // CSS left/top, accounting for any scroll offset of the parent. This
      // captures the exact rendered top-left corner of the panel regardless
      // of what Framer's drag transform currently is.
      const parent    = panelElRef.current?.offsetParent as HTMLElement | null;
      const parentRect = parent?.getBoundingClientRect() ?? { left: 0, top: 0 };
      const committedLeft = rect.left - parentRect.left + (parent?.scrollLeft ?? 0);
      const committedTop  = rect.top  - parentRect.top  + (parent?.scrollTop  ?? 0);

      // Signal the useLayoutEffect to zero dragX/dragY AFTER React commits
      // the new anchor to the DOM (ADR-015 rev-2).
      pendingAnchorZeroRef.current = true;
      setAnchor({ left: committedLeft, top: committedTop });
      // ─────────────────────────────────────────────────────────────────────

      resizeOriginRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        width:   rect.width,
        height:  rect.height,
      };
      window.addEventListener("pointermove", handleResizeMove);
      window.addEventListener("pointerup",   handleResizeUp);
    },
    [handleResizeMove, handleResizeUp],
  );

  // Safety-net cleanup: remove listeners if the component unmounts mid-resize.
  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup",   handleResizeUp);
    };
  }, [handleResizeMove, handleResizeUp]);

  // Sync size state when props change externally — but only while no user
  // resize is in progress (resizeOriginRef is null after the gesture ends).
  const prevWidthRef  = useRef(width);
  const prevHeightRef = useRef(height);
  useEffect(() => {
    if (prevWidthRef.current !== width || prevHeightRef.current !== height) {
      if (!resizeOriginRef.current) {
        setPanelSize({ width, height });
      }
      prevWidthRef.current  = width;
      prevHeightRef.current = height;
    }
  }, [width, height]);

  // Sync anchor (CSS left/top) when the adaptive layout engine repositions
  // this panel — e.g. when a second panel opens and all open panels retile.
  // Resets Framer's drag transform so the panel snaps cleanly to its new slot.
  // Skipped on first mount so the initial position is not double-applied.
  const isFirstPositionSyncRef = useRef(true);
  useEffect(() => {
    if (isFirstPositionSyncRef.current) {
      isFirstPositionSyncRef.current = false;
      return;
    }
    setAnchor({ left: initialX, top: initialY });
    dragX.set(0);
    dragY.set(0);
  // initialX / initialY are the trigger; dragX/dragY are stable motion values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialX, initialY]);

  // ── Panel-level pointer handler ───────────────────────────────────────────
  // This replaces the old `dragListener={dragFromEverywhere}` approach.
  //
  // By always using `dragListener={false}` and starting drag here explicitly,
  // we guarantee that:
  //   1. Framer NEVER auto-starts a drag gesture (no capture-phase conflict).
  //   2. We can gate drag-start on whether the pointer is NOT on the resize
  //      handle — so resize and drag are completely isolated.
  //   3. The z-order `onPointerDown` callback always fires regardless.
  const handlePanelPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Always call the parent's onPointerDown (z-order management etc.)
      onPointerDown?.(e);

      if (dragFromEverywhere) {
        // Only start a drag when the pointer did NOT land on the resize handle.
        const isResizeTarget =
          resizable &&
          resizeHandleRef.current != null &&
          resizeHandleRef.current.contains(e.target as Node);

        if (!isResizeTarget) {
          dragControls.start(e);
        }
      }
    },
    [onPointerDown, dragFromEverywhere, resizable, dragControls],
  );

  // ─────────────────────────────────────────────────────────────────────────

  const hasTitleBar = title !== undefined || onClose !== undefined;

  const outerStyle: MotionStyle = {
    position: "absolute",
    left:   anchor.left,
    top:    anchor.top,
    width:  panelSize.width,
    height: panelSize.height,
    zIndex,
    x: dragX,
    y: dragY,
  };

  return (
    <motion.div
      ref={panelElRef}
      drag
      // dragListener=false always — drag is started exclusively via
      // dragControls.start(), either from the title bar (non-everywhere panels)
      // or from handlePanelPointerDown (dragFromEverywhere panels).
      // This eliminates the capture-vs-bubble race condition that previously
      // caused Framer to start a competing drag when the user grabbed the
      // resize handle on a dragFromEverywhere panel.
      dragListener={false}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
      }}
      exit={{
        opacity: 0,
        scale: 0.92,
        transition: { duration: 0.16, ease: "easeIn" },
      }}
      style={outerStyle}
      className={`floating-panel ${className}`}
      onPointerDown={handlePanelPointerDown}
    >
      {hasTitleBar && (
        <div
          className="floating-panel__titlebar"
          onPointerDown={(e) => {
            // For title-bar panels (dragFromEverywhere=false), start the drag
            // gesture from the title bar only. For dragFromEverywhere panels
            // the drag was already started in handlePanelPointerDown above.
            if (!dragFromEverywhere) dragControls.start(e);
          }}
          style={{ cursor: dragFromEverywhere ? "default" : "grab" }}
        >
          <div className="floating-panel__title">{title}</div>
          {onClose && (
            <button
              type="button"
              className="floating-panel__close"
              aria-label="Close panel"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      <div className="floating-panel__body">{children}</div>

      {/* ── Resize handle ─────────────────────────────────────────────────────
          Rendered only when `resizable` is true. Inset 5 px from the corner
          to stay within the 16 px border-radius clip zone (overflow:hidden on
          .floating-panel would clip a flush handle).

          No stopPropagation / stopImmediatePropagation needed here.
          handlePanelPointerDown checks the target ref and skips drag-start,
          so resize and drag are cleanly separated at the source rather than
          relying on fragile event-phase ordering.
      */}
      {resizable && (
        <div
          ref={resizeHandleRef}
          className="floating-panel__resize-handle"
          onPointerDown={handleResizePointerDown}
          aria-hidden="true"
        />
      )}
    </motion.div>
  );
}
