import FloatingPanel from "./FloatingPanel";
import { FACULTY } from "../data/faculty";

const FACULTY_DETAILS: Record<string, {
  bio: string[];
  research: string[];
  affiliation: string;
}> = {
  "jose-maria-lapuerta": {
    bio: [
      "José María Lapuerta is the Program Director of MIAW. With a distinguished career spanning architectural practice, academic leadership, and research, he brings the vision and rigour that defines the programme's unique position at the intersection of AI and the built environment.",
      "His work bridges the theoretical and the applied — from foundational questions about how artificial intelligence reshapes spatial thinking to hands-on integration of AI tools within professional AEC workflows.",
      "At MIAW he leads Modules F0, F2, and F8, covering AI foundations and working environments, world modelling with neural rendering, and the integration of AI capabilities into adaptive professional ecosystems.",
    ],
    research: [
      "Architectural theory and AI integration in design practice",
      "Spatial intelligence and the future of the built environment",
      "Pedagogy for technical professionals in the age of AI",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "manuel-monteserin": {
    bio: [
      "Manuel Montserín leads the territory, simulation, and fabrication modules at MIAW. His practice focuses on embedding AI-driven analysis pipelines — from territorial data processing to parametric structural optimisation — into real AEC workflows.",
      "With deep expertise in computational design and digital fabrication, he has led projects that connect satellite intelligence, building simulation, and robotic construction within integrated design processes.",
      "At MIAW he is responsible for Modules F1, F4, and F7 — covering AI-driven territorial strategies, building simulation pipelines, and robotic fabrication integrated with digital twins.",
    ],
    research: [
      "AI site analysis and territorial intelligence pipelines",
      "Building simulation with ML-assisted interpretation",
      "Robotic fabrication and digital twins in AEC",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "javier-guerrero": {
    bio: [
      "Javier Guerrero leads the generative design, communication, and documentation modules at MIAW. His research explores how large language models function as active collaborators in the design process — moving beyond autocomplete towards structured reasoning partners.",
      "His practice spans generative design tools, AI-augmented communication workflows, and the automation of design documentation, with a focus on practical deployment in professional contexts.",
      "At MIAW he leads Modules F3, F5, and F6 — covering generative design with LLMs, AI-augmented communication workflows, and automated design documentation.",
    ],
    research: [
      "LLMs as active design collaborators",
      "AI-augmented communication in AEC practice",
      "Automated specification and documentation generation",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "antia": {
    bio: [
      "Antia specialises in world modelling and generative AI applications within the built environment. Her work sits at the frontier of neural scene representations — exploring how Gaussian Splatting, NeRF, and related techniques can be integrated into early-stage architectural design.",
      "She brings a rigorous technical perspective to questions of spatial understanding, combining research in neural rendering with a strong grounding in architectural and urban practice.",
      "At MIAW she contributes to Modules F2 and F3 — covering world modelling with neural rendering and generative design workflows.",
    ],
    research: [
      "Gaussian Splatting and neural rendering for design",
      "Spatial AI and scene understanding",
      "Generative AI applications in the built environment",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "john-porral": {
    bio: [
      "John Porral leads simulation and robotic fabrication at MIAW. His expertise covers the full pipeline from building performance simulation to the integration of digital fabrication technologies within computationally driven design processes.",
      "He has extensive experience connecting simulation outputs with design decision-making, and in deploying robotic fabrication workflows within both academic and professional AEC contexts.",
      "At MIAW he contributes to Modules F4 and F7 — building simulation pipelines and robotic fabrication integrated with digital twins.",
    ],
    research: [
      "Building simulation and ML-assisted performance optimisation",
      "Robotic fabrication in AEC workflows",
      "Digital twins and fabrication feedback loops",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "manuel-montoro": {
    bio: [
      "Manuel Montoro brings together territorial AI and advanced communication workflows at MIAW. His work focuses on how AI-driven data pipelines can transform the way designers analyse, understand, and communicate about territory and context.",
      "With a background in computational design and data science applied to the built environment, he develops tools and methodologies that make territorial intelligence accessible within standard architectural practice.",
      "At MIAW he contributes to Modules F1 and F5 — AI-driven territorial strategies and AI-augmented communication workflows.",
    ],
    research: [
      "Territorial intelligence and AI-driven site analysis",
      "Data pipelines for architectural communication",
      "Computational approaches to urban and landscape analysis",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "sergio-del-castillo": {
    bio: [
      "Sergio del Castillo Tello specialises in AI-augmented documentation and adaptive professional ecosystems. His research investigates how AI tools can be embedded not just in individual workflows, but in the broader organisational and knowledge systems of AEC practices.",
      "His work spans automated documentation, specification generation, and the design of professional environments that evolve alongside the capabilities of AI — ensuring practitioners remain agile as the field develops.",
      "At MIAW he contributes to Modules F6 and F8 — automated design documentation and the integration of AI capabilities into adaptive professional ecosystems.",
    ],
    research: [
      "AI-augmented documentation and specification",
      "Adaptive professional ecosystems in AEC",
      "Knowledge management and AI workflow integration",
    ],
    affiliation: "Affiliation to be confirmed",
  },
  "antonio-canero": {
    bio: [
      "Antonio Canero is a computational designer and architect working at the intersection of AI-driven workflows and parametric design practice. His work focuses on embedding intelligent tools directly into the design process — from early concept generation to construction documentation.",
      "With hands-on experience across computational design platforms and emerging AI integration frameworks, he develops practical methodologies that allow architects and engineers to move fluidly between generative exploration and technical precision.",
      "At MIAW he contributes to Modules F3 and F4 — covering generative design workflows and building simulation pipelines integrated with AI-assisted performance analysis.",
    ],
    research: [
      "AI integration in computational design practice",
      "Parametric tools and generative design workflows",
      "Building simulation and AI-assisted performance optimisation",
    ],
    affiliation: "Affiliation to be confirmed",
  },
};

interface PersonDetailPanelProps {
  slug: string;
  onClose: () => void;
  initialX: number;
  initialY: number;
}

export default function PersonDetailPanel({ slug, onClose, initialX, initialY }: PersonDetailPanelProps) {
  const member = FACULTY.find((f) => f.slug === slug);
  const details = FACULTY_DETAILS[slug];
  if (!member || !details) return null;

  return (
    <FloatingPanel
      title={
        <div className="flex flex-col gap-0.5">
          <span
            className="text-white/85 text-xs"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            {member.name}
          </span>
          <span
            className="text-white/35"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "10px" }}
          >
            {member.modules}
          </span>
        </div>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={380}
      height={430}
      zIndex={37}
      resizable
      className="floating-panel--person-detail"
    >
      <div className="px-5 py-4 flex flex-col gap-5 h-full overflow-y-auto">
        <p
          className="text-white/45 text-xs tracking-wide"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
        >
          {member.role}
        </p>

        <div className="flex flex-col gap-3">
          {details.bio.map((paragraph, i) => (
            <p
              key={i}
              className="text-white/72 text-sm leading-relaxed"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="border-t border-white/10 pt-4">
          <p
            className="text-white/35 text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Research Focus
          </p>
          <div className="flex flex-col gap-1.5">
            {details.research.map((item, i) => (
              <p
                key={i}
                className="text-white/55 text-xs leading-relaxed"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
              >
                — {item}
              </p>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {member.expertise.split(" · ").map((tag) => (
            <span
              key={tag}
              className="text-white/35 border border-white/10 rounded-full px-2.5 py-0.5"
              style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "10px" }}
            >
              {tag}
            </span>
          ))}
        </div>

        <p
          className="text-white/20 text-xs"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 300, fontSize: "10px" }}
        >
          {details.affiliation}
        </p>
      </div>
    </FloatingPanel>
  );
}
