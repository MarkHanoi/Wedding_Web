// ---------------------------------------------------------------------------
// GuestPanel — floating panel listing guest lecturers (ADR-018)
//
// Architecture mirrors FacultyPanel exactly:
//   • GUESTS array is the single source of truth for guest data.
//   • PhotoPlaceholder renders either a real photo (grayscale) or an
//     initials-based geometric placeholder — same logic as FacultyPanel.
//   • 3-column grid; hover scales + brightens each card.
//   • Clicking a card calls onSelectGuest(slug) → GuestDetailPanel opens.
//   • z=32 keeps the panel below Faculty (z=35) and above image panels (z=15–17).
//
// To add a guest: append an entry to GUESTS below. No other changes needed.
// To update bios: edit GuestDetailPanel.tsx.
// ---------------------------------------------------------------------------

import { useState } from "react";
import FloatingPanel from "./FloatingPanel";
import ZoomableBody from "./ZoomableBody";
import { GUESTS } from "../data/guests";
import type { GuestMember } from "../data/guests";

// Same fit-zoom logic as FacultyPanel — see that file for full comments.
function computeGridFitZoom(panelW: number, panelH: number, count: number): number {
  const PADDING_X  = 32;
  const GAP        = 12;
  const COLS       = 3;
  const cardW      = (panelW - PADDING_X - GAP * (COLS - 1)) / COLS;
  const cardPhotoH = cardW * (4 / 3);
  const cardTotalH = cardPhotoH + 8 + 14 + 12;
  const rows       = Math.ceil(count / COLS);
  const gridH      = rows * cardTotalH + GAP * (rows - 1);
  const OVERHEAD   = 24 + 30;
  const TITLE_BAR  = 44;
  const contentH   = OVERHEAD + gridH;
  const availH     = panelH - TITLE_BAR;
  return Math.max(0.3, Math.min(1.0, availH / contentH));
}

interface GuestPanelProps {
  onClose: () => void;
  onSelectGuest: (slug: string) => void;
  initialX: number;
  initialY: number;
  /** Layout-engine overrides — when provided the panel fills the assigned slot */
  width?: number | string;
  height?: number | string;
}

function PhotoPlaceholder({ member }: { member: GuestMember }) {
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
            <filter id={`grain-g-${member.slug}`}>
              <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter={`url(#grain-g-${member.slug})`} />
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

      {/* Bottom gradient fade — always shown to blend into card bg */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)",
        }}
      />
    </div>
  );
}

export default function GuestPanel({ onClose, onSelectGuest, initialX, initialY, width = 460, height }: GuestPanelProps) {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  const initialZoom =
    typeof width === "number" && typeof height === "number"
      ? computeGridFitZoom(width, height, GUESTS.length)
      : 1;

  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Guest Lectures
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={32}
      resizable
      className="floating-panel--guests"
    >
      <ZoomableBody initialZoom={initialZoom}>
        <div className="px-4 py-3">
          <p
            className="text-white/35 text-xs mb-4 tracking-wide"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            leading voices in AI, architecture and the built environment — click to read
          </p>

          <div className="grid grid-cols-3 gap-3">
            {GUESTS.map((member) => {
              const isHovered = hoveredSlug === member.slug;
              return (
                <button
                  key={member.slug}
                  type="button"
                  onClick={() => onSelectGuest(member.slug)}
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
                      {member.affiliation}
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
