import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Resolve knowledge directory relative to the bundle output — see systemPrompt.ts
// for a full explanation of the import.meta.url strategy.
const __moduleDir = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE_DIR = join(__moduleDir, "../knowledge");

interface KnowledgeFile {
  filename: string;
  content: string;
  chunks: Chunk[];
}

interface Chunk {
  text: string;
  isHeader: boolean;
  position: number;
}

let knowledgeBase: KnowledgeFile[] = [];

const STOP_WORDS = new Set([
  "the", "and", "for", "that", "this", "with", "from", "are", "have",
  "will", "can", "what", "how", "when", "where", "who", "which", "its",
  "not", "but", "they", "their", "been", "more", "also", "each", "than",
  "into", "over", "used", "use", "using", "out", "very", "all", "any",
  "our", "your", "has", "was", "about", "would", "could", "should",
]);

const DOMAIN_BOOSTERS: Record<string, number> = {
  "architect": 2, "architecture": 2, "aec": 2, "bim": 2,
  "construction": 1.5, "building": 1.5, "engineer": 1.5,
  "ai": 1.5, "model": 1.5, "curriculum": 2, "module": 2,
  "cost": 2, "price": 2, "duration": 2, "timeline": 2,
  "apply": 2, "admission": 2, "cohort": 2, "faculty": 2,
  "python": 1.5, "grasshopper": 1.5, "rhino": 1.5, "revit": 1.5,
  "gaussian": 2, "splatting": 2, "mcp": 2, "parametric": 1.5,
  "simulation": 1.5, "fabrication": 1.5, "documentation": 1,
};

function loadKnowledge(): KnowledgeFile[] {
  if (knowledgeBase.length > 0) return knowledgeBase;

  const knowledgePath = KNOWLEDGE_DIR;
  const files = readdirSync(knowledgePath).filter((f) => f.endsWith(".md"));

  knowledgeBase = files.map((filename) => {
    const content = readFileSync(join(knowledgePath, filename), "utf-8");
    const chunks = splitIntoChunks(content);
    return { filename, content, chunks };
  });

  return knowledgeBase;
}

function splitIntoChunks(text: string): Chunk[] {
  const sections = text.split(/\n(?=##)/);
  const chunks: Chunk[] = [];
  let position = 0;

  for (const section of sections) {
    if (section.trim().length === 0) continue;
    const isHeader = section.trimStart().startsWith("#");

    if (section.length > 800) {
      const paragraphs = section.split(/\n\n+/);
      let buffer = "";
      for (const para of paragraphs) {
        if ((buffer + para).length > 700) {
          if (buffer.trim()) {
            chunks.push({ text: buffer.trim(), isHeader, position: position++ });
          }
          buffer = para;
        } else {
          buffer += "\n\n" + para;
        }
      }
      if (buffer.trim()) {
        chunks.push({ text: buffer.trim(), isHeader, position: position++ });
      }
    } else {
      chunks.push({ text: section.trim(), isHeader, position: position++ });
    }
  }

  return chunks;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function buildBigrams(tokens: string[]): string[] {
  const bigrams: string[] = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    bigrams.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return bigrams;
}

function scoreChunk(
  chunk: Chunk,
  queryTokens: string[],
  queryBigrams: string[],
): number {
  const chunkLower = chunk.text.toLowerCase();
  const chunkTokens = tokenize(chunk.text);
  const chunkLen = Math.max(chunkTokens.length, 1);
  let score = 0;

  for (const word of queryTokens) {
    const pattern = new RegExp(`\\b${word}\\b`, "g");
    const tf = (chunkLower.match(pattern) || []).length;
    if (tf > 0) {
      const normalizedTf = tf / (tf + 1.5 + 1.5 * (chunkLen / 80));
      score += normalizedTf * 4;

      const domainBoost = DOMAIN_BOOSTERS[word];
      if (domainBoost) score += domainBoost;
    }

    const prefix = word.slice(0, 5);
    if (prefix.length >= 4) {
      const partials = (chunkLower.match(new RegExp(prefix, "g")) || []).length;
      if (partials > 0) score += partials * 0.4;
    }
  }

  for (const bigram of queryBigrams) {
    if (chunkLower.includes(bigram)) {
      score += 5;
    }
  }

  const firstLine = chunk.text.split("\n")[0] ?? "";
  if (firstLine.startsWith("#")) {
    const headerLower = firstLine.toLowerCase();
    const headerHit = queryTokens.some((w) => headerLower.includes(w));
    if (headerHit) score += 2.5;
  }

  if (chunk.text.length < 80) score *= 0.5;

  return score;
}

export function retrieveContext(
  userMessage: string,
  conversationHistory: string,
  topK = 3,
): string {
  const kb = loadKnowledge();
  const query = `${userMessage} ${conversationHistory.slice(-400)}`;
  const queryTokens = tokenize(query);
  const queryBigrams = buildBigrams(queryTokens);

  const scored: { chunk: string; score: number; source: string }[] = [];

  for (const file of kb) {
    for (const chunk of file.chunks) {
      const score = scoreChunk(chunk, queryTokens, queryBigrams);
      if (score > 0) {
        scored.push({ chunk: chunk.text, score, source: file.filename });
      }
    }
  }

  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  if (topChunks.length === 0) {
    return kb[0]?.chunks[0]?.text || "";
  }

  return topChunks.map((c) => `[${c.source}]\n${c.chunk}`).join("\n\n---\n\n");
}

export function getKnowledgeStats() {
  const kb = loadKnowledge();
  return {
    files: kb.length,
    totalChunks: kb.reduce((acc, f) => acc + f.chunks.length, 0),
  };
}
