# Frontend — Technical Reference
**React 19 + Vite 7 + Tailwind CSS 4 + Framer Motion 12**
Last updated: May 2026

---

## 1. Package Structure

```
artifacts/miaw/
├── src/
│   ├── App.tsx                    ← Root — ErrorBoundary wraps ConversationCanvas
│   ├── main.tsx                   ← createRoot entry point
│   ├── index.css                  ← CSS @property gradient definitions, Tailwind @import
│   │
│   ├── components/
│   │   ├── ConversationCanvas.tsx ← All state, all UI, streaming logic
│   │   ├── MessageBubble.tsx      ← Individual message with streaming cursor
│   │   ├── TypingIndicator.tsx    ← Three-dot pulse while request in-flight
│   │   ├── CursorPrompt.tsx       ← "ask me anything" before first message
│   │   ├── CTAOverlay.tsx         ← Email capture at turn ≥ 8
│   │   └── ErrorBoundary.tsx      ← Branded React error fallback
│   │
│   ├── hooks/                     ← Custom hooks (if any)
│   ├── lib/
│   │   └── analytics.ts           ← PostHog typed event helpers
│   └── pages/
│       └── not-found.tsx
│
├── public/                        ← Static assets
├── index.html                     ← Vite entry HTML
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## 2. State Architecture

All state lives in `ConversationCanvas.tsx`. There is no global state manager (no Zustand, no Context, no Redux). The component is self-contained by design — the entire product is one conversation.

### Core State

```typescript
// Conversation state
const [messages, setMessages] = useState<Message[]>([]);
const [isStreaming, setIsStreaming] = useState(false);
const [isTyping, setIsTyping] = useState(false);
const [turnCount, setTurnCount] = useState(0);
const [hasStarted, setHasStarted] = useState(false);
const [showCTA, setShowCTA] = useState(false);
const [error, setError] = useState<string | null>(null);

// Visitor profile (inferred, updated each turn)
const [profile, setProfile] = useState<VisitorProfile>({
  type: "unknown",
  context: "",
  identified: false,
  identifiedAtTurn: null,
});

// Input
const [inputValue, setInputValue] = useState("");
```

### Message Type

```typescript
interface Message {
  id: string;                    // nanoid or crypto.randomUUID()
  role: "user" | "assistant";
  content: string;
  timestamp: number;             // Date.now()
}
```

### State Transitions

```
Initial: hasStarted=false
  ↓ click or keypress anywhere
Started: hasStarted=true, isTyping=true
  ↓ first Claude response streams in
Streaming: isStreaming=true, isTyping=false
  ↓ stream ends
Turn complete: messages updated, profile re-inferred
  ↓ if turnCount >= 8
CTA shown: showCTA=true
  ↓ logo click
