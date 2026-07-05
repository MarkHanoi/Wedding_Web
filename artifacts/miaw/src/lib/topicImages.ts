// ---------------------------------------------------------------------------
// P5-A / P5-C: Contextual image detection + multi-image sequencing
//
// Each topic has an ordered series of 1–3 images. FloatingImage picks the
// image at index (turnDepth % series.length), so a prolonged conversation
// segment cycles through the series automatically.
//
// Keyword trigger reference (what EXACTLY triggers each topic):
//
//   ai-workflows  →  python, claude code, mcp, prompting, prompt engineering,
//                    api key, git, environment, f0, module 0, foundations,
//                    language model, hallucinate, context window, model context,
//                    setup, configure, personal knowledge base
//     image 0 (post8-interfaces.png) — programmed decision interfaces
//
//   territorial-analysis → territory, territorial, site analysis, openstreetmap,
//                          osm, copernicus, land registry, topography, urban context,
//                          site, f1, module 1, aerial, land use, regulation, gis,
//                          masterplan, urban fabric, solar analysis
//     image 0 (dataviz-filter.jpg) — data visualization of territorial layers
//
//   gaussian-splatting → gaussian, splatting, 3d scan, point cloud, nerf,
//                        photogrammetry, scan, 3d capture, lidar, reality capture,
//                        f2, module 2, photogrammetric, depth map, sfm,
//                        structure from motion
//     image 0 (three.jpg)          — 3D form / scan result
//
//   parametric-design → parametric, grasshopper, generative, rhino,
//                       computational design, algorithmic, f3, module 3,
//                       design generation, generative design, procedural,
//                       evolutionary, genetic algorithm, scripting geometry
//     image 0 (summer-jellyfish.png) — early: organic parametric form
//     image 1 (post2-procedural.jpg) — mid: procedural project creation
//     image 2 (summer-vaults.png)    — deep: structural parametric outcome
//
//   bim-documentation → bim, revit, ifc, documentation, technical drawing,
//                       building information, construction document, specification,
//                       f4, module 4, clash detection, coordination, shop drawing,
//                       as-built, model-based
//     image 0 (post6-context.jpg)  — theoretical context of project tools
//
//   ai-pipelines → pipeline, automation, automate, batch, script,
//                  workflow automation, api integration, n8n, make,
//                  f5, module 5, data pipeline, connector, trigger,
//                  scheduled, process documents
//     image 0 (post8-interfaces.png) — programmed interfaces / automation
//     image 1 (dataviz-filter.jpg)   — data pipeline visualization
//
//   simulation → simulation, energy, structural, daylight, lighting simulation,
//                thermal, cfd, wind, solar, building performance,
//                f6, module 6, environmental analysis, finite element,
//                radiation, heat transfer
//     image 0 (summer-shelters.png) — built structure under environmental loads
//
//   robotic-fabrication → robot, robotic, fabrication, cnc, manufacture,
//                         manufacturing, mill, 3d print, additive, assembly,
//                         construction robot, f7, module 7, digital fabrication,
//                         arm, kuka, abb
//     image 0 (summer-brutals.png)  — early: raw constructed brutalist form
//     image 1 (summer-shelters.png) — mid: fabricated shelter structure
//     image 2 (summer-vaults.png)   — deep: complex vaulted fabrication
//
//   world-models → world model, neural rendering, diffusion model,
//                  image generation, f8, module 8, neural, latent,
//                  generative model, video generation, sora, runway,
//                  synthetic data
//     image 0 (summer-jellyfish.png) — organic generative form
//     image 1 (three.jpg)            — 3D neural rendering output
//
//   curriculum → curriculum, modules, program structure, syllabus, 18 weeks,
//                schedule, timetable, how long, what do you learn,
//                what is taught, f0 to, f1 to, nine modules, 9 modules,
//                deliverable, each module
//     image 0 (post6-context.jpg)   — theoretical-practical tools overview
//     image 1 (post2-procedural.jpg) — MIAW nine-module program structure
//
//   application → apply, application, admission, admissions, enrol, enroll,
//                 cohort, intake, deadline, acceptance, waitlist,
//                 how much, when can i, first cohort, q4 2026, tuition,
//                 enrollment fee, how to apply
//     image 0 (post6-context.jpg) — MIAW program context and admissions overview
// ---------------------------------------------------------------------------

