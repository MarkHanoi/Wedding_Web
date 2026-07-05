// ---------------------------------------------------------------------------
// InstitutionsMapPanel — grid of independent institution cards with zoom + pan
//
// Layout: 3-column grid, 3 cards × row 1, 3 cards × row 2, 1 card centered.
// Each card is a standalone glass square — no central hub, no connecting lines.
//   • Scroll-to-zoom (non-passive wheel listener)
//   • Zoom toward cursor via functional setState
//   • Pointer-drag pan with pointer capture
//   • Zoom buttons (+ / reset / –)
//   • "≡ list" toggle button (bottom-left)
//   • Tap on a card calls onSelectInstitution
//
// ADR-016: title-bar-only drag — SVG area is fully available for zoom/pan.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import FloatingPanel from "./FloatingPanel";

// ── Layout constants ──────────────────────────────────────────────────────────
const W  = 700;
const H  = 290;

// Card grid
const CARD_W    = 200;
const CARD_H    = 78;
const CARD_GAP  = 13;
const CARD_TOP  = 20;
const CARD_LEFT = Math.round((W - 3 * CARD_W - 2 * CARD_GAP) / 2); // ≈ 36

function getCardPos(index: number): { x: number; y: number } {
  if (index < 6) {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return {
      x: CARD_LEFT + col * (CARD_W + CARD_GAP),
      y: CARD_TOP  + row * (CARD_H  + CARD_GAP),
    };
  }
  // 7th card: centred on the third row
  return {
    x: Math.round((W - CARD_W) / 2),
    y: CARD_TOP + 2 * (CARD_H + CARD_GAP),
  };
}

// ── Zoom constants ────────────────────────────────────────────────────────────
const MIN_ZOOM     = 0.35;
const MAX_ZOOM     = 4.0;
const WHEEL_FACTOR = 1.12;
const BTN_FACTOR   = 1.30;

// ── Institution data ──────────────────────────────────────────────────────────
interface InstNode {
  id: string;
  shortName: string;
  subtitle: string;
  color: string;
}

const INSTITUTIONS: InstNode[] = [
  { id: "upm",           shortName: "UPM",         subtitle: "Certifying · 36 ECTS",     color: "#fcd34d" },
  { id: "etsam",         shortName: "ETSAM",        subtitle: "Host · Academic Infra",    color: "#6ee7b7" },
  { id: "mit-senseable", shortName: "MIT SCL",      subtitle: "Smart Cities · Urban AI",  color: "#93c5fd" },
  { id: "mit-sap",       shortName: "MIT SA+P",     subtitle: "AI + Architecture",        color: "#a5b4fc" },
  { id: "mit-media",     shortName: "MIT Media",    subtitle: "Material Ecology",         color: "#c4b5fd" },
  { id: "ucl-bartlett",  shortName: "UCL Bartlett", subtitle: "Architectural Theory",     color: "#fca5a5" },
  { id: "umich-tcaup",   shortName: "UMich TCAUP",  subtitle: "Generative AI · ML",       color: "#fdba74" },
];

// ── Transform state ───────────────────────────────────────────────────────────
interface XForm {
  zoom: number;
  pan: { x: number; y: number };
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  initialX: number;
  initialY: number;
  onSelectInstitution?: (id: string) => void;
  onShowList?: () => void;
  zIndex?: number;
  onPanelPointerDown?: () => void;
  width?: number;
  height?: number;
}

