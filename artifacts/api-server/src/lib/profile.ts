export type VisitorType =
  | "architect"
  | "engineer"
  | "researcher"
  | "developer"
  | "student"
  | "urban_planner"
  | "unknown";

export interface VisitorProfile {
  type: VisitorType;
  context: string;
  identified: boolean;
  identifiedAtTurn: number | null;
}

interface MessageLike {
  role: string;
  content: string;
}

const TYPE_SIGNALS: Record<VisitorType, string[]> = {
  architect: [
    "architect",
    "architecture",
    "design",
    "building",
    "facade",
    "floor plan",
    "revit",
    "autocad",
    "rhino",
    "sketchup",
    "render",
    "project",
    "client",
    "studio",
    "firm",
    "aia",
    "riba",
  ],
  engineer: [
    "engineer",
    "engineering",
    "structural",
    "civil",
    "mep",
    "calculation",
    "load",
    "stress",
    "analysis",
    "simulation",
    "robot",
    "tekla",
    "staad",
  ],
  researcher: [
    "research",
    "phd",
    "paper",
    "academic",
    "university",
    "lab",
    "professor",
    "thesis",
    "study",
    "publish",
    "citation",
    "dataset",
  ],
  developer: [
    "developer",
    "software",
    "code",
    "programming",
    "python",
    "javascript",
    "api",
    "backend",
    "frontend",
    "ml",
    "machine learning",
    "model",
    "deploy",
    "github",
    "engineer",
  ],
  student: [
    "student",
    "studying",
    "degree",
    "university",
    "college",
    "graduation",
    "master",
    "bachelor",
    "semester",
    "professor",
    "class",
  ],
  urban_planner: [
    "urban",
    "city",
    "planning",
    "municipality",
    "zoning",
    "gis",
    "infrastructure",
    "transport",
    "public space",
    "masterplan",
  ],
  unknown: [],
};

function scoreType(text: string, type: VisitorType): number {
  const signals = TYPE_SIGNALS[type];
  let score = 0;
  for (const signal of signals) {
    if (text.includes(signal)) {
      score += signal.split(" ").length > 1 ? 3 : 1;
    }
  }
  return score;
}

export function inferProfile(
  messages: MessageLike[],
  currentProfile: VisitorProfile,
  currentTurn: number,
): VisitorProfile {
  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");

  if (!userText || userText.length < 10) return currentProfile;

  const scores: Record<VisitorType, number> = {
    architect: scoreType(userText, "architect"),
    engineer: scoreType(userText, "engineer"),
    researcher: scoreType(userText, "researcher"),
    developer: scoreType(userText, "developer"),
    student: scoreType(userText, "student"),
    urban_planner: scoreType(userText, "urban_planner"),
    unknown: 0,
  };

  const sorted = (Object.entries(scores) as [VisitorType, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  const [bestType, bestScore] = sorted[0];
  const identified = bestScore >= 2;

  const firstUserMessage =
    messages.find((m) => m.role === "user")?.content || "";
  const context =
    firstUserMessage.length > 120
      ? firstUserMessage.slice(0, 117) + "..."
      : firstUserMessage;

  return {
    type: identified ? bestType : "unknown",
    context,
    identified,
    identifiedAtTurn:
      identified && !currentProfile.identified
        ? currentTurn
        : currentProfile.identifiedAtTurn,
  };
}

export function profileSummary(profile: VisitorProfile): string {
  if (!profile.identified)
    return "Profile: not yet identified. Continue conversation to learn more.";
  return `Profile: ${profile.type}. Context: "${profile.context}"`;
}
