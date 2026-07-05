// ---------------------------------------------------------------------------
// GuestDetailPanel — bio detail view for a single guest lecturer (ADR-018)
//
// Architecture mirrors PersonDetailPanel exactly:
//   • GUEST_DETAILS is the single source of truth for bio content.
//   • Reads GUESTS from GuestPanel for the shared identity fields
//     (name, role, initials, expertise).
//   • z=34 — above GuestPanel (z=32), below Faculty detail (z=37).
//
// To update a bio: edit the GUEST_DETAILS entry for that slug.
// ---------------------------------------------------------------------------

import FloatingPanel from "./FloatingPanel";
import { GUESTS } from "../data/guests";

const GUEST_DETAILS: Record<string, {
  bio: string[];
  topics: string[];
  affiliation: string;
}> = {
  "carlo-ratti": {
    bio: [
      "Carlo Ratti is an architect, engineer, and director of the MIT Senseable City Lab — one of the world's leading research groups on the intersection of digital technology and the built environment. His work explores how real-time data, networked sensors, and AI can reshape how cities function and how their inhabitants experience them.",
      "He has collaborated with cities, governments, and corporations across six continents to design data-driven urban interventions. His practice, Carlo Ratti Associati, is known for projects that embed intelligence directly into physical space — from adaptive facades to sensor-laden public infrastructure.",
      "At MIAW his guest lecture addresses how AI and urban sensing are converging to produce a new class of responsive, self-aware built environments — and what that means for the architects and engineers who design them.",
    ],
    topics: [
      "Real-time city sensing and urban intelligence",
      "AI-driven adaptive infrastructure",
      "The future of human-machine interaction in public space",
    ],
    affiliation: "MIT Senseable City Lab / Carlo Ratti Associati",
  },
  "carlos-arroyo": {
    bio: [
      "Carlos Arroyo is a Madrid-based architect whose practice spans built work, urban strategy, and design research. He has led projects across Europe and Latin America that engage with the relationship between computation, public space, and the social dimension of architecture.",
      "His approach integrates parametric and data-driven methods not as aesthetic ends but as tools for achieving greater responsiveness to context — environmental, social, and programmatic. He has taught at leading European architecture schools and lectured internationally on computation's role in practice.",
      "At MIAW his guest session addresses how AI tools are changing the relationship between early-stage design intuition and computational optimisation — and where the architect's judgement remains irreplaceable.",
    ],
    topics: [
      "Computation as a tool for contextual responsiveness",
      "AI in early-stage design decision-making",
      "Public architecture and digital fabrication",
    ],
    affiliation: "Carlos Arroyo Architects",
  },
  "cristina-diaz-moreno": {
    bio: [
      "Cristina Díaz Moreno is an architect and academic based in Madrid, where she has taught at ETSA Madrid and led research into the theoretical and cultural dimensions of computational architecture. Her work examines how digital tools don't just change what architects can make — they change how architects think.",
      "She is co-founder of Foreign Office Architects (with Farshid Moussavi), one of the most influential computational architecture practices of the early 2000s, and has continued to develop a theoretical framework for understanding AI's role in reshaping architectural culture.",
      "At MIAW her guest lecture explores the epistemological shift that AI is producing in design practice — not as a technical transition but as a cultural one, affecting how knowledge is produced, shared, and evaluated in the profession.",
    ],
    topics: [
      "Architectural theory in the age of machine intelligence",
      "The epistemology of computational and AI-driven design",
      "Cultural dimensions of the digital turn in architecture",
    ],
    affiliation: "ETSA Madrid",
  },
  "ismail-seleit": {
    bio: [
      "Ismail Seleit is an architect and computational designer working at the intersection of AI workflows, robotic fabrication, and building systems. His practice focuses on translating research-level computational methods into tools and workflows that function within the constraints of real projects.",
      "He has contributed to projects across scales — from material system research to built architecture — with a consistent focus on how digital intelligence can be embedded into the design process without sacrificing craft or contextual precision.",
      "At MIAW his guest session examines practical AI implementation: how practitioners can integrate machine learning and generative tools into their existing workflows without wholesale reinvention of practice.",
    ],
    topics: [
      "AI workflow integration in professional practice",
      "Computational design and robotic fabrication at building scale",
      "Bridging research methods and practice constraints",
    ],
    affiliation: "Practice & Research",
  },
  "mariana-ibanez": {
    bio: [
      "Mariana Ibáñez is an architect and Associate Professor at MIT's School of Architecture and Planning, where she directs research into the intersection of artificial intelligence, computational form, and material systems. Her work explores how machine learning is reshaping the grammar of architectural form — not by generating solutions but by expanding the design space available to the architect.",
      "She co-founded iStudio Architecture and has built a body of research and built work that consistently tests the limits of what computation can contribute to spatial intelligence. Her teaching at MIT has shaped a generation of architects working with AI tools.",
      "At MIAW her guest lecture addresses how AI is changing the nature of formal invention in architecture — and how architects can engage with machine learning not as operators of a tool but as designers of a design process.",
    ],
    topics: [
      "Machine learning and the expansion of design space",
      "AI as a material for architectural form-finding",
      "Pedagogy for AI-native architectural practice",
    ],
    affiliation: "MIT School of Architecture and Planning",
  },
  "mario-carpo": {
    bio: [
      "Mario Carpo is one of the most important architectural theorists of his generation, known for his rigorous analysis of how digital tools — from early CAD to contemporary AI — have transformed the logic of architectural design and production. He is Professor at UCL's Bartlett School of Architecture and has held chairs at Yale, Georgia Tech, and the École d'Architecture de Paris-La Villette.",
      "His books, including 'The Alphabet and the Algorithm' and 'The Second Digital Turn', are essential reading for anyone seeking to understand not just what digital tools do but why they matter historically, culturally, and intellectually. He argues that AI represents a fundamental break from the first digital turn — moving from algorithmic rule-following to pattern-based prediction.",
      "At MIAW his guest lecture addresses the theoretical stakes of AI in architecture: what it means to design with a system that learns from precedent rather than follows rules, and how this changes the architect's relationship to history, craft, and authorship.",
    ],
    topics: [
      "The Second Digital Turn — from algorithms to machine learning",
      "Notation, authorship, and the logic of non-standard production",
      "AI and the future of architectural theory",
    ],
    affiliation: "UCL Bartlett School of Architecture / Yale University",
  },
  "matias-del-campo": {
    bio: [
      "Matías del Campo is an architect, Associate Professor at the University of Michigan's Taubman College of Architecture and Urban Planning, and a leading practitioner in the application of machine learning to architectural design. His work with SPAN — the practice he co-directs with Sandra Manninger — has been at the forefront of using generative AI, neural networks, and robotic fabrication to produce architecturally ambitious built and speculative work.",
      "He has pioneered the use of GANs, diffusion models, and large language models as design partners — not as rendering shortcuts but as active participants in form-finding and spatial invention. His research and teaching have defined a new vocabulary for AI-driven architecture.",
      "At MIAW his guest session addresses how practitioners can engage with generative AI as a medium for serious architectural exploration — covering both the technical and the cultural dimensions of working with machine intelligence as a design collaborator.",
    ],
    topics: [
      "Generative AI as a medium for architectural form-finding",
      "Neural networks and machine learning in design practice",
      "Robotic fabrication integrated with AI design workflows",
    ],
    affiliation: "University of Michigan TCAUP / SPAN Architecture",
  },
  "neri-oxman": {
    bio: [
      "Neri Oxman is a designer, scientist, and inventor whose work at the MIT Media Lab established the field of Material Ecology — a design philosophy that situates human-made objects and buildings within the biological systems that sustain them. Her research integrated AI, robotics, synthetic biology, and fabrication to produce work of extraordinary ambition and rigour.",
      "Her projects — from the Silk Pavilion (fabricated by silkworms guided by computational code) to Aguahoja (a water-based biodegradable structure) — have consistently demonstrated that the boundaries between the natural and the artificial, the biological and the computational, are not fixed. AI, in Oxman's framework, is not a tool for efficiency but an instrument for rethinking the nature of design itself.",
      "At MIAW her contribution addresses the deep questions that AI in architecture must eventually confront: what are we designing for, and what kind of relationship do we want between artificial intelligence and the living systems our buildings inhabit?",
    ],
    topics: [
      "Material Ecology and biologically inspired design",
      "AI at the intersection of computation and biology",
      "Redefining the boundaries of architectural material and form",
    ],
    affiliation: "MIT Media Lab (former) / Oxman",
  },
  "sandra-manninger": {
    bio: [
      "Sandra Manninger is an architect, Associate Professor at the University of Michigan's Taubman College, and co-director of SPAN — the Vienna and New York-based practice she leads with Matías del Campo. Her work focuses on the aesthetic and formal dimensions of AI-generated architecture, examining how machine learning produces new spatial and compositional logics that have no precedent in human-authored design.",
      "She has been a consistent voice for taking AI's formal output seriously as architecture — not dismissing generative work as uncontrolled or unprincipled, but developing the critical and formal tools to evaluate and develop it as a new kind of architectural production.",
      "At MIAW her guest lecture addresses computational aesthetics in the age of generative AI: how do we develop a critical eye for machine-generated form, and what does architectural quality mean when the author is partly artificial?",
    ],
    topics: [
      "Computational aesthetics and AI-generated architectural form",
      "Critical frameworks for evaluating generative design output",
      "SPAN's practice: AI from concept to fabrication",
    ],
    affiliation: "University of Michigan TCAUP / SPAN Architecture",
  },
};

interface GuestDetailPanelProps {
  slug: string;
  onClose: () => void;
  initialX: number;
  initialY: number;
}

export default function GuestDetailPanel({ slug, onClose, initialX, initialY }: GuestDetailPanelProps) {
  const member = GUESTS.find((g) => g.slug === slug);
  const details = GUEST_DETAILS[slug];
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
            Guest Lecture
          </span>
        </div>
      }
      onClose={onClose}
      initialX={initialX}
      initialY={initialY}
      width={380}
      height={430}
      zIndex={34}
      resizable
      className="floating-panel--guest-detail"
    >
      <div className="px-5 py-4 flex flex-col gap-5 h-full overflow-y-auto">
        {/* Role */}
        <p
          className="text-white/45 text-xs tracking-wide"
          style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
        >
          {member.role}
        </p>

        {/* Bio paragraphs */}
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

        {/* Topics */}
        <div className="border-t border-white/10 pt-4">
          <p
            className="text-white/35 text-xs uppercase tracking-widest mb-3"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400 }}
          >
            Lecture Topics
          </p>
          <div className="flex flex-col gap-1.5">
            {details.topics.map((item, i) => (
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

        {/* Expertise tags */}
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