export default function InstitutionsMapPanel({
  onClose,
  initialX,
  initialY,
  onSelectInstitution,
  onShowList,
  zIndex = 29,
  onPanelPointerDown,
  width = W,
  height,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // The SVG uses width:100%/height:auto so the viewBox handles the initial
  // scaling automatically. The internal transform starts at identity (zoom=1).
  const [xform, setXform] = useState<XForm>({ zoom: 1, pan: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);
  const pointerDown = useRef(false);
  const lastPt      = useRef({ x: 0, y: 0 });
  const didMove     = useRef(false);
  const xformRef    = useRef<XForm>({ zoom: 1, pan: { x: 0, y: 0 } });
  xformRef.current  = xform;

  // ── Wheel zoom ───────────────────────────────────────────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect      = el.getBoundingClientRect();
      const viewScale = W / rect.width;
      const cx        = (e.clientX - rect.left) * viewScale;
      const cy        = (e.clientY - rect.top)  * viewScale;
      const factor    = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;
      setXform((prev) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
        const svgX    = (cx - prev.pan.x) / prev.zoom;
        const svgY    = (cy - prev.pan.y) / prev.zoom;
        return { zoom: newZoom, pan: { x: cx - svgX * newZoom, y: cy - svgY * newZoom } };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pointer drag ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    pointerDown.current = true;
    didMove.current     = false;
    lastPt.current      = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    if (!didMove.current && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      didMove.current = true;
      setIsDragging(true);
    }
    if (didMove.current) {
      lastPt.current = { x: e.clientX, y: e.clientY };
      const viewScale = W / (svgRef.current?.getBoundingClientRect().width ?? W);
      setXform((prev) => ({ ...prev, pan: { x: prev.pan.x + dx * viewScale, y: prev.pan.y + dy * viewScale } }));
    }
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointerDown.current) return;
    const wasDrag = didMove.current;
    pointerDown.current = false;
    didMove.current     = false;
    setIsDragging(false);

    if (!wasDrag && onSelectInstitution) {
      const el  = svgRef.current;
      if (!el) return;
      const rect      = el.getBoundingClientRect();
      const viewScale = W / rect.width;
      const svgX  = ((e.clientX - rect.left) * viewScale - xformRef.current.pan.x) / xformRef.current.zoom;
      const svgY  = ((e.clientY - rect.top)  * viewScale - xformRef.current.pan.y) / xformRef.current.zoom;

      for (let i = 0; i < INSTITUTIONS.length; i++) {
        const pos = getCardPos(i);
        if (svgX >= pos.x && svgX <= pos.x + CARD_W && svgY >= pos.y && svgY <= pos.y + CARD_H) {
          onSelectInstitution(INSTITUTIONS[i].id);
          break;
        }
      }
    }
  }, [onSelectInstitution]);

  // ── Zoom controls ─────────────────────────────────────────────────────────
  const zoomTowardCenter = useCallback((factor: number) => {
    setXform((prev) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
      const cx      = W / 2;
      const cy      = H / 2;
      const svgX    = (cx - prev.pan.x) / prev.zoom;
      const svgY    = (cy - prev.pan.y) / prev.zoom;
      return { zoom: newZoom, pan: { x: cx - svgX * newZoom, y: cy - svgY * newZoom } };
    });
  }, []);

  const handleZoomIn    = useCallback(() => zoomTowardCenter(BTN_FACTOR),       [zoomTowardCenter]);
  const handleZoomOut   = useCallback(() => zoomTowardCenter(1 / BTN_FACTOR),   [zoomTowardCenter]);
  const handleZoomReset = useCallback(() => setXform({ zoom: 1, pan: { x: 0, y: 0 } }), []);

  const { zoom, pan } = xform;

  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Institutions
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={zIndex}
      onPointerDown={onPanelPointerDown}
      className="floating-panel--institutions"
      resizable
    >
      {/* ── Zoom controls — bottom-right ──────────────────────────────────── */}
      <div className="mindmap-zoom-controls">
        <button type="button" className="mindmap-zoom-btn" aria-label="Zoom out"   onClick={handleZoomOut}>−</button>
        <button type="button" className="mindmap-zoom-btn mindmap-zoom-btn--reset" aria-label="Reset zoom" onClick={handleZoomReset} title={`${Math.round(zoom * 100)}%`}>
          {Math.round(zoom * 100)}%
        </button>
        <button type="button" className="mindmap-zoom-btn" aria-label="Zoom in"    onClick={handleZoomIn}>+</button>
      </div>

      {/* ── List toggle — bottom-left ─────────────────────────────────────── */}
      {onShowList && (
        <button
          type="button"
          className="mindmap-zoom-btn mindmap-list-btn"
          aria-label="Switch to list view"
          onClick={onShowList}
        >
          ≡ list
        </button>
      )}

      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="MIAW institutional network — partner and affiliated institutions"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          userSelect: "none",
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* ── Pan + zoom transform group ────────────────────────────────────── */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

          {INSTITUTIONS.map((inst, i) => {
            const pos   = getCardPos(i);
            const delay = 0.06 + i * 0.08;

            return (
              <motion.g
                key={inst.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay, ease: "easeOut" }}
              >
                {/* Card background */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={CARD_W}
                  height={CARD_H}
                  rx={10}
                  fill="rgba(255,255,255,0.13)"
                  stroke="rgba(255,255,255,0.26)"
                  strokeWidth={1}
                />

                {/* Left colour accent bar */}
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={4}
                  height={CARD_H}
                  rx={2}
                  fill={inst.color}
                  opacity={1}
                />

                {/* Invisible hit area (full card) */}
                {onSelectInstitution && (
                  <rect
                    x={pos.x}
                    y={pos.y}
                    width={CARD_W}
                    height={CARD_H}
                    rx={10}
                    className="mindmap-hit"
                    style={{ cursor: "pointer" }}
                  />
                )}

                {/* Institution name */}
                <text
                  x={pos.x + 16}
                  y={pos.y + 28}
                  fontSize={11}
                  fontWeight={700}
                  fontFamily="'Inter', sans-serif"
                  letterSpacing={0.4}
                  fill={inst.color}
                  style={{ pointerEvents: "none" }}
                >
                  {inst.shortName}
                </text>

                {/* Subtitle */}
                <text
                  x={pos.x + 16}
                  y={pos.y + 46}
                  fontSize={8.5}
                  fontWeight={300}
                  fontFamily="'Inter', sans-serif"
                  fill="rgba(255,255,255,0.72)"
                  style={{ pointerEvents: "none" }}
                >
                  {inst.subtitle}
                </text>
              </motion.g>
            );
          })}

        </g>
      </svg>
    </FloatingPanel>
  );
}
