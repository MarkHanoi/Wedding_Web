// ---------------------------------------------------------------------------
// InstitutionDetailPanel — detail view for a single institution (ADR-019)
//
// Architecture mirrors ModuleDetailPanel exactly:
//   • INSTITUTION_DETAILS keyed by institution id.
//   • z=31 — above InstitutionsPanel (z=29), below all people panels (z=32+).
// ---------------------------------------------------------------------------

import FloatingPanel from "./FloatingPanel";
import { INSTITUTIONS } from "../data/institutions";

const INSTITUTION_DETAILS: Record<string, {
  description: string;
  relationship: string;
  links: string[];
}> = {
  upm: {
    description: `MIAW is validated as a Título Propio of the Universidad Politécnica de Madrid — one of the leading technical universities in Spain and Europe, consistently ranked among the top institutions in engineering and architecture.

The Título Propio framework allows UPM to award an official postgraduate qualification for programmes of applied specialisation that sit outside the standard Máster Universitario structure. MIAW awards 36 ECTS credits, placing it in the upper band of the Título Propio Experto / Máster Propio category.

This credential is recognised across the Spanish higher education system and carries the institutional weight of UPM's 50-year track record in technical and architectural education.`,
    relationship: "Certifying institution — the MIAW diploma is issued under UPM's academic authority.",
    links: [
      "Título Propio — 36 ECTS",
      "Upper postgraduate category",
      "Spanish higher education framework (RD 822/2021 compatible)",
    ],
  },
  etsam: {
    description: `The Escuela Técnica Superior de Arquitectura de Madrid (ETSAM) is the architecture school of UPM and one of the most prestigious in the Spanish-speaking world. Founded in 1844, it has produced generations of architects who have shaped the built environment of Spain and Latin America.

ETSAM provides the primary academic infrastructure for MIAW — staff, facilities, and the institutional framework within which the programme operates. The school's location in the Ciudad Universitaria campus in Madrid gives MIAW access to one of the most active architectural academic environments in Southern Europe.

Several MIAW faculty members hold positions at ETSAM, reinforcing the connection between the programme's contemporary AI focus and the school's strong architectural tradition.`,
    relationship: "Host institution — provides academic infrastructure, staff, and facilities.",
    links: [
      "Founded 1844 — one of Spain's oldest architecture schools",
      "Ciudad Universitaria, Madrid",
      "Several MIAW faculty are ETSAM staff",
    ],
  },
  "mit-senseable": {
    description: `The MIT Senseable City Laboratory, directed by Carlo Ratti, is one of the world's leading research groups at the intersection of digital technology, data, and the built environment. Based at MIT's Department of Urban Studies and Planning, the lab investigates how networked sensors, real-time data streams, and AI can reshape how cities function.

Its research spans scales from individual buildings to metropolitan regions, consistently asking how intelligence embedded in urban infrastructure can improve the experience of city life — from energy efficiency to mobility, public health, and social equity.

The lab's connection to MIAW is through Carlo Ratti's guest lecture programme, which brings this perspective on AI at urban scale directly into the curriculum.`,
    relationship: "Guest faculty — Carlo Ratti, Director of MIT Senseable City Lab.",
    links: [
      "Directed by Carlo Ratti since 2004",
      "MIT Department of Urban Studies and Planning",
      "Research active across 6 continents",
    ],
  },
  "mit-sap": {
    description: `The MIT School of Architecture and Planning (SA+P) is one of the premier design and planning schools in the world, bringing together architecture, urban planning, media arts, and building technology under a single institutional framework committed to rigour, innovation, and social impact.

Within SA+P, the Department of Architecture has been at the forefront of computational and AI-driven design research. It is home to Mariana Ibáñez, who leads research into machine learning as a medium for architectural form-finding — exploring how AI tools expand the design space available to architects without displacing the architect's judgement.

MIT SA+P's connection to MIAW reflects a shared commitment to preparing the next generation of practitioners for a design culture in which AI is not an add-on but a foundational layer.`,
    relationship: "Guest faculty — Mariana Ibáñez, Associate Professor at MIT SA+P.",
    links: [
      "MIT Department of Architecture",
      "Ranked globally as a top-5 architecture school",
      "Strong AI + computational design research agenda",
    ],
  },
  "mit-media": {
    description: `The MIT Media Lab is one of the world's most unconventional and influential research institutions — a place where the boundaries between art, science, design, and technology dissolve entirely. Founded in 1985 by Nicholas Negroponte and Muriel Cooper, the Lab has consistently produced research that predicts and shapes the culture of technology.

The field of Material Ecology — developed at the Lab by Neri Oxman — positioned biological systems, AI, and digital fabrication as a unified design framework. This work explored how buildings and objects could be grown rather than made, designed for biological cycles rather than industrial ones, and co-authored with artificial intelligence rather than produced by human intuition alone.

Oxman's work remains a touchstone for MIAW's inquiry into what AI in architecture means at its deepest level — not as a productivity tool, but as a fundamental rethinking of the relationship between design, material, and life.`,
    relationship: "Guest faculty — Neri Oxman, former director of the Mediated Matter Group at MIT Media Lab.",
    links: [
      "Founded 1985 — pioneered wearable computing, tangible UI, and more",
      "Mediated Matter Group — Material Ecology research",
      "Connection via Neri Oxman's guest contribution",
    ],
  },
  "ucl-bartlett": {
    description: `The Bartlett School of Architecture at University College London is consistently ranked among the top architecture schools in the world, known for its culture of theoretical rigour, experimental practice, and intellectual ambition. It is home to some of the most important architectural thinkers of the past 30 years.

Mario Carpo holds the Reyner Banham Professorship of Architectural History and Theory at the Bartlett — one of the most prestigious chairs in architectural scholarship. His work on notation, authorship, the first and second digital turns, and most recently AI in design practice provides the theoretical framework within which MIAW situates its technical curriculum.

The Bartlett's connection to MIAW is both intellectual and institutional: Carpo's framework shapes how the programme understands the significance of what it is teaching.`,
    relationship: "Guest faculty — Mario Carpo, Reyner Banham Professor at UCL Bartlett.",
    links: [
      "Reyner Banham Chair — Architectural History and Theory",
      "Consistently top-5 global architecture school ranking",
      "Home to significant computational architecture research",
    ],
  },
  "umich-tcaup": {
    description: `The Taubman College of Architecture and Urban Planning (TCAUP) at the University of Michigan is one of the premier architecture schools in the United States, known for its strong integration of research and practice, its commitment to technological innovation, and its rigorous design culture.

Two MIAW guest faculty — Matías del Campo and Sandra Manninger — are Associate Professors at TCAUP, where they lead research into the application of machine learning, generative AI, and robotic fabrication to architectural design. Their practice, SPAN Architecture (Vienna and New York), produces built and speculative work that consistently pushes the boundary between AI capability and architectural ambition.

TCAUP's presence in the MIAW guest programme brings a specifically American and practice-embedded perspective on AI in architecture — balancing research rigour with the demands of professional production.`,
    relationship: "Guest faculty — Matías del Campo and Sandra Manninger, both Associate Professors at TCAUP.",
    links: [
      "Top-ranked US architecture school",
      "Strong computational design and fabrication programme",
      "SPAN Architecture — the practice base of both guest faculty",
    ],
  },
};

