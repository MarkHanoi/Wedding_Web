export interface GuestMember {
  slug: string;
  name: string;
  role: string;
  initials: string;
  affiliation: string;
  expertise: string;
  gradientFrom: string;
  gradientTo: string;
  photo?: string;
}

export const GUESTS: GuestMember[] = [
  {
    slug: "carlo-ratti",
    name: "Carlo Ratti",
    role: "Architect · Urban Technologist",
    initials: "CR",
    affiliation: "MIT Senseable City Lab",
    expertise: "Smart Cities · Urban AI · Sensing Infrastructure",
    gradientFrom: "#1a1a2e",
    gradientTo: "#2d1b4e",
    photo: "/guests/carlo-ratti.jpg",
  },
  {
    slug: "carlos-arroyo",
    name: "Carlos Arroyo",
    role: "Architect · Principal",
    initials: "CA",
    affiliation: "Carlos Arroyo Architects",
    expertise: "Parametric Design · Public Space · Urban Systems",
    gradientFrom: "#1a1e1a",
    gradientTo: "#1e2e22",
    photo: "/guests/carlos-arroyo.jpg",
  },
  {
    slug: "cristina-diaz-moreno",
    name: "Cristina Díaz Moreno",
    role: "Architect · Academic",
    initials: "CD",
    affiliation: "ETSA Madrid",
    expertise: "Architectural Theory · Computation · Practice Research",
    gradientFrom: "#1e1a2e",
    gradientTo: "#2a1e3a",
    photo: "/guests/cristina-diaz-moreno.jpg",
  },
  {
    slug: "ismail-seleit",
    name: "Ismail Seleit",
    role: "Architect · Researcher",
    initials: "IS",
    affiliation: "Practice & Research",
    expertise: "Computational Design · AI Workflows · Digital Fabrication",
    gradientFrom: "#1a1a1a",
    gradientTo: "#2e2e3a",
    photo: "/guests/ismail-seleit.jpg",
  },
  {
    slug: "mariana-ibanez",
    name: "Mariana Ibáñez",
    role: "Architect · Associate Professor",
    initials: "MI",
    affiliation: "MIT School of Architecture",
    expertise: "AI & Architecture · Computational Form · Material Systems",
    gradientFrom: "#1e1a1a",
    gradientTo: "#2e1e1e",
    photo: "/guests/mariana-ibanez.jpg",
  },
  {
    slug: "mario-carpo",
    name: "Mario Carpo",
    role: "Architectural Theorist",
    initials: "MC",
    affiliation: "UCL Bartlett · Yale",
    expertise: "Digital Turn · Notation · AI in Design History",
    gradientFrom: "#1a1a1e",
    gradientTo: "#222233",
    photo: "/guests/mario-carpo.jpg",
  },
  {
    slug: "matias-del-campo",
    name: "Matías del Campo",
    role: "Architect · Associate Professor",
    initials: "MdC",
    affiliation: "University of Michigan TCAUP",
    expertise: "Machine Learning · Generative Form · Robotic Fabrication",
    gradientFrom: "#1a1e1e",
    gradientTo: "#1e2a2a",
    photo: "/guests/matias-del-campo.jpg",
  },
  {
    slug: "neri-oxman",
    name: "Neri Oxman",
    role: "Designer · Scientist",
    initials: "NO",
    affiliation: "MIT Media Lab (former)",
    expertise: "Material Ecology · Biologically Inspired Design · AI + Biology",
    gradientFrom: "#1e1a2a",
    gradientTo: "#2a2240",
    photo: "/guests/neri-oxman.jpg",
  },
  {
    slug: "sandra-manninger",
    name: "Sandra Manninger",
    role: "Architect · Associate Professor",
    initials: "SM",
    affiliation: "University of Michigan / SPAN",
    expertise: "Generative AI · Form-Finding · Computational Aesthetics",
    gradientFrom: "#1a1e2a",
    gradientTo: "#1e283e",
    photo: "/guests/sandra-manninger.jpg",
  },
];