export type TopicSlug =
  | "ai-workflows"
  | "territorial-analysis"
  | "gaussian-splatting"
  | "parametric-design"
  | "bim-documentation"
  | "ai-pipelines"
  | "simulation"
  | "robotic-fabrication"
  | "world-models"
  | "curriculum"
  | "application";

export interface TopicImageEntry {
  src: string;
  alt: string;
}

export interface TopicSeries {
  images: TopicImageEntry[];
  position: "left" | "right";
}

export const TOPIC_SERIES: Record<TopicSlug, TopicSeries> = {
  "ai-workflows": {
    position: "right",
    images: [
      { src: "/images/post8-interfaces.webp", alt: "Programmed project interfaces for AI-driven decisions" },
    ],
  },
  "territorial-analysis": {
    position: "right",
    images: [
      { src: "/images/dataviz-filter.webp", alt: "Data visualization of territorial layers and site context" },
    ],
  },
  "gaussian-splatting": {
    position: "right",
    images: [
      { src: "/images/three.webp", alt: "3D scan and point cloud capture" },
    ],
  },
  "parametric-design": {
    position: "right",
    images: [
      { src: "/images/summer-jellyfish.webp", alt: "Organic parametric form — computational design exploration" },
      { src: "/images/post2-procedural.webp", alt: "Procedural project creation — parametric workflow" },
      { src: "/images/summer-vaults.webp",    alt: "Parametric vaulted structure — generative design outcome" },
    ],
  },
  "bim-documentation": {
    position: "right",
    images: [
      { src: "/images/post6-context.webp", alt: "Theoretical and practical context of project documentation tools" },
    ],
  },
  "ai-pipelines": {
    position: "right",
    images: [
      { src: "/images/post8-interfaces.webp", alt: "Automated project interfaces — programmed decision pipelines" },
      { src: "/images/dataviz-filter.webp",  alt: "Data pipeline and automation visualization" },
    ],
  },
  "simulation": {
    position: "right",
    images: [
      { src: "/images/summer-shelters.webp", alt: "Built structure under environmental and structural simulation" },
    ],
  },
  "robotic-fabrication": {
    position: "right",
    images: [
      { src: "/images/summer-brutals.webp",  alt: "Raw constructed brutalist form — digital fabrication" },
      { src: "/images/summer-shelters.webp", alt: "Fabricated shelter structure — robotic assembly" },
      { src: "/images/summer-vaults.webp",   alt: "Complex vaulted construction — robotic fabrication outcome" },
    ],
  },
  "world-models": {
    position: "right",
    images: [
      { src: "/images/summer-jellyfish.webp", alt: "Organic generative form — diffusion and world models" },
      { src: "/images/three.webp",            alt: "3D neural rendering output — latent space exploration" },
    ],
  },
  "curriculum": {
    position: "right",
    images: [
      { src: "/images/post6-context.webp",  alt: "Theoretical-practical overview of MIAW curriculum tools" },
      { src: "/images/post2-procedural.webp", alt: "Procedural workflow — MIAW nine-module program structure" },
    ],
  },
  "application": {
    position: "right",
    images: [
      { src: "/images/post6-context.webp", alt: "MIAW — program context and admissions overview" },
    ],
  },
};

/** Return the image entry for a topic at a given conversation depth within that topic. */
export function getSeriesImage(slug: TopicSlug, turnDepth: number): TopicImageEntry {
  const series = TOPIC_SERIES[slug];
  const index = turnDepth % series.images.length;
  return series.images[index];
}

/**
 * Find the first turnDepth (starting at `fromDepth`) for `slug` whose image
 * src is NOT already in `usedSrcs`.  Cycles through all images in the series
 * exactly once.  Returns null when every image in the series is already shown.
 */
