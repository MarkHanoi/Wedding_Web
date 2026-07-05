# Backend — Technical Reference
**Express 5 + Node.js 24 + TypeScript 5.9**
Last updated: May 2026

---

## 1. Package Structure

```
artifacts/api-server/
├── src/
│   ├── index.ts              ← Server entry: listen on PORT
│   ├── app.ts                ← Express app: middleware stack + routes
│   ├── routes/
│   │   ├── index.ts          ← Router mount: /api/chat, /api/waitlist, /api/og, /api/healthz
│   │   ├── chat.ts           ← POST /api/chat — streaming Claude endpoint
│   │   ├── waitlist.ts       ← POST /api/waitlist — email capture
│   │   ├── og.ts             ← GET /api/og — OG image SVG
│   │   └── healthz.ts        ← GET /api/healthz — health check
│   └── lib/
│       ├── rag.ts            ← BM25-inspired keyword retrieval
│       ├── profile.ts        ← Visitor type inference
│       ├── systemPrompt.ts   ← Dynamic system prompt builder
│       └── logger.ts         ← Pino structured logger
├── knowledge/
│   ├── curriculum.md         ← 9 modules F0–F8 with deliverables
│   ├── faq.md                ← Admissions, cost, timeline
│   ├── aec-context.md        ← AEC sector context, world models
│   └── faculty.md            ← Faculty profiles
├── build.mjs                 ← esbuild config (server bundle)
└── package.json
```

---

## 2. Middleware Stack

```typescript
// app.ts — execution order matters
app.use(pinoHttp({ logger }));                     // 1. Structured request logging
app.use(helmet({ contentSecurityPolicy: false })); // 2. Security headers
app.use(cors({ origin: CORS_ORIGIN_REGEX }));      // 3. Origin allowlist
app.use(express.json({ limit: "64kb" }));          // 4. JSON body (cap 64KB)
app.use(express.urlencoded({ limit: "64kb" }));    // 5. Form body (cap 64KB)
app.use("/api", router);                           // 6. API routes
```

### Security Headers Applied by Helmet

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `X-XSS-Protection` | `0` (disabled per OWASP) |
| `Origin-Agent-Cluster` | `?1` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |

`contentSecurityPolicy: false` — CSP is disabled because this is a JSON/streaming API, not a webpage that loads scripts.

### CORS Configuration

```typescript
const ALLOWED_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$|\.replit\.(dev|app|co)$/;
app.use(cors({ origin: (origin, cb) => {
  if (!origin || ALLOWED_PATTERN.test(origin)) cb(null, true);
  else cb(new Error("CORS: origin not allowed"));
}}));
```

---

## 3. Route: POST /api/chat

This is the most complex route. Full implementation details:

### Zod Schema

```typescript
const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(8000),
  })).max(50),
  profile: VisitorProfileSchema.optional().default({ type: "unknown", context: "", identified: false, identifiedAtTurn: null }),
  turnCount: z.number().int().min(0).max(30).optional().default(0),
});
```

### Rate Limiting

Two-layer system. Redis first, memory fallback:

```typescript
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_S = 3600;

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  if (redis) {
    const count = await redis.incr(`miaw:rl:${ip}`);
    if (count === 1) await redis.expire(`miaw:rl:${ip}`, RATE_LIMIT_WINDOW_S);
    return { allowed: count <= RATE_LIMIT_MAX, remaining: Math.max(0, RATE_LIMIT_MAX - count) };
  }
  // In-memory fallback
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_S * 1000 });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }
  if (record.count >= RATE_LIMIT_MAX) return { allowed: false, remaining: 0 };
  record.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}
```

### Request Processing Pipeline

