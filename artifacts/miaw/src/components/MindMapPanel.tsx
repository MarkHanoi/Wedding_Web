// ---------------------------------------------------------------------------
// MindMapPanel — animated curriculum mind map with zoom + pan
//
// Features:
//   • 9 module branches (F0–F8) drawn via SVG pathLength animation
//   • Central "miaw" node masks branch lines using an SVG <mask> so no
//     lines are visible behind the label (SVG painter order alone isn't
//     enough when lines cross the node boundary)
//   • Scroll-to-zoom: wheel event registered as { passive: false } so
//     preventDefault() actually suppresses page scroll
//   • Zoom toward cursor: cursor SVG coordinate is preserved across zoom
//     changes via the functional setState form (always reads latest state)
//   • Pointer-drag pan: pointer capture keeps panning smooth even when
//     the cursor leaves the SVG element
//   • Zoom buttons (+ / reset / –) for touch / keyboard accessibility
//   • Module nodes are clickable — onPointerUp tap detection (reliable
//     through pointer capture, which intercepts child click events)
//   • "≡ list" toggle button (bottom-left) calls onShowList when provided
//
// Mask geometry note:
//   The mask is defined in SVG user-space coordinates and applied to the
//   branch-lines group INSIDE the pan+zoom transform group. Because both
//   the mask content and the paths share the same coordinate space, the
//   mask hole always tracks the central node regardless of zoom/pan level.
//
// ADR-016: titlebar-only drag (no dragFromEverywhere) so the SVG area is
//   fully available for zoom/pan pointer interactions.
// ---------------------------------------------------------------------------

import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import FloatingPanel from "./FloatingPanel";

// ── Layout constants ─────────────────────────────────────────────────────────
const W = 700;
const H = 308;
const CX = 350;
const CY = 148;

// Dot positions (line endpoints)
const LEFT_X  = 80;
const RIGHT_X = 620;

// Text anchors — inward from the dot so text always stays inside the panel
const LEFT_TX  = LEFT_X  + 9;   // textAnchor="start" → text grows rightward
const RIGHT_TX = RIGHT_X - 9;   // textAnchor="end"   → text grows leftward

// Bezier S-curve tension (≈ ⅓ of the horizontal span)
const TENSION = Math.round((CX - LEFT_X) / 3);  // 90 px

// Central node dimensions — used for both the rect and the mask cutout
const NODE_RX = 54;   // half-width of the border rect
const NODE_RY = 19;   // half-height of the border rect
const NODE_CORNER = 13;

// Mask ID is a fixed string — only one MindMapPanel renders at a time
const MASK_ID = "miaw-branch-mask";

// ── Zoom constants ───────────────────────────────────────────────────────────
const MIN_ZOOM = 0.35;
const MAX_ZOOM = 4.0;
const WHEEL_FACTOR = 1.12;
const BTN_FACTOR   = 1.30;

// ── Hit-box constants ────────────────────────────────────────────────────────
// Each module node has an invisible rect for hover highlight + tap detection.
// Left nodes: text grows rightward from LEFT_TX; right nodes: leftward from RIGHT_TX.
const HIT_W = 118;
const HIT_H = 38;   // covers code label + title + subtitle rows
const HIT_PAD_LEFT  = LEFT_TX  - 6;             // start x for left nodes
const HIT_PAD_RIGHT = RIGHT_TX - HIT_W + 6;     // start x for right nodes

// ── Module data ──────────────────────────────────────────────────────────────
interface Mod {
  code: string;
  title: string;
  subtitle: string;
  side: "left" | "right";
  y: number;
  color: string;
}

const MODULES: Mod[] = [
  // Left — pastel pink / fuchsia
  { code: "F0", title: "Foundations",   subtitle: "Mindset · Tooling",      side: "left",  y: 46,  color: "#f5d0fe" },
  { code: "F1", title: "Territory",     subtitle: "AI site analysis",        side: "left",  y: 108, color: "#f0abfc" },
  { code: "F2", title: "Modeling",      subtitle: "Capture · 3DGS",          side: "left",  y: 170, color: "#e879f9" },
  { code: "F3", title: "Design",        subtitle: "Parametric · Generative", side: "left",  y: 232, color: "#d946ef" },
  // Right — pastel violet / lavender
  { code: "F4", title: "Simulation",    subtitle: "Energy · Structure",      side: "right", y: 40,  color: "#ddd6fe" },
  { code: "F5", title: "Visualization", subtitle: "Image · Video · XR",      side: "right", y: 100, color: "#c4b5fd" },
  { code: "F6", title: "Documentation", subtitle: "BIM · Reports",           side: "right", y: 162, color: "#a78bfa" },
  { code: "F7", title: "Fabrication",   subtitle: "Robotics · CNC",          side: "right", y: 226, color: "#c084fc" },
  { code: "F8", title: "Integration",   subtitle: "Adaptive ecosystem",      side: "right", y: 282, color: "#e879f9" },
];