Reset: all state reset to initial
```

---

## 3. Streaming Implementation

The streaming logic is the most critical part of the frontend. Key implementation details:

```typescript
const sendMessage = async (userMessage: string) => {
  const abortController = new AbortController();

  // 30-second timeout
  const timeoutId = setTimeout(() => abortController.abort(), 30_000);

  // Optimistic UI: add user message immediately
  const userMsg: Message = { id: nanoid(), role: "user", content: userMessage, timestamp: Date.now() };
  setMessages(prev => [...prev, userMsg]);
  setIsTyping(true);

  const response = await fetch(`${BASE_URL}api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [...messages, userMsg].map(toAPIMessage), profile, turnCount }),
    signal: abortController.signal,
  });

  setIsTyping(false);
  setIsStreaming(true);

  // Create placeholder for assistant message
  const assistantMsgId = nanoid();
  setMessages(prev => [...prev, { id: assistantMsgId, role: "assistant", content: "", timestamp: Date.now() }]);

  // Stream accumulation
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    accumulated += decoder.decode(value, { stream: true });
    // Update the last message in-place
    setMessages(prev =>
      prev.map(m => m.id === assistantMsgId ? { ...m, content: accumulated } : m)
    );
  }

  clearTimeout(timeoutId);
  setIsStreaming(false);

  // Update profile client-side after each turn
  const updatedProfile = inferProfile([...messages, userMsg, { role: "assistant", content: accumulated }], profile, turnCount);
  setProfile(updatedProfile);
  setTurnCount(prev => prev + 1);

  if (turnCount + 1 >= 8) setShowCTA(true);
};
```

**Key decisions:**
- `AbortController` with 30-second timeout prevents hung connections
- Optimistic UI adds user message before request starts
- A placeholder `Message` is created for the assistant before streaming begins, then mutated in-place via `setMessages(prev => prev.map(...))` — this prevents the bubble from disappearing and reappearing
- `TextDecoder` with `{ stream: true }` handles multi-byte UTF-8 characters correctly across chunk boundaries
- Profile inference runs client-side after each turn — no extra round-trip required

---

## 4. Framer Motion Usage

### 4.1 Logo FLIP Animation

```typescript
<LayoutGroup>
  {!hasStarted ? (
    <motion.h1
      layoutId="logo"
      className="logo-landing"
    >
      miaw
    </motion.h1>
  ) : (
    <motion.button
      layoutId="logo"
      className="logo-conversation"
      onClick={resetConversation}
    >
      miaw
    </motion.button>
  )}
</LayoutGroup>
```

`layoutId="logo"` causes Framer Motion to detect that the DOM element has changed position/size between renders and automatically FLIP-animate it. This works across different parent containers — something CSS `transition` cannot do.

### 4.2 Message Enter Animation

```typescript
// In MessageBubble.tsx
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, ease: "easeOut" }}
>
  {/* message content */}
</motion.div>
```

### 4.3 Streaming Cursor

```typescript
// Inside MessageBubble — shown only on last assistant message while isStreaming
{isLastAssistantMessage && isStreaming && (
  <motion.span
    animate={{ opacity: [1, 0] }}
    transition={{ duration: 0.55, repeat: Infinity, ease: "steps(1)" }}
    className="inline-block w-2 h-4 bg-white ml-0.5"
  />
)}
```

The `steps(1)` easing produces a hard blink (on/off) rather than a smooth fade — this matches terminal cursor behavior. Hardware-accelerated opacity changes trigger no layout recalculation.

---

## 5. CSS @property Gradient

The animated mesh gradient uses CSS `@property` for zero-JavaScript animation:

```css
/* In index.css */
@property --blob1-x { syntax: "<percentage>"; inherits: false; initial-value: 15%; }
@property --blob1-y { syntax: "<percentage>"; inherits: false; initial-value: 40%; }
@property --blob2-x { syntax: "<percentage>"; inherits: false; initial-value: 80%; }
@property --blob2-y { syntax: "<percentage>"; inherits: false; initial-value: 30%; }
/* ... blobs 3, 4 */

@keyframes blob-flow {
  0%   { --blob1-x: 15%; --blob1-y: 40%; --blob2-x: 80%; --blob2-y: 30%; /* ... */ }
  33%  { --blob1-x: 25%; --blob1-y: 55%; --blob2-x: 70%; --blob2-y: 45%; /* ... */ }
  66%  { --blob1-x: 10%; --blob1-y: 30%; --blob2-x: 85%; --blob2-y: 20%; /* ... */ }
  100% { --blob1-x: 15%; --blob1-y: 40%; --blob2-x: 80%; --blob2-y: 30%; /* ... */ }
}

.gradient-canvas {
  background: radial-gradient(ellipse at var(--blob1-x) var(--blob1-y), #5a78e8 0%, transparent 50%),
              radial-gradient(ellipse at var(--blob2-x) var(--blob2-y), #e050a8 0%, transparent 50%),
              /* blobs 3, 4 */
              #8e72d5;
  animation: blob-flow 45s ease-in-out infinite;
}
```

**Browser support:** CSS `@property` requires Chrome 85+, Firefox 128+, Safari 16.4+. Older browsers get a static `#8e72d5` background (the fallback value of `background`).

---

## 6. Vite Configuration

Key settings in `vite.config.ts`:

```typescript
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",   // Required for Replit path routing
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],      // Prevents dual React instances
  },
  server: {
    port: Number(process.env.PORT),
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,                  // Required for Replit iframe proxy
    fs: { strict: true },
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-framer": ["framer-motion"],
        },
      },
    },
  },
});
```

`BASE_PATH` is required at dev time — the Vite config throws if it's not set. This prevents silent routing bugs in the Replit proxy environment.

---

## 7. Analytics Events

All analytics calls go through `src/lib/analytics.ts`, which wraps PostHog:

```typescript
export const analytics = {
  conversationStarted: () =>
    posthog.capture("conversation_started"),

  conversationTurn: (turn: number, visitorType: string, responseLength: number) =>
    posthog.capture("conversation_turn", { turn, visitor_type: visitorType, response_length: responseLength }),

  profileIdentified: (visitorType: string, turn: number) =>
    posthog.capture("profile_identified", { visitor_type: visitorType, turn }),

  ctaShown: (turn: number, visitorType: string) =>
    posthog.capture("cta_shown", { turn, visitor_type: visitorType }),

  waitlistSubmitted: (visitorType: string, domainTld: string, turn: number) =>
    posthog.capture("waitlist_submitted", { visitor_type: visitorType, domain_tld: domainTld, turn }),

  errorShown: (errorType: string, turn: number) =>
    posthog.capture("error_shown", { error_type: errorType, turn }),
};
```

When `VITE_POSTHOG_KEY` is not set, PostHog initializes as a no-op. All calls are safe to make regardless of configuration.

---

## 8. Build Output

Production build produces:
```
artifacts/miaw/dist/public/
├── index.html
├── assets/
│   ├── vendor-react-[hash].js      ← React + ReactDOM (~42KB gzip)
│   ├── vendor-framer-[hash].js     ← Framer Motion (~44KB gzip)
│   └── index-[hash].js             ← App code (~41KB gzip)
└── assets/
    └── index-[hash].css            ← Tailwind output (~14KB gzip)
```

Total: ~127KB JS gzip + 14KB CSS gzip.

---

## 9. TypeScript Configuration

```jsonc
// artifacts/miaw/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,                    // Vite handles compilation
    "jsx": "react-jsx"
  },
  "references": [
    { "path": "../../lib/api-client-react" },
    { "path": "../../lib/api-zod" }
  ]
}
```

---

## 10. Accessibility

| Feature | Implementation | Status |
|---|---|---|
| ARIA live region | `role="log" aria-live="polite"` on message list | ✅ Done |
| Keyboard start | `keydown` event on document starts conversation | ✅ Done |
| Input autoFocus | Focus moves to input when conversation starts | ✅ Done |
| Minimum tap target | Send button ≥ 44×44px | ✅ Done |
| ARIA disabled | Input `aria-disabled` while streaming | ✅ Done |
| Error announcement | `role="alert"` on error messages | ✅ Done |
| WCAG contrast | Text on gradient — not formally tested | ⚠️ Pending |
| Reduced motion | `@prefers-reduced-motion` — gradient not paused | ⚠️ Pending |

---

## 11. Running and Building

```bash
# Development (requires PORT and BASE_PATH env vars)
PORT=20778 BASE_PATH=/ pnpm --filter @workspace/miaw run dev

# Production build
pnpm --filter @workspace/miaw run build

# TypeCheck only
pnpm --filter @workspace/miaw run typecheck
```