export function findNonCollidingDepth(
  slug: TopicSlug,
  fromDepth: number,
  usedSrcs: Set<string>,
): number | null {
  const series = TOPIC_SERIES[slug];
  for (let i = 0; i < series.images.length; i++) {
    const depth = fromDepth + i;
    if (!usedSrcs.has(getSeriesImage(slug, depth).src)) return depth;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Keyword sets — each keyword that appears in the combined text adds 1 point.
// A topic wins when it has the highest score AND meets MIN_SCORE (= 2).
// Multi-word phrases count as one unit.
// ---------------------------------------------------------------------------
const TOPIC_KEYWORDS: Record<TopicSlug, string[]> = {
  "ai-workflows": [
    "python", "claude code", "mcp", "prompting", "prompt engineering",
    "api key", "git", "environment", "f0", "module 0", "foundations",
    "language model", "hallucinate", "context window", "model context",
    "setup", "configure", "personal knowledge base",
  ],
  "territorial-analysis": [
    "territory", "territorial", "site analysis", "openstreetmap", "osm",
    "copernicus", "land registry", "topography", "urban context", "site",
    "f1", "module 1", "aerial", "land use", "regulation", "gis",
    "masterplan", "urban fabric", "solar analysis",
  ],
  "gaussian-splatting": [
    "gaussian", "splatting", "3d scan", "point cloud", "nerf", "photogrammetry",
    "scan", "3d capture", "lidar", "reality capture", "f2", "module 2",
    "photogrammetric", "depth map", "sfm", "structure from motion",
  ],
  "parametric-design": [
    "parametric", "grasshopper", "generative", "rhino", "computational design",
    "algorithmic", "f3", "module 3", "design generation",
    "generative design", "procedural", "evolutionary", "genetic algorithm",
    "scripting geometry",
  ],
  "bim-documentation": [
    "bim", "revit", "ifc", "documentation", "technical drawing",
    "building information", "construction document", "specification",
    "f4", "module 4", "clash detection", "coordination", "shop drawing",
    "as-built", "model-based",
  ],
  "ai-pipelines": [
    "pipeline", "automation", "automate", "batch", "script",
    "workflow automation", "api integration", "n8n", "make",
    "f5", "module 5", "data pipeline", "connector", "trigger",
    "scheduled", "process documents",
  ],
  "simulation": [
    "simulation", "energy", "structural", "daylight", "lighting simulation",
    "thermal", "cfd", "wind", "solar", "building performance",
    "f6", "module 6", "environmental analysis", "finite element",
    "radiation", "heat transfer",
  ],
  "robotic-fabrication": [
    "robot", "robotic", "fabrication", "cnc", "manufacture", "manufacturing",
    "mill", "3d print", "additive", "assembly", "construction robot",
    "f7", "module 7", "digital fabrication", "arm", "kuka", "abb",
  ],
  "world-models": [
    "world model", "neural rendering", "diffusion model",
    "image generation", "f8", "module 8", "neural", "latent",
    "generative model", "video generation", "sora", "runway",
    "synthetic data",
  ],
  "curriculum": [
    "curriculum", "modules", "program structure", "syllabus", "18 weeks",
    "schedule", "timetable", "how long", "what do you learn",
    "what is taught", "f0 to", "f1 to", "nine modules", "9 modules",
    "deliverable", "each module",
  ],
  "application": [
    "apply", "application", "admission", "admissions", "enrol", "enroll",
    "cohort", "intake", "deadline", "acceptance", "waitlist",
    "how much", "when can i", "first cohort", "q4 2026", "tuition",
    "enrollment fee", "how to apply",
  ],
};

const MIN_SCORE = 2;

export interface DetectTopicInput {
  role: string;
  content: string;
}

export function detectTopic(
  assistantText: string,
  messages: DetectTopicInput[],
): TopicSlug | null {
  if (!assistantText || assistantText.length < 30) return null;

  const recentUserText = messages
    .filter((m) => m.role === "user")
    .slice(-2)
    .map((m) => m.content.toLowerCase())
    .join(" ");

  const combinedText = (assistantText + " " + recentUserText).toLowerCase();

  let bestTopic: TopicSlug | null = null;
  let bestScore = MIN_SCORE - 1;

  for (const [slug, keywords] of Object.entries(TOPIC_KEYWORDS) as [
    TopicSlug,
    string[],
  ][]) {
    const score = keywords.filter((kw) => combinedText.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestTopic = slug;
    }
  }

  return bestTopic;
}
