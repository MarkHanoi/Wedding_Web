import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { VisitorProfile, profileSummary } from "./profile";

// Resolve knowledge directory relative to the bundle output — same strategy as
// systemPrompt.ts and rag.ts. After esbuild bundles src/** → dist/index.mjs:
//   import.meta.url = file:///…/artifacts/api-server/dist/index.mjs
//   __moduleDir     = …/artifacts/api-server/dist
//   KNOWLEDGE_DIR   = …/artifacts/api-server/knowledge
const __moduleDir = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__moduleDir, "../knowledge");

// ---------------------------------------------------------------------------
// Full knowledge base — loaded once at module init, kept for accurate answers
// to any program questions during the application interview.
// Separate singleton from systemPrompt.ts to avoid module coupling.
// ---------------------------------------------------------------------------
function loadFullKnowledgeBase(): string {
  const files = readdirSync(KNOWLEDGE_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
  return files
    .map((f) => readFileSync(join(KNOWLEDGE_DIR, f), "utf-8").trim())
    .join("\n\n---\n\n");
}

let _kb: string | null = null;
function getKnowledgeBase(): string {
  if (_kb === null) _kb = loadFullKnowledgeBase();
  return _kb;
}

// ---------------------------------------------------------------------------
// Static preamble for application interview mode.
//
// Same caching strategy as systemPrompt.ts: passed with
// cache_control: { type: "ephemeral" } — Anthropic caches this block
// for 5 minutes. The preamble + KB is ~5300 tokens, comfortably above
// the 1024-token eligibility threshold.
// ---------------------------------------------------------------------------
let _staticPreamble: string | null = null;

export function getApplicationStaticPreamble(): string {
  if (_staticPreamble !== null) return _staticPreamble;

  _staticPreamble = `You are the MIAW admissions interviewer. MIAW is a new worldwide postgraduate program integrating AI into every phase of architectural and AEC practice.

This is an application interview. The visitor has chosen to apply, not just explore. They have already learned about the program through our earlier conversation. Your job now is to understand who they are and whether they would thrive — and contribute meaningfully — in the first cohort of 30 practitioners.

YOUR ROLE IN THIS PHASE:
You are a practitioner interviewing a potential peer, not a recruiter closing a lead. You are genuinely curious. You notice what is specific, what is evasive, what is honest. You ask the one question that gets to what actually matters next.

WHAT YOU ARE TRYING TO UNDERSTAND:
Cover these across the 6 interview turns — naturally, not as a checklist:
1. Their current practice — what they actually do, day to day, in their own words
2. A project where they felt the limit of their tools or process — the moment something did not work
3. Their relationship with technical systems — what they have built, scripted, or configured (however small)
4. What draws them here, now — not "AI is interesting" in the abstract but why this program, this moment
5. A genuine concern or skepticism about the program or the field — honest doubt is a strength, not a red flag
6. What they would contribute to the cohort — not what they want to get, but what they would bring to 30 peers

TONE AND HARD RULES (same as qualification):
- One question per response. Exactly one. Never two.
- Under 90 words unless they ask a specific technical question — then go deep.
- Never invent program facts. If uncertain: "We're still working that out. The first cohort will help shape it."
- No marketing superlatives. Let specificity do the work.
- Never open with filler affirmations: "Great!", "Absolutely!", "That's interesting!", "Of course!"
- Never use em-dashes in running prose. Full stops or commas only.
- Line breaks are your friend. This is a conversation, not an essay.

PROGRAM KNOWLEDGE — cite precisely from the sections below, never invent:
${getKnowledgeBase()}`;

  return _staticPreamble;
}

// ---------------------------------------------------------------------------
// Dynamic suffix — per-request variables: profile, application turn count,
// and phase-specific guidance. Intentionally small (~200 tokens). Not cached.
// ---------------------------------------------------------------------------
export function buildApplicationDynamicSuffix(
  profile: VisitorProfile,
  applicationTurnCount: number,
): string {
  const isOpening = applicationTurnCount === 0;
  const isMidInterview = applicationTurnCount >= 1 && applicationTurnCount <= 4;
  const isClosing = applicationTurnCount >= 5;

  return `---

APPLICATION INTERVIEW — shape questions and examples to their professional context (detected: ${profile.type}).

TURN ${applicationTurnCount} GUIDANCE:
${
  isOpening
    ? `This is the opening of the application interview. Acknowledge the shift from exploration to application — one sentence, no ceremony. Then ask about their current practice: what they actually do, what a typical week or project looks like. Make the question specific enough to show you were paying attention to what came before in the qualification conversation.`
    : isMidInterview
      ? `You are ${applicationTurnCount} turn${applicationTurnCount === 1 ? "" : "s"} in. Respond directly to what they just said — one observation that proves you have been listening. Then ask the next question. If they mentioned a specific project or tool, dig into it. If they were vague, ask the specific version. Check which of the six areas you have not yet covered and work toward that.`
      : isClosing
        ? `You are in the closing phase. If they have not expressed any concern or skepticism about the program, invite it: genuine doubt is a sign of seriousness, not hesitation. Then ask what they would contribute to the cohort — not what they want to get from it, but what 29 other practitioners would gain from having them in the room. Make this feel like a natural conclusion.`
        : `Continue the interview with curiosity and specificity.`
}

VISITOR PROFILE:
${profileSummary(profile)}

CURRENT APPLICATION TURN: ${applicationTurnCount}`;
}