```typescript
router.post("/chat", async (req, res) => {
  // 1. Extract IP (handles X-Forwarded-For from proxy)
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim()
    || req.socket.remoteAddress || "127.0.0.1";

  // 2. Rate limit check
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) { res.status(429).json({ error: "rate_limit", ... }); return; }

  // 3. Schema validation
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() }); return; }

  const { messages, profile, turnCount } = parsed.data;

  // 4. Profile inference
  const updatedProfile = inferProfile(messages, profile, turnCount);

  // 5. RAG retrieval
  const lastUserMessage = messages.filter(m => m.role === "user").at(-1)?.content ?? "";
  const conversationHistory = messages.map(m => m.content).join(" ");
  const ragContext = retrieveContext(lastUserMessage, conversationHistory, 3);

  // 6. System prompt assembly
  const systemPrompt = buildSystemPrompt(ragContext, updatedProfile, turnCount);

  // 7. Streaming headers
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");  // Disable nginx buffering

  // 8. Claude stream
  const claudeMessages = messages.length === 0
    ? [{ role: "user" as const, content: "begin" }]
    : messages.map(m => ({ role: m.role as "user"|"assistant", content: m.content }));

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 8192,
    system: systemPrompt,
    messages: claudeMessages,
  });

  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
      res.write(chunk.delta.text);
    }
  }

  res.end();
});
```

---

## 4. Route: POST /api/waitlist

```typescript
const WaitlistRequestSchema = z.object({
  email: z.string().email(),
  visitorType: z.enum(["architect", "engineer", "researcher", "developer", "student", "urban_planner", "unknown"]),
  conversationLength: z.number().int().min(0).max(20),
  referrer: z.string().optional(),
});

// In-memory storage (always populated first)
const waitlistEntries: WaitlistEntry[] = [];

router.post("/waitlist", async (req, res) => {
  const parsed = WaitlistRequestSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "invalid_request", ... }); return; }

  const entry: WaitlistEntry = { ...parsed.data, createdAt: new Date().toISOString() };
  waitlistEntries.push(entry);         // Synchronous, always succeeds

  // Fire-and-forget — never awaited, never blocks response
  saveToAirtable(entry).catch(err => req.log.warn({ err }, "Airtable save failed"));

  res.status(201).json({
    success: true,
    message: "You're on the list.",
    domainTld: entry.email.split("@")[1]?.split(".").at(-1) ?? "unknown",
  });
});
```

---

## 5. RAG System

### Knowledge Loading

```typescript
// rag.ts — loaded ONCE at server startup, cached in module scope
let knowledgeBase: KnowledgeFile[] = [];

function loadKnowledge(): KnowledgeFile[] {
  if (knowledgeBase.length > 0) return knowledgeBase;      // Cache hit
  const knowledgePath = join(process.cwd(), "knowledge");
  const files = readdirSync(knowledgePath).filter(f => f.endsWith(".md"));
  knowledgeBase = files.map(filename => {
    const content = readFileSync(join(knowledgePath, filename), "utf-8");
    return { filename, content, chunks: splitIntoChunks(content) };
  });
  return knowledgeBase;
}
```

**Important:** Knowledge files are at `process.cwd()/knowledge`. The working directory must be `artifacts/api-server/` when the server starts. The startup script handles this, but it must be considered if the deployment configuration changes.

### Scoring Algorithm

```typescript
function scoreChunk(queryTokens: string[], queryBigrams: string[], chunk: Chunk): number {
  let score = 0;
  const chunkText = chunk.text.toLowerCase();
  const chunkLen = chunk.text.length;

  for (const token of queryTokens) {
    const tf = countOccurrences(chunkText, token);
    if (tf === 0) continue;

    // BM25-inspired TF normalization
    score += (tf / (tf + 1.5 + 1.5 * (chunkLen / 80))) * 4;

    // Domain booster
    if (DOMAIN_BOOSTERS[token] && chunkText.includes(token)) {
      score += DOMAIN_BOOSTERS[token];
    }

    // Header boost
    if (chunk.isHeader && chunkText.includes(token)) {
      score += 2.5;
    }
  }

  // Bigram bonus
  for (const bigram of queryBigrams) {
    if (chunkText.includes(bigram)) score += 5;
  }

  // Short chunk penalty
  if (chunkLen < 80) score *= 0.5;

  return score;
}
```

---

## 6. Visitor Profile Inference

