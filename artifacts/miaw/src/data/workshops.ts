import type { GuestMember } from "./guests";
import { GUESTS } from "./guests";

export interface WorkshopModule {
  code: string;
  name: string;
  description: string;
  tools: string[];
}

export interface WorkshopSession {
  label: string;
  detail: string;
}

export interface Workshop {
  id: string;
  num: string;
  title: string;
  topic: string;
  module: string;
  description: string;
  modules: WorkshopModule[];
  expertTalks: string;
  sessions: WorkshopSession[];
  guestSlugs: string[];
}

export const WORKSHOP_IMAGES: string[] = [
  "/workshops/dataviz-filter.jpg",
  "/workshops/miaw-agent.png",
  "/workshops/post2.jpg",
  "/workshops/post6.jpg",
  "/workshops/post8.png",
  "/workshops/summer-brutals.png",
  "/workshops/summer-jellyfish.png",
  "/workshops/summer-shelters.png",
  "/workshops/summer-vaults.png",
  "/workshops/three.jpg",
];

export const WORKSHOPS: Workshop[] = [
  {
    id: "f-01",
    num: "F·01",
    title: "AI Parametricism and Systems",
    topic: "AI Parametricism and Systems",
    module: "M00 – M03",
    description:
      "Foundational workshop spanning Fortnights 0–3. Students build the technical and conceptual base — from data structures and AI environment setup through territorial reading, geometry creation, and visual programming — culminating in a Phase Jury.",
    modules: [
      {
        code: "M00",
        name: "FUNDAMENTALS",
        description: "All about data structures and basic programming",
        tools: [
          "Data structures",
          "Databases",
          "Data scrapping",
          "Programming 1",
          "AI Concepts",
          "AI Environment Setup",
          "MCPs",
        ],
      },
      {
        code: "M01",
        name: "AI TERRITORY",
        description: "Topography / Landscape / Territory based AI uses",
        tools: [
          "Landscape modeling",
          "Territory modelling",
          "Smart city modelling",
          "MCPs 2",
        ],
      },
      {
        code: "M02",
        name: "AI MODELING",
        description: "Creating, Modifying, Capturing, and Controlling Geometry with AI",
        tools: ["Meshes / nurbs / SubDs", "2D to 3D — LoRAs"],
      },
      {
        code: "M03",
        name: "AI PROTOTYPING",
        description: "AI-Assisted Visual Programming",
        tools: [
          "Visual Programming",
          "Advanced Prototypes",
          "AI assisted scripting",
          "Parametric vs code",
          "Topologies vs typologies",
          "Procedural Modelling",
        ],
      },
    ],
    expertTalks: "Expert Talk I · Expert Talk · Expert Talk (one per fortnight, 1 session · 2.5 hrs + Q&A each)",
    sessions: [
      { label: "Masterclass — week 1", detail: "1 Session · 2.5 hrs + Q&A" },
      { label: "Kickstart session — week 2", detail: "x Sessions · x hrs" },
      { label: "Workshop 1 — Phase Jury", detail: "Jury review" },
      { label: "Follow up session — week 3", detail: "1 Session · x hrs" },
      { label: "Final Presentation — week 4", detail: "x Sessions · x hrs" },
    ],
    guestSlugs: ["mario-carpo", "carlo-ratti", "ismail-seleit"],
  },
  {
    id: "f-02",
    num: "F·02",
    title: "AI powered Design and simulations",
    topic: "AI powered Design and simulations",
    module: "M04 – M05",
    description:
      "Second workshop covering Fortnights 4–5. Participants apply AI-driven simulation and multidisciplinary communication techniques — from structural and environmental analysis to imagery, video, and immersive narrative environments.",
    modules: [
      {
        code: "M04",
        name: "AI SIMULATION",
        description: "AI-based simulation use and limitations",
        tools: [
          "Simulation types and computational cost",
          "Smart workflows towards fabrication",
          "Optimization Algorithms",
          "AI result accuracy validation",
          "Alternative simulations",
        ],
      },
      {
        code: "M05",
        name: "AI COMMUNICATION",
        description: "AI-Powered Imagery, Video, and Immersive Environments, Narratives",
        tools: [],
      },
    ],
    expertTalks: "Expert Talk · Expert Talk (one per fortnight, 1 session · 2.5 hrs + Q&A each)",
    sessions: [
      { label: "Masterclass — week 1", detail: "1 Session · x hrs" },
      { label: "Kickstart session — week 2", detail: "x Sessions · x hrs" },
      { label: "Workshop 2 — Phase Jury", detail: "Jury review" },
      { label: "Follow up session — week 3", detail: "1 Session · x hrs" },
      { label: "Final pres — week 4", detail: "x Sessions · x hrs" },
    ],
    guestSlugs: ["carlos-arroyo", "mariana-ibanez"],
  },
  {
    id: "f-03",
    num: "F·03",
    title: "Bespoke AI",
    topic: "Bespoke AI",
    module: "M06 – M09",
    description:
      "Capstone workshop across Fortnights 6–9. Students synthesise all prior workflows into a personal bespoke AI ecosystem — documenting, managing, and presenting the final course project with BIM, project management, and information-management tooling.",
    modules: [
      {
        code: "M06",
        name: "AI DOCUMENTATION",
        description: "BIM Documentation, Project Management, and Information Management",
        tools: [],
      },
    ],
    expertTalks: "Expert Talk (1 session · 2.5 hrs + Q&A)",
    sessions: [
      { label: "Masterclass — week 1", detail: "1 Session · x hrs" },
      { label: "Kickstart session — week 2", detail: "x Sessions · x hrs" },
      { label: "Workshop 3 — Phase Jury", detail: "Jury review" },
      { label: "Follow up session — week 3", detail: "1 Session · x hrs" },
      { label: "Final pres — week 4", detail: "x Sessions · x hrs" },
    ],
    guestSlugs: ["sandra-manninger", "matias-del-campo"],
  },
];

export function getGuestsBySlug(slugs: string[]): GuestMember[] {
  return slugs
    .map((slug) => GUESTS.find((g) => g.slug === slug))
    .filter((g): g is GuestMember => g !== undefined);
}

export function getRandomWorkshopImage(seed?: number): string {
  const idx =
    seed !== undefined
      ? seed % WORKSHOP_IMAGES.length
      : Math.floor(Math.random() * WORKSHOP_IMAGES.length);
  return WORKSHOP_IMAGES[idx];
}
