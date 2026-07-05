// ---------------------------------------------------------------------------
// TimelinePanel — MIAW course timeline diagram viewer (floating panel)
//
// Renders the SVG diagram inline as an <img> that auto-fits to the panel's
// body area via a ResizeObserver. Supports drag-to-pan and +/− zoom controls
// that match the MindMapPanel aesthetic.
//
// UPDATE WORKFLOW:
//   Replace public/diagrams/MIAW-FINAL-PROGRAM.drawio.svg → commit.
//   No code changes needed.
// ---------------------------------------------------------------------------

import { useRef, useState, useCallback, useEffect } from "react";
import FloatingPanel from "./FloatingPanel";

const SVG_NATURAL_W = 3566;
const SVG_NATURAL_H = 2991;
const DIAGRAM_SRC   = "/diagrams/MIAW-FINAL-PROGRAM.drawio.svg";

const ZOOM_STEP = 1.3;
const MIN_ZOOM  = 0.08;
const MAX_ZOOM  = 4.0;

interface Props {
  onClose: () => void;
  initialX: number;
  initialY: number;
  zIndex?: number;
  onPanelPointerDown?: () => void;
  width?: number | string;
  height?: number | string;
}

export default function TimelinePanel({
  onClose,
  initialX,
  initialY,
  zIndex = 36,
  onPanelPointerDown,
  width = 780,
  height = 460,
}: Props) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // ── Fit zoom — computed from the actual rendered body size ────────────────
  const [fitZoom, setFitZoom] = useState(0.12);
  const [zoom,    setZoom]    = useState(0.12);

  const calcFit = useCallback(() => {
    const el = bodyRef.current;
    if (!el) return null;
    const w = el.clientWidth  - 2; // 1px breathing room each side
    const h = el.clientHeight - 2;
    return Math.min(w / SVG_NATURAL_W, h / SVG_NATURAL_H);
  }, []);

  const applyFit = useCallback(() => {
    const fz = calcFit();
    if (fz === null) return;
    setFitZoom(fz);
    setZoom(fz);
    if (bodyRef.current) {
      bodyRef.current.scrollLeft = 0;
      bodyRef.current.scrollTop  = 0;
    }
  }, [calcFit]);

  // Initial fit on mount and on every panel resize.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    applyFit();
    const ro = new ResizeObserver(applyFit);
    ro.observe(el);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Zoom controls ──────────────────────────────────────────────────────────
  const zoomIn  = () => setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_STEP));
  const resetZoom = () => {
    const fz = calcFit() ?? fitZoom;
    setFitZoom(fz);
    setZoom(fz);
    if (bodyRef.current) {
      bodyRef.current.scrollLeft = 0;
      bodyRef.current.scrollTop  = 0;
    }
  };

  // ── Wheel zoom (ctrl/cmd + scroll) ────────────────────────────────────────
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pointer drag pan ──────────────────────────────────────────────────────
  const dragRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  const onBodyPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = {
      x:  e.clientX,
      y:  e.clientY,
      sl: bodyRef.current?.scrollLeft ?? 0,
      st: bodyRef.current?.scrollTop  ?? 0,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const onBodyPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !bodyRef.current) return;
    bodyRef.current.scrollLeft = dragRef.current.sl - (e.clientX - dragRef.current.x);
    bodyRef.current.scrollTop  = dragRef.current.st - (e.clientY - dragRef.current.y);
  }, []);

  const onBodyPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Pixel dimensions at current zoom.
  const displayW = Math.round(SVG_NATURAL_W * zoom);
  const displayH = Math.round(SVG_NATURAL_H * zoom);

  // When the diagram fits entirely, center it; when bigger, let it scroll.
  const atFit = zoom <= fitZoom * 1.01;

  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Course Timeline
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={zIndex}
      resizable
      onPointerDown={onPanelPointerDown}
      className="floating-panel--timeline"
    >
      {/* ── Diagram body ───────────────────────────────────────────────────── */}
      <div
        ref={bodyRef}
        onPointerDown={onBodyPointerDown}
        onPointerMove={onBodyPointerMove}
        onPointerUp={onBodyPointerUp}
        onPointerCancel={onBodyPointerUp}
        style={{
          flex: 1,
          overflow: "auto",
          background: "#0d0b12",
          position: "relative",
          cursor: dragRef.current ? "grabbing" : "grab",
          display: "flex",
          alignItems: atFit ? "center" : "flex-start",
          justifyContent: atFit ? "center" : "flex-start",
        }}
      >
        {/* Scroll-inner sized to the zoomed diagram */}
        <div
          style={{
            width:    displayW,
            height:   displayH,
            minWidth: atFit ? undefined : "100%",
            flexShrink: 0,
          }}
        >
          <img
            src={DIAGRAM_SRC}
            alt="MIAW Course Timeline"
            draggable={false}
            style={{
              width:       displayW,
              height:      displayH,
              display:     "block",
              userSelect:  "none",
              borderRadius: atFit ? 4 : 0,
            }}
          />
        </div>
      </div>

      {/* ── Zoom controls (bottom-right, matching MindMapPanel style) ────────── */}
      <div className="mindmap-zoom-controls" style={{ bottom: 10, right: 10 }}>
        <button className="mindmap-zoom-btn" onClick={zoomOut} aria-label="Zoom out">−</button>
        <button
          className="mindmap-zoom-btn mindmap-zoom-btn--reset"
          onClick={resetZoom}
          aria-label="Fit to panel"
          title="Fit diagram to panel"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button className="mindmap-zoom-btn" onClick={zoomIn} aria-label="Zoom in">+</button>
      </div>
    </FloatingPanel>
  );
}