function makePath(side: "left" | "right", nodeY: number): string {
  if (side === "left") {
    return `M ${CX} ${CY} C ${CX - TENSION} ${CY} ${LEFT_X + TENSION} ${nodeY} ${LEFT_X} ${nodeY}`;
  }
  return `M ${CX} ${CY} C ${CX + TENSION} ${CY} ${RIGHT_X - TENSION} ${nodeY} ${RIGHT_X} ${nodeY}`;
}

// ── Transform state ──────────────────────────────────────────────────────────
interface XForm {
  zoom: number;
  pan: { x: number; y: number };
}

const INITIAL_XFORM: XForm = { zoom: 1, pan: { x: 0, y: 0 } };

// ── Component ────────────────────────────────────────────────────────────────
interface Props {
  onClose: () => void;
  initialX: number;
  initialY: number;
  /** Called when the user taps a module node without dragging */
  onSelectModule?: (code: string) => void;
  /** Called when the "≡ list" button is pressed */
  onShowList?: () => void;
  /** Z-index from the shared panel z-order pool */
  zIndex?: number;
  /** Notify parent to bring this panel to front */
  onPanelPointerDown?: () => void;
  /**
   * Layout-engine overrides — when provided the panel fills the assigned slot
   * and the SVG zoom is auto-fit to the panel width on mount.
   */
  width?: number;
  height?: number;
}