```typescript
// profile.ts
const TYPE_SIGNALS: Record<VisitorType, string[]> = {
  architect: ["architect", "architecture", "design", "revit", "rhino", "studio", "firm", ...],
  engineer: ["engineer", "structural", "civil", "mep", "calculation", "simulation", ...],
  researcher: ["research", "phd", "paper", "academic", "university", "thesis", ...],
  developer: ["developer", "software", "code", "python", "api", "ml", "machine learning", ...],
  student: ["student", "studying", "degree", "semester", "bachelor", "master", ...],
  urban_planner: ["urban", "city", "planning", "municipality", "gis", "masterplan", ...],
  unknown: [],
};

export function inferProfile(messages, currentProfile, currentTurn): VisitorProfile {
  const userText = messages.filter(m => m.role === "user").map(m => m.content.toLowerCase()).join(" ");
  if (!userText || userText.length < 10) return currentProfile;

  // Score each type
  const scores = Object.fromEntries(
    Object.entries(TYPE_SIGNALS).map(([type, signals]) => [
      type, signals.reduce((score, signal) => score + (userText.includes(signal) ? (signal.includes(" ") ? 3 : 1) : 0), 0)
    ])
  ) as Record<VisitorType, number>;

  const [bestType, bestScore] = Object.entries(scores).sort(([,a],[,b]) => b-a)[0] as [VisitorType, number];
  const identified = bestScore >= 2;    // Threshold: 2 signal points minimum

  return {
    type: identified ? bestType : "unknown",
    context: messages.find(m => m.role === "user")?.content.slice(0, 120) ?? "",
    identified,
    identifiedAtTurn: identified && !currentProfile.identified ? currentTurn : currentProfile.identifiedAtTurn,
  };
}
```

---

## 7. System Prompt Architecture

```typescript
// systemPrompt.ts
export function buildSystemPrompt(ragContext, profile, turnCount): string {
  const warmingUp = turnCount <= 1;     // First 2 turns: discovery mode
  const ctaPhase = turnCount >= 7;      // Turn 7+: invitation mode
  const established = !warmingUp && !ctaPhase;

  return [
    PERSONA_BLOCK,                       // Voice, tone, hard rules
    phaseInstruction(warmingUp, established, ctaPhase, turnCount),
    `VISITOR PROFILE:\n${profileSummary(profile)}`,
    WHAT_MIAW_IS_NOT_BLOCK,              // Only shown when needed
    `PROGRAM KNOWLEDGE:\n${ragContext || "No specific context — answer from general MIAW knowledge."}`,
    `CURRENT TURN: ${turnCount}`,
  ].join("\n\n");
}
```

**Hard rules in the persona block (always injected):**
1. One question per response — exactly one, never two
2. Under 90 words UNLESS a specific technical question is asked
3. Never invent program facts
4. Never use marketing superlatives
5. No openers: "Great!", "Absolutely!", "That's interesting!"
6. No em-dashes in running prose
7. Shape examples to detected visitor type

---

## 8. Error Handling

Express 5 propagates async errors from route handlers automatically. A global error handler catches unhandled errors:

```typescript
// app.ts
const globalErrorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  req.log.error({ err }, "Unhandled error");
  if (res.headersSent) return;
  res.status(500).json({ error: "internal_error", message: "Something went wrong." });
};
app.use(globalErrorHandler);
```

For the streaming `/api/chat` endpoint, the error handler inside the route checks `res.headersSent` — if streaming has already started and an error occurs, `res.end()` is called silently (the client sees a truncated stream).

---

## 9. Build System

```javascript
// build.mjs (esbuild)
await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.mjs",
  sourcemap: true,
  plugins: [pinoPlugin({ transports: ["pino-pretty"] })],
  external: [],  // Everything bundled — no node_modules at runtime
});
```

Build output: `dist/index.mjs` (~1.7MB uncompressed, includes all dependencies). `pino-pretty` is bundled as a worker file for development logging.

---

## 10. Running and Building

```bash
# Development (builds then starts — no hot reload)
PORT=8080 BASE_PATH=/api pnpm --filter @workspace/api-server run dev

# Build only
pnpm --filter @workspace/api-server run build

# Start pre-built server
PORT=8080 pnpm --filter @workspace/api-server run start

# TypeCheck
pnpm --filter @workspace/api-server run typecheck
```

### Knowledge file path requirement

The server must be started from the `artifacts/api-server/` directory, or `process.cwd()` must resolve to it. The knowledge path is `join(process.cwd(), "knowledge")`. This is handled correctly by the pnpm scripts.
