import { useState } from "react";
import FloatingPanel from "./FloatingPanel";
import ZoomableBody from "./ZoomableBody";
import { FACULTY } from "../data/faculty";
import type { FacultyMember } from "../data/faculty";

// ---------------------------------------------------------------------------
// Compute an initial zoom so all grid cards are visible at once inside the
// panel. Called when both width and height are known numbers (from the layout
// engine). Falls back to 1 when the panel has no fixed height (free-scroll).
// ---------------------------------------------------------------------------
function computeGridFitZoom(panelW: number, panelH: number, count: number): number {
  const PADDING_X  = 32;  // px-4 * 2 sides
  const GAP        = 12;  // gap-3
  const COLS       = 3;
  const cardW      = (panelW - PADDING_X - GAP * (COLS - 1)) / COLS;
  const cardPhotoH = cardW * (4 / 3);           // aspect-[3/4]
  const cardTotalH = cardPhotoH + 8 + 14 + 12;  // gap-2 + name text + role text
  const rows       = Math.ceil(count / COLS);
  const gridH      = rows * cardTotalH + GAP * (rows - 1);
  const OVERHEAD   = 24 + 30;   // py-3 (top+bottom) + description + mb-4
  const TITLE_BAR  = 44;
  const contentH   = OVERHEAD + gridH;
  const availH     = panelH - TITLE_BAR;
  return Math.max(0.3, Math.min(1.0, availH / contentH));
}

interface FacultyPanelProps {
  onClose: () => void;
  onSelectPerson: (slug: string) => void;
  initialX: number;
  initialY: number;
  /** Layout-engine overrides — when provided the panel fills the assigned slot */
  width?: number | string;
  height?: number | string;
}

function PhotoPlaceholder({ member }: { member: FacultyMember }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg w-full aspect-[3/4]"
      style={{
        background: `linear-gradient(160deg, ${member.gradientFrom} 0%, ${member.gradientTo} 100%)`,
      }}
    >
      {member.photo ? (
        <img
          src={member.photo}
          alt={member.name}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "grayscale(100%) contrast(1.05)" }}
        />
      ) : (
        <>
          <svg
            className="absolute inset-0 w-full h-full opacity-5"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id={`grain-${member.slug}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-${member.slug})`} />
          </svg>

          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            viewBox="0 0 120 160"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="55" r="28" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="60" cy="55" r="18" fill="none" stroke="white" strokeWidth="0.3" />
            <rect x="30" y="90" width="60" height="60" rx="2" fill="none" stroke="white" strokeWidth="0.4" />
            <line x1="60" y1="83" x2="60" y2="90" stroke="white" strokeWidth="0.4" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-white/25 select-none"
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 200,
                fontSize: "2rem",
                letterSpacing: "0.15em",
              }}
            >
              {member.initials}
            </span>
          </div>
        </>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default function FacultyPanel({ onClose, onSelectPerson, initialX, initialY, width = 460, height }: FacultyPanelProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const initialZoom =
    typeof width === "number" && typeof height === "number"
      ? computeGridFitZoom(width, height, FACULTY.length)
      : 1;

  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Who We Are
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={35}
      resizable
      className="floating-panel--faculty"
    >
      <ZoomableBody initialZoom={initialZoom}>
        <div className="px-4 py-3">
          <p
            className="text-white/35 text-xs mb-4 tracking-wide"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            practitioners, not just academics — hover to explore, click to read
          </p>

          <div className="grid grid-cols-3 gap-3">
            {FACULTY.map((member) => {
              const isHovered = hoveredSlug === member.slug;
              return (
                <button
                  key={member.slug}
                  type="button"
                  onClick={() => onSelectPerson(member.slug)}
                  onMouseEnter={() => setHoveredSlug(member.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className="text-left flex flex-col gap-2 group focus:outline-none"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <div
                    style={{
                      transition: "transform 0.2s ease, filter 0.2s ease",
                      transform: isHovered ? "scale(1.03)" : "scale(1)",
                      filter: isHovered ? "brightness(1.15)" : "brightness(1)",
                    }}
                  >
                    <PhotoPlaceholder member={member} />
                  </div>

                  <div>
                    <p
                      className="text-white/85 text-xs leading-tight transition-colors"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: isHovered ? 400 : 300,
                      }}
                    >
                      {member.name}
                    </p>
                    <p
                      className="text-white/35 mt-0.5"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 300,
                        fontSize: "10px",
                        lineHeight: 1.4,
                      }}
                    >
                      {member.modules}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </ZoomableBody>
    </FloatingPanel>
  );
}
