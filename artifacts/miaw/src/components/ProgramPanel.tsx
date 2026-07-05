import FloatingPanel from "./FloatingPanel";

interface Module {
  code: string;
  title: string;
  tagline: string;
  color: string;
}

const MODULES: Module[] = [
  { code: "F0", title: "Foundations",      tagline: "Mindset · Environment · AI Workflows",              color: "#f5d0fe" },
  { code: "F1", title: "Territory",        tagline: "AI-driven territorial strategies",                  color: "#f0abfc" },
  { code: "F2", title: "Modeling",         tagline: "Capturing and Modeling with AI",                    color: "#e879f9" },
  { code: "F3", title: "Design",           tagline: "AI-assisted Parametric Design",                     color: "#d946ef" },
  { code: "F4", title: "Simulation",       tagline: "Energy · Structure · Daylight · Acoustics",         color: "#ddd6fe" },
  { code: "F5", title: "Visualization",    tagline: "Image · Video · Immersive Environments",            color: "#c4b5fd" },
  { code: "F6", title: "Documentation",    tagline: "BIM · Reports · Information Management",            color: "#a78bfa" },
  { code: "F7", title: "Fabrication",      tagline: "Robotics · CNC · Complex Assemblies",              color: "#c084fc" },
  { code: "F8", title: "Integration",      tagline: "Your Own Adaptive AI Ecosystem",                    color: "#e879f9" },
];

interface ProgramPanelProps {
  onClose: () => void;
  onSelectModule: (code: string) => void;
  initialX: number;
  initialY: number;
  /** Called when the "⬡ map" button is pressed */
  onShowMap?: () => void;
  /** Layout-engine overrides — when provided the panel fills the assigned slot */
  width?: number | string;
  height?: number | string;
}

export default function ProgramPanel({ onClose, onSelectModule, initialX, initialY, onShowMap, width = 320, height }: ProgramPanelProps) {
  return (
    <FloatingPanel
      title={
        <span
          className="text-white/80 text-xs tracking-widest uppercase"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
        >
          Program Structure
        </span>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={width}
      height={height}
      zIndex={35}
      resizable
      className="floating-panel--program"
    >
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center justify-between mb-3">
          <p
            className="text-white/35 text-xs tracking-wide"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            18 weeks · 9 modules · select one to explore
          </p>
          {onShowMap && (
            <button
              type="button"
              onClick={onShowMap}
              className="text-white/35 hover:text-white/65 transition-colors cursor-pointer border-none bg-transparent shrink-0 ml-2"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "10px", letterSpacing: "0.04em" }}
              title="Switch to map view"
            >
              ⬡ map
            </button>
          )}
        </div>
        {MODULES.map((mod) => (
          <button
            key={mod.code}
            type="button"
            onClick={() => onSelectModule(mod.code)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition-colors group"
          >
            <span
              className="text-xs font-bold shrink-0 w-7"
              style={{ color: mod.color, fontFamily: "Inter, sans-serif" }}
            >
              {mod.code}
            </span>
            <div className="min-w-0">
              <p
                className="text-white/90 text-sm group-hover:text-white transition-colors"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
              >
                {mod.title}
              </p>
              <p
                className="text-white/35 text-xs truncate"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
              >
                {mod.tagline}
              </p>
            </div>
            <span className="text-white/20 group-hover:text-white/50 text-xs ml-auto shrink-0 transition-colors">→</span>
          </button>
        ))}
      </div>
    </FloatingPanel>
  );
}

export { MODULES };
export type { Module };