export default function MindMapPanel({ onClose, initialX, initialY, onSelectModule, onShowList, zIndex = 38, onPanelPointerDown, width = W, height }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // The SVG uses width:100%/height:auto so the viewBox handles the initial
  // scaling automatically. The internal transform starts at identity (zoom=1).
  const [xform, setXform] = useState<XForm>({ zoom: 1, pan: { x: 0, y: 0 } });
  const [isDragging, setIsDragging] = useState(false);
  const pointerDown = useRef(false);
  const lastPt = useRef({ x: 0, y: 0 });
  // didMove: set true once pointer travels > 4px — used to distinguish tap from drag
  const didMove = useRef(false);
  // Mirror xform in a ref so onPointerUp can read the latest value without
  // including xform in its dependency array (which would recreate it on every pan)
  const xformRef = useRef<XForm>(INITIAL_XFORM);
  xformRef.current = xform;

  // ── Wheel zoom (non-passive so preventDefault works) ──────────────────────
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      // Convert display-pixel cursor position to SVG user-space coordinates.
      // The SVG uses width:100% so its rendered width may differ from W.
      const viewScale = W / rect.width;
      const cx = (e.clientX - rect.left) * viewScale;
      const cy = (e.clientY - rect.top)  * viewScale;
      const factor = e.deltaY < 0 ? WHEEL_FACTOR : 1 / WHEEL_FACTOR;

      setXform((prev) => {
        const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
        const svgX = (cx - prev.pan.x) / prev.zoom;
        const svgY = (cy - prev.pan.y) / prev.zoom;
        return {
          zoom: newZoom,
          pan: { x: cx - svgX * newZoom, y: cy - svgY * newZoom },
        };
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ── Pointer drag (pan) ────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    didMove.current = false;
    pointerDown.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!pointerDown.current) return;
    const dx = e.clientX - lastPt.current.x;
    const dy = e.clientY - lastPt.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) didMove.current = true;
    lastPt.current = { x: e.clientX, y: e.clientY };
    // Convert display-pixel delta to SVG user-space units.
    const viewScale = W / (svgRef.current?.getBoundingClientRect().width ?? W);
    setXform((prev) => ({
      ...prev,
      pan: { x: prev.pan.x + dx * viewScale, y: prev.pan.y + dy * viewScale },
    }));
  }, []);

  // onPointerUp: end drag; if no movement, check if tap hit a module node
  const onPointerUp = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const wasDrag = didMove.current;
    pointerDown.current = false;
    setIsDragging(false);

    if (!wasDrag && onSelectModule && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      // Convert display-pixel tap position to SVG user-space coordinates.
      const viewScale = W / rect.width;
      const clientX = (e.clientX - rect.left) * viewScale;
      const clientY = (e.clientY - rect.top)  * viewScale;
      const { zoom, pan } = xformRef.current;
      const svgX = (clientX - pan.x) / zoom;
      const svgY = (clientY - pan.y) / zoom;

      for (const mod of MODULES) {
        const hx = mod.side === "left" ? HIT_PAD_LEFT : HIT_PAD_RIGHT;
        if (svgX >= hx && svgX <= hx + HIT_W && svgY >= mod.y - 13 && svgY <= mod.y - 13 + HIT_H) {
          onSelectModule(mod.code);
          break;
        }
      }
    }
  }, [onSelectModule]);

  // ── Button zoom (toward SVG visual centre) ────────────────────────────────
  // Centre is always W/2, H/2 in SVG user-space (the viewBox defines these coords).
  const zoomTowardCenter = useCallback((factor: number) => {
    const cx = W / 2;
    const cy = H / 2;
    setXform((prev) => {
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.zoom * factor));
      const svgX = (cx - prev.pan.x) / prev.zoom;
      const svgY = (cy - prev.pan.y) / prev.zoom;
      return {
        zoom: newZoom,
        pan: { x: cx - svgX * newZoom, y: cy - svgY * newZoom },
      };
    });
  }, []);

  const handleZoomIn    = useCallback(() => zoomTowardCenter(BTN_FACTOR),       [zoomTowardCenter]);
  const handleZoomOut   = useCallback(() => zoomTowardCenter(1 / BTN_FACTOR),   [zoomTowardCenter]);
  const handleZoomReset = useCallback(() => setXform({ zoom: 1, pan: { x: 0, y: 0 } }), []);

  const { zoom, pan } = xform;

  return (
    <FloatingPanel
      title=""
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={zIndex}
      onPointerDown={onPanelPointerDown}
      className="floating-panel--mindmap"
      resizable
    >
      {/* ── Zoom controls — bottom-right ──────────────────────────────────── */}
      <div className="mindmap-zoom-controls">
        <button
          type="button"
          className="mindmap-zoom-btn"
          aria-label="Zoom out"
          onClick={handleZoomOut}
        >
          −
        </button>
        <button
          type="button"
          className="mindmap-zoom-btn mindmap-zoom-btn--reset"
          aria-label="Reset zoom"
          onClick={handleZoomReset}
          title={`${Math.round(zoom * 100)}%`}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="mindmap-zoom-btn"
          aria-label="Zoom in"
          onClick={handleZoomIn}
        >
          +
        </button>
      </div>

      {/* ── List toggle — bottom-left ──────────────────────────────────────── */}
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
        aria-label="MIAW curriculum mind map — 9 modules F0 through F8"
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
        <defs>
          {/*
            Branch-line mask:
            • White rect = fully opaque → lines are visible everywhere
            • Black rect at the central node = fully transparent → lines
              disappear behind the node area
            Defined in SVG user-space coords; because this mask is applied
            inside the pan+zoom <g>, both mask and paths share the same
            coordinate space and the cutout tracks the node at every zoom level.
          */}
          <mask id={MASK_ID} maskUnits="userSpaceOnUse">
            <rect x={0} y={0} width={W} height={H} fill="white" />
            <rect
              x={CX - NODE_RX - 4}
              y={CY - NODE_RY - 3}
              width={(NODE_RX + 4) * 2}
              height={(NODE_RY + 3) * 2}
              rx={NODE_CORNER + 2}
              fill="black"
            />
          </mask>
        </defs>

        {/* ── Pan + zoom transform group ──────────────────────────────────── */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>

          {/* ── Branch lines & dots (masked to exclude node area) ─────────── */}
          <g mask={`url(#${MASK_ID})`}>
            {MODULES.map((mod, i) => {
              const lineDelay = 0.18 + i * 0.40;
              const dotDelay  = lineDelay + 0.58;
              const isLeft    = mod.side === "left";
              const dotX      = isLeft ? LEFT_X : RIGHT_X;

              return (
                <g key={`line-${mod.code}`}>
                  <motion.path
                    d={makePath(mod.side, mod.y)}
                    fill="none"
                    stroke={mod.color}
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.60, delay: lineDelay, ease: "easeInOut" }}
                  />
                  <motion.circle
                    cx={dotX}
                    cy={mod.y}
                    fill={mod.color}
                    initial={{ r: 0, opacity: 0 }}
                    animate={{ r: 3, opacity: 1 }}
                    transition={{ duration: 0.22, delay: dotDelay }}
                  />
                </g>
              );
            })}
          </g>

          {/* ── Labels + hit areas (not masked — always fully visible) ───── */}
          {MODULES.map((mod, i) => {
            const lineDelay  = 0.18 + i * 0.40;
            const labelDelay = lineDelay + 0.42;
            const isLeft     = mod.side === "left";
            const textX      = isLeft ? LEFT_TX  : RIGHT_TX;
            const anchor     = isLeft ? "start"  : "end";
            const hitX       = isLeft ? HIT_PAD_LEFT : HIT_PAD_RIGHT;

            return (
              <motion.g
                key={`label-${mod.code}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.32, delay: labelDelay }}
              >
                {/* Invisible hit area — pointer events, hover highlight, tap detection */}
                {onSelectModule && (
                  <rect
                    x={hitX}
                    y={mod.y - 13}
                    width={HIT_W}
                    height={HIT_H}
                    rx={5}
                    className="mindmap-hit"
                    style={{ cursor: "pointer" }}
                  />
                )}

                <text
                  x={textX} y={mod.y - 7}
                  textAnchor={anchor}
                  fontSize={9} fontWeight={700}
                  fontFamily="'Inter', sans-serif"
                  letterSpacing={0.6}
                  fill={mod.color}
                  style={{ pointerEvents: "none" }}
                >
                  {mod.code}
                </text>
                <text
                  x={textX} y={mod.y + 6}
                  textAnchor={anchor}
                  fontSize={11} fontWeight={400}
                  fontFamily="'Inter', sans-serif"
                  fill="rgba(255,255,255,0.92)"
                  style={{ pointerEvents: "none" }}
                >
                  {mod.title}
                </text>
                <text
                  x={textX} y={mod.y + 19}
                  textAnchor={anchor}
                  fontSize={8.5} fontWeight={300}
                  fontFamily="'Inter', sans-serif"
                  fill="rgba(255,255,255,0.44)"
                  style={{ pointerEvents: "none" }}
                >
                  {mod.subtitle}
                </text>
              </motion.g>
            );
          })}

          {/* ── Central MIAW node ─────────────────────────────────────────── */}
          {/* SVG translate group puts the local origin at (CX, CY) so Framer's
              scale transform pivots around the node centre — no CSS
              transform-origin ambiguity in SVG coordinates.               */}
          <g transform={`translate(${CX}, ${CY})`}>
            <motion.g
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Outer glow */}
              <ellipse cx={0} cy={0} rx={62} ry={26} fill="rgba(167,139,250,0.09)" />

              {/* Solid fill that sits on top of masked lines — this is what
                  actually hides line remnants at the mask boundary.
                  Uses the same glass background as the panel so it blends.
                  Alpha is deliberately higher than the panel bg to fully
                  cover any sub-pixel aliasing at the mask edge.            */}
              <rect
                x={-NODE_RX} y={-NODE_RY}
                width={NODE_RX * 2} height={NODE_RY * 2}
                rx={NODE_CORNER}
                fill="rgba(160, 140, 220, 0.28)"
              />

              {/* Visible border */}
              <rect
                x={-NODE_RX} y={-NODE_RY}
                width={NODE_RX * 2} height={NODE_RY * 2}
                rx={NODE_CORNER}
                fill="rgba(255,255,255,0.045)"
                stroke="rgba(196,181,253,0.55)"
                strokeWidth={1.4}
              />

              {/* "miaw" label */}
              <text
                x={0} y={6}
                textAnchor="middle"
                fontSize={12.5} fontWeight={400}
                fontFamily="'DePixelBreit', monospace"
                letterSpacing={1}
                fill="rgba(255,255,255,0.95)"
              >
                miaw
              </text>
            </motion.g>
          </g>

        </g>{/* end pan+zoom transform */}
      </svg>
    </FloatingPanel>
  );
}
