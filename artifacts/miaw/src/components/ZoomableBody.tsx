// ---------------------------------------------------------------------------
// ZoomableBody — reusable zoom + pan wrapper for floating panel content
//
// Features:
//   • Mouse-wheel zoom toward cursor (non-passive listener so preventDefault works)
//   • Pointer-drag pan (with pointer capture for smooth off-element movement)
//   • +/reset/− buttons (bottom-right, reuse mindmap-zoom-btn styling)
//   • isolateWhenZoomed: at zoom=1 pointer events pass through to the parent
//     — lets dragFromEverywhere panels (image panels) be dragged normally at
//     default zoom, then switches to pan mode when the user zooms in.
//   • fillContent: sets the inner container to height:100% — needed for image
//     panels whose child <img> is also height:100%.
//
// CSS: .zoomable-body in index.css
// ---------------------------------------------------------------------------

import { useRef, useState, useCallback, useEffect, type ReactNode } from "react";

const WHEEL_FACTOR = 1.15;
const BTN_FACTOR   = 1.30;

interface Props {
  children: ReactNode;
  /**
   * When true: at zoom≤1 pointer events are NOT stopped, letting the parent
   * (a dragFromEverywhere FloatingPanel) handle them. At zoom>1 they are
   * captured for panning and panel drag is suppressed.
   */
  isolateWhenZoomed?: boolean;
  /** Make the inner container height:100% — needed when the child is also height:100% */
  fillContent?: boolean;
  minZoom?: number;
  maxZoom?: number;
  /**
   * Initial zoom level on mount. Defaults to 1.
   * Pass a computed fit-zoom so all content is visible from the start.
   * The reset button returns to this value rather than always 1.
   */
  initialZoom?: number;
}

export default function ZoomableBody({
  children,
  isolateWhenZoomed = false,
  fillContent = false,
  minZoom = 0.35,
  maxZoom = 5.0,
  initialZoom = 1,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [xform, setXform] = useState({ zoom: initialZoom, pan: { x: 0, y: 0 } });
  // Mirror xform in a ref so pointer callbacks always read the latest value
  // without needing xform in their dependency arrays (they fire on every pan).
  const xformRef = useRef(xform);
  xformRef.current = xform;
  const pointerDown = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });

  // ── Wheel zoom (non-passive so preventDefault suppresses page scroll) ──────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;
      setXform((prev) => {
        const newZoom = Math.min(maxZoom, Math.max(minZoom, prev.zoom * factor));
        // Point in content-space under cursor stays fixed
        const cX = (cx - prev.pan.x) / prev.zoom;
        const cY = (cy - prev.pan.y) / prev.zoom;
        return { zoom: newZoom, pan: { x: cx - cX * newZoom, y: cy - cY * newZoom } };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [minZoom, maxZoom]);

  // ── Pointer pan ───────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // At zoom=1 with isolateWhenZoomed: let parent (Framer drag) handle it
    if (isolateWhenZoomed && xformRef.current.zoom <= 1) return;
    // Never capture the pointer when it lands on a clickable element — otherwise
    // setPointerCapture() steals the pointer and the button's click never fires.
    if ((e.target as HTMLElement).closest("button, a, input, select, textarea")) return;
    e.stopPropagation();
    pointerDown.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, [isolateWhenZoomed]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    lastPt.current = { x: e.clientX, y: e.clientY };
    setXform((prev) => ({ ...prev, pan: { x: prev.pan.x + dx, y: prev.pan.y + dy } }));
  }, []);

  const onPointerUp = useCallback(() => { pointerDown.current = false; }, []);

  // ── Button zoom (toward visual centre) ───────────────────────────────────
  const zoomToCenter = useCallback((factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? rect.width  / 2 : 100;
    const cy = rect ? rect.height / 2 : 100;
    setXform((prev) => {
      const newZoom = Math.min(maxZoom, Math.max(minZoom, prev.zoom * factor));
      const cX = (cx - prev.pan.x) / prev.zoom;
      const cY = (cy - prev.pan.y) / prev.zoom;
      return { zoom: newZoom, pan: { x: cx - cX * newZoom, y: cy - cY * newZoom } };
    });
  }, [minZoom, maxZoom]);

  const handleIn    = useCallback(() => zoomToCenter(BTN_FACTOR),   [zoomToCenter]);
  const handleOut   = useCallback(() => zoomToCenter(1/BTN_FACTOR), [zoomToCenter]);
  const handleReset = useCallback(() => setXform({ zoom: initialZoom, pan: { x: 0, y: 0 } }), [initialZoom]);

  const { zoom, pan } = xform;

  return (
    <div
      ref={containerRef}
      className="zoomable-body"
      style={{ cursor: zoom > 1 ? (pointerDown.current ? "grabbing" : "grab") : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Content layer — transform applied here */}
      <div
        style={{
          width: "100%",
          height: fillContent ? "100%" : undefined,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
          willChange: "transform",
        }}
      >
        {children}
      </div>

      {/* Zoom controls — reuse mindmap button styles, z-index above synthesis overlays */}
      <div className="mindmap-zoom-controls" style={{ zIndex: 10 }}>
        <button
          type="button"
          className="mindmap-zoom-btn"
          aria-label="Zoom out"
          onClick={handleOut}
        >
          −
        </button>
        <button
          type="button"
          className="mindmap-zoom-btn mindmap-zoom-btn--reset"
          aria-label="Reset zoom"
          onClick={handleReset}
          title={`${Math.round(zoom * 100)}%`}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="mindmap-zoom-btn"
          aria-label="Zoom in"
          onClick={handleIn}
        >
          +
        </button>
      </div>
    </div>
  );
}
