// ---------------------------------------------------------------------------
// InstitutionsPanel — floating panel listing partner and affiliated institutions
// (ADR-019)
//
// Architecture mirrors ProgramPanel exactly:
//   • INSTITUTIONS array is the single source of truth.
//   • List layout with colour accent per institution (same pattern as Module list).
//   • Clicking an institution calls onSelectInstitution(id) → InstitutionDetailPanel.
//   • Data sourced from: MIAW-timeline.svg (UPM titulo propio), faculty affiliations,
//     and guest lecturer institutions.
// ---------------------------------------------------------------------------

import FloatingPanel from "./FloatingPanel";
import { INSTITUTIONS } from "../data/institutions";
import type { Institution } from "../data/institutions";

const ROLE_LABEL: Record<string, string> = {
  degree: "Degree",
  host: "Host",
  guest: "Guest Faculty",
};

interface InstitutionsPanelProps {
  onClose: () => void;
  onSelectInstitution: (id: string) => void;
  initialX: number;
  initialY: number;
  /** Called when the "⬡ map" button is pressed — switches to network map view */
  onShowMap?: () => void;
  /** Layout-engine overrides — when provided the panel fills the assigned slot */
  width?: number | string;
  height?: number | string;
}

export default function InstitutionsPanel({
  onClose,
  onSelectInstitution,
  initialX,
  initialY,
  onShowMap,
  width = 340,
  height,
}: InstitutionsPanelProps) {
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
      zIndex={29}
      resizable
      className="floating-panel--institutions"
    >
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-white/35 text-xs tracking-wide"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            partner and affiliated institutions · select one to explore
          </p>
          {onShowMap && (
            <button
              type="button"
              onClick={onShowMap}
              className="text-white/35 hover:text-white/65 transition-colors cursor-pointer border-none bg-transparent shrink-0 ml-2"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "10px", letterSpacing: "0.04em" }}
              title="Switch to network map view"
            >
              ⬡ map
            </button>
          )}
        </div>

        {INSTITUTIONS.map((inst) => (
          <button
            key={inst.id}
            type="button"
            onClick={() => onSelectInstitution(inst.id)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
          >
            <span
              className="text-xs font-bold shrink-0 w-16 truncate"
              style={{ color: inst.color, fontFamily: "Inter, sans-serif" }}
            >
              {inst.shortName}
            </span>
            <div className="min-w-0">
              <p
                className="text-white/90 text-sm group-hover:text-white transition-colors truncate"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
              >
                {inst.name}
              </p>
              <p
                className="text-white/35 text-xs truncate"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
              >
                {inst.tagline}
              </p>
            </div>
            <span
              className="text-white/20 group-hover:text-white/50 text-xs ml-auto shrink-0 transition-colors"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              →
            </span>
          </button>
        ))}
      </div>
    </FloatingPanel>
  );
}

export type { Institution as InstitutionItem };