interface InstitutionDetailPanelProps {
  institutionId: string;
  onClose: () => void;
  initialX: number;
  initialY: number;
}

export default function InstitutionDetailPanel({
  institutionId,
  onClose,
  initialX,
  initialY,
}: InstitutionDetailPanelProps) {
  const inst = INSTITUTIONS.find((i) => i.id === institutionId);
  const details = INSTITUTION_DETAILS[institutionId];
  if (!inst || !details) return null;

  return (
    <FloatingPanel
      title={
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold"
            style={{ color: inst.color, fontFamily: "Inter, sans-serif" }}
          >
            {inst.shortName}
          </span>
          <span
            className="text-white/80 text-xs truncate"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            {inst.name}
          </span>
        </div>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={390}
      height={440}
      zIndex={31}
      resizable
      className="floating-panel--institution-detail"
    >
      <div className="px-5 py-4 flex flex-col gap-4 h-full overflow-y-auto">
        <p
          className="text-xs tracking-wide"
          style={{ color: inst.color, fontFamily: "Inter, sans-serif", fontWeight: 300 }}
        >
          {inst.tagline}
        </p>

        <div
          className="text-white/75 text-sm leading-relaxed whitespace-pre-line"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
        >
          {details.description}
        </div>

        <div className="border-t border-white/10 pt-4">
          <p
            className="text-white/35 text-xs uppercase tracking-widest mb-2"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Relationship to MIAW
          </p>
          <p
            className="text-white/60 text-xs leading-relaxed mb-3"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
          >
            {details.relationship}
          </p>
          <div className="flex flex-col gap-1">
            {details.links.map((item, i) => (
              <p
                key={i}
                className="text-white/40 text-xs"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
              >
                — {item}
              </p>
            ))}
          </div>
        </div>
      </div>
    </FloatingPanel>
  );
}
