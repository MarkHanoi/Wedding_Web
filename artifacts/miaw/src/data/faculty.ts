export interface FacultyMember {
  slug: string;
  name: string;
  role: string;
  initials: string;
  modules: string;
  expertise: string;
  gradientFrom: string;
  gradientTo: string;
  photo?: string;
}

export const FACULTY: FacultyMember[] = [
  {
    slug: "jose-maria-lapuerta",
    name: "José María Lapuerta",
    role: "Program Director",
    initials: "JL",
    modules: "F0 · F2 · F8",
    expertise: "Architectural Theory · AI Integration · Design Pedagogy",
    gradientFrom: "#1a1a2e",
    gradientTo: "#2d1b4e",
    photo: "/faculty/jose-maria-lapuerta.png",
  },
  {
    slug: "sergio-del-castillo",
    name: "Sergio del Castillo Tello",
    role: "Documentation · Adaptive Ecosystems",
    initials: "SC",
    modules: "F6 · F8",
    expertise: "AI Documentation · Professional Ecosystems · Workflow Design",
    gradientFrom: "#1e1a1a",
    gradientTo: "#2e1e1e",
    photo: "/faculty/sergio-del-castillo.jpg",
  },
  {
    slug: "manuel-monteserin",
    name: "Manuel Montserín",
    role: "Territory · Simulation · Fabrication",
    initials: "MM",
    modules: "F1 · F4 · F7",
    expertise: "AI Site Analysis · Building Simulation · Robotic Fabrication",
    gradientFrom: "#1a1a1a",
    gradientTo: "#2e2e3a",
    photo: "/faculty/manuel-monteserin.jpg",
  },
  {
    slug: "javier-guerrero",
    name: "Javier Guerrero",
    role: "Generative Design · Communication · Documentation",
    initials: "JG",
    modules: "F3 · F5 · F6",
    expertise: "Generative Design · LLMs · AI Documentation",
    gradientFrom: "#1a1a2a",
    gradientTo: "#1e2a3e",
    photo: "/faculty/javier-guerrero.jpg",
  },
  {
    slug: "antia",
    name: "Antia",
    role: "World Modelling · Generative Design",
    initials: "A",
    modules: "F2 · F3",
    expertise: "Neural Rendering · Gaussian Splatting · Generative AI",
    gradientFrom: "#1e1a2e",
    gradientTo: "#2a1e3a",
    photo: "/faculty/antia.jpg",
  },
  {
    slug: "john-porral",
    name: "John Porral",
    role: "Simulation · Robotic Fabrication",
    initials: "JP",
    modules: "F4 · F7",
    expertise: "Building Simulation · Digital Twins · Fabrication",
    gradientFrom: "#1a1e1a",
    gradientTo: "#1e2e22",
    photo: "/faculty/john-porral.jpg",
  },
  {
    slug: "manuel-montoro",
    name: "Manuel Montoro",
    role: "Territory · AI Communication",
    initials: "MM",
    modules: "F1 · F5",
    expertise: "Territorial AI · Communication Workflows · Data Pipelines",
    gradientFrom: "#1a1a1e",
    gradientTo: "#222233",
    photo: "/faculty/manuel-montoro.jpg",
  },
  {
    slug: "antonio-canero",
    name: "Antonio Canero",
    role: "Computational Design · AI Workflows",
    initials: "AC",
    modules: "F3 · F4",
    expertise: "Computational Design · AI Integration · Parametric Tools",
    gradientFrom: "#1a1e1e",
    gradientTo: "#1e2a2a",
    photo: "/faculty/antonio-canero.jpg",
  },
];
