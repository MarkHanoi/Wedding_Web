// ---------------------------------------------------------------------------
// TimelinePage — MIAW course timeline diagram viewer
//
// Route: /timeline (matched via window.location.pathname in App.tsx)
//
// UPDATE WORKFLOW:
//   1. Open the diagram in draw.io
//   2. File → Export as → SVG
//   3. Replace public/diagrams/MIAW-timeline.svg with the new export
//   4. Commit — no code changes needed, the <img> src is a static path
//
// The SVG is 3776×1653px (draw.io export). The viewer:
//   • Horizontally scrollable container (overflow-x: auto)
//   • Zoom via scale transform on the img wrapper (zoom state × natural size)
//   • "Fit to screen" resets zoom so the full width fills the viewport
//   • Touch / pointer drag for pan when zoomed above fit level
//   • +/− buttons and a reset button, consistent with MindMapPanel styling
// ---------------------------------------------------------------------------

import { useRef, useState, useCallback, useEffect } from "react";

const SVG_NATURAL_W = 3566;
const SVG_NATURAL_H = 2991;
const DIAGRAM_SRC    = "/diagrams/MIAW-FINAL-PROGRAM.drawio.svg";

// Last-updated placeholder — replace with a build-time injected value or
// update manually after each diagram export.
const LAST_UPDATED = "May 2026";

const ZOOM_STEP = 1.25;
const MIN_ZOOM  = 0.15;
const MAX_ZOOM  = 4.0;

export default function TimelinePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  // fitZoom: the scale that makes the diagram fill the container width.
  // zoom: current user scale (starts at fitZoom, user can adjust).
  const [fitZoom, setFitZoom]   = useState(1);
  const [zoom, setZoom]         = useState(1);

  const calcFitZoom = useCallback(() => {
    const w = containerRef.current?.clientWidth ?? window.innerWidth;
    return Math.min(w / SVG_NATURAL_W, 1);
  }, []);

  // Set initial fit zoom once the container mounts.
  useEffect(() => {
    const fz = calcFitZoom();
    setFitZoom(fz);
    setZoom(fz);
  }, [calcFitZoom]);

  // Re-fit on window resize.
  useEffect(() => {
    const onResize = () => {
      const fz = calcFitZoom();
      setFitZoom(fz);
      // Only auto-refit if the user hasn't manually zoomed.
      setZoom((prev) => (Math.abs(prev - fitZoom) < 0.005 ? fz : prev));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [calcFitZoom, fitZoom]);

  const zoomIn  = () => setZoom((z) => Math.min(MAX_ZOOM, z * ZOOM_STEP));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, z / ZOOM_STEP));
  const resetZoom = () => {
    const fz = calcFitZoom();
    setFitZoom(fz);
    setZoom(fz);
    // Scroll back to the start.
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
      containerRef.current.scrollTop  = 0;
    }
  };

  // ── Wheel zoom toward cursor ───────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // plain scroll = pan, ctrl/cmd = zoom
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * factor)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pointer drag pan ──────────────────────────────────────────────────────
  const dragRef = useRef<{ x: number; y: number; sl: number; st: number } | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = {
      x:  e.clientX,
      y:  e.clientY,
      sl: containerRef.current?.scrollLeft ?? 0,
      st: containerRef.current?.scrollTop  ?? 0,
    };
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !containerRef.current) return;
    containerRef.current.scrollLeft = dragRef.current.sl - (e.clientX - dragRef.current.x);
    containerRef.current.scrollTop  = dragRef.current.st - (e.clientY - dragRef.current.y);
  }, []);

  const onPointerUp = useCallback(() => { dragRef.current = null; }, []);

  // Derived pixel dimensions at current zoom.
  const displayW = Math.round(SVG_NATURAL_W * zoom);
  const displayH = Math.round(SVG_NATURAL_H * zoom);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(135deg, #e8e0f8 0%, #ddd6f8 40%, #f0e8ff 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          background: "rgba(255,255,255,0.18)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.3)",
          flexShrink: 0,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        {/* Back + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <a
            href="/"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "clamp(13px, 2vw, 20px)",
              color: "rgba(80,60,120,0.85)",
              textDecoration: "none",
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
            }}
          >
            miaw
          </a>
          <span style={{ color: "rgba(100,80,140,0.4)", fontSize: 18 }}>›</span>
          <span
            style={{
              fontSize: "clamp(11px, 1.4vw, 14px)",
              fontWeight: 300,
              color: "rgba(80,60,120,0.7)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Course Timeline
          </span>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Zoom buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "rgba(255,255,255,0.35)",
              borderRadius: 999,
              padding: "2px 6px",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <ZoomBtn onClick={zoomOut} label="−" aria="Zoom out" />
            <button
              onClick={resetZoom}
              aria-label="Fit to screen"
              title="Fit to screen"
              style={zoomBtnStyle}
            >
              {Math.round(zoom * 100)}%
            </button>
            <ZoomBtn onClick={zoomIn} label="+" aria="Zoom in" />
          </div>

          {/* Fit button */}
          <button
            onClick={resetZoom}
            style={{
              fontSize: 11,
              fontWeight: 400,
              fontFamily: "Inter, sans-serif",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "rgba(80,60,120,0.75)",
              background: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 999,
              padding: "5px 14px",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.35)")}
          >
            fit
          </button>
        </div>
      </header>

      {/* ── Diagram container ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          flex: 1,
          overflow: "auto",
          cursor: dragRef.current ? "grabbing" : "grab",
          WebkitOverflowScrolling: "touch",
          padding: 24,
          boxSizing: "border-box",
        }}
      >
        {/* Inner wrapper sized to the diagram so the scrollbar is accurate */}
        <div
          style={{
            width:    displayW,
            height:   displayH,
            minWidth: "100%",
            position: "relative",
          }}
        >
          {/*
            <img> renders the SVG at the zoomed size.
            draggable=false prevents browser's native image drag from
            interfering with our pointer-capture pan.
          */}
          <img
            src={DIAGRAM_SRC}
            alt="MIAW Course Timeline"
            draggable={false}
            style={{
              width:  displayW,
              height: displayH,
              display: "block",
              userSelect: "none",
              borderRadius: 8,
              boxShadow: "0 4px 32px rgba(100,80,160,0.12)",
            }}
          />
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: "8px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 300,
            color: "rgba(80,60,120,0.4)",
            letterSpacing: "0.06em",
          }}
        >
          ctrl + scroll to zoom · drag to pan · last updated {LAST_UPDATED}
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 300,
            color: "rgba(80,60,120,0.3)",
            letterSpacing: "0.04em",
          }}
        >
          To update: export SVG from draw.io → replace public/diagrams/MIAW-timeline.svg → commit
        </p>
      </footer>
    </div>
  );
}

// ── Shared zoom button styles ─────────────────────────────────────────────────

const zoomBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 400,
  fontFamily: "Inter, sans-serif",
  color: "rgba(80,60,120,0.8)",
  padding: "4px 8px",
  borderRadius: 999,
  lineHeight: 1,
  minWidth: 36,
  textAlign: "center",
  transition: "background 0.12s",
};

function ZoomBtn({ onClick, label, aria }: { onClick: () => void; label: string; aria: string }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      style={{ ...zoomBtnStyle, minWidth: 28, fontSize: 16 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(100,80,160,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
    >
      {label}
    </button>
  );
}
