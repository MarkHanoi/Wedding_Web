# MIAW Phase 0 — Ultra-Detailed Implementation Plan for Replit AI Agent
**Master In Intelligent Artificial Worlds · PoC/MVP · May 2026**
**Target: 3 weeks · Stack: Next.js 14 App Router · TypeScript · Anthropic Claude API · Tailwind CSS · Vercel**

---

> **HOW TO USE THIS DOCUMENT**
> Each task below is a self-contained unit of work. Feed one task at a time to the Replit AI agent.
> Tasks are numbered `T-XX`. Dependencies are listed explicitly. Never skip a task.
> Code blocks show EXACT implementations — the agent should follow them precisely, not interpret them.

---

## PHASE 0 OVERVIEW

```
GOAL: Ship a full-screen conversational AI agent that IS the website.
      No traditional landing page. No nav. No scroll. Just Claude.

URL opens → gradient canvas → logo → "ask me anything" cursor
         → user clicks/types → agent takes over → 8-turn conversation
         → waitlist CTA → email captured → conversion tracked
```

---

## WEEK 1 — FOUNDATION

### MILESTONE W1: Project boots locally, full-screen UI renders, mock conversation works end-to-end.

---

### T-01 · Project Bootstrap
**Depends on:** nothing
**Time estimate:** 30 min
**Replit agent instruction:**

```
Create a new Next.js 14 project with the following exact configuration.

Run this command:
npx create-next-app@14 miaw-phase0 --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"

Then cd into miaw-phase0 and install these exact dependencies:
npm install @anthropic-ai/sdk@latest
npm install ai@3.1.0
npm install posthog-js@latest
npm install @upstash/redis@latest
npm install clsx@latest

Dev dependencies:
npm install -D @types/node@latest

After installation, verify package.json has these in dependencies:
- @anthropic-ai/sdk
- ai
- posthog-js
- @upstash/redis
- clsx

Create .env.local in root with this exact content (values are placeholders):
ANTHROPIC_API_KEY=sk-ant-REPLACE_ME
NEXT_PUBLIC_POSTHOG_KEY=phc_REPLACE_ME
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
UPSTASH_REDIS_REST_URL=https://REPLACE_ME.upstash.io
UPSTASH_REDIS_REST_TOKEN=REPLACE_ME
AIRTABLE_API_KEY=pat_REPLACE_ME
AIRTABLE_BASE_ID=app_REPLACE_ME
AIRTABLE_TABLE_NAME=Waitlist

Add .env.local to .gitignore (verify it's already there from create-next-app).

Create .env.example with the same keys but empty values — this goes in git.
```

---

### T-02 · TypeScript Types & Interfaces
**Depends on:** T-01
**Time estimate:** 20 min
**Replit agent instruction:**

```
Create the file types/index.ts with the following exact content:

// ─── Message types ────────────────────────────────────────────────
export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;           // nanoid generated
  role: MessageRole;
  content: string;
  timestamp: number;    // Date.now()
}

// ─── Visitor profile ──────────────────────────────────────────────
export type VisitorType =
  | 'architect'
  | 'engineer'
  | 'researcher'
  | 'developer'
  | 'student'
  | 'urban_planner'
  | 'unknown';

export interface VisitorProfile {
  type: VisitorType;
  context: string;        // 1-sentence summary of their work
  identified: boolean;    // true once we have enough signal
  identifiedAtTurn: number | null;
}

// ─── Conversation state ───────────────────────────────────────────
export interface ConversationState {
  messages: Message[];
  profile: VisitorProfile;
  turnCount: number;
  isStreaming: boolean;
  showCTA: boolean;
  error: string | null;
}

// ─── API payloads ─────────────────────────────────────────────────
export interface ChatRequestBody {
  messages: Pick<Message, 'role' | 'content'>[];
  profile: VisitorProfile;
  turnCount: number;
}

export interface ChatResponseChunk {
  delta: string;
}

export interface WaitlistRequestBody {
  email: string;
  visitorType: VisitorType;
  conversationLength: number;
  referrer?: string;
}

// ─── RAG ─────────────────────────────────────────────────────────
export interface KnowledgeChunk {
  source: string;         // filename
  content: string;
  relevanceScore: number;
}

Also install nanoid for ID generation:
npm install nanoid@latest
```

---

### T-03 · Tailwind & Global CSS Setup
**Depends on:** T-01
**Time estimate:** 20 min
**Replit agent instruction:**

```
Replace the contents of app/globals.css with:

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-purple: #a78bfa;
  --color-pink: #f472b6;
  --color-purple-deep: #7c3aed;
  --color-pink-deep: #db2777;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* No scroll on the canvas */
}

/* Gradient animation */
@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.gradient-canvas {
  background: linear-gradient(
    135deg,
    #a78bfa 0%,
    #818cf8 25%,
    #c084fc 50%,
    #f472b6 75%,
    #fb7185 100%
  );
  background-size: 400% 400%;
  animation: gradientShift 12s ease infinite;
}

/* Message fade-in */
@keyframes messageFadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.message-enter {
  animation: messageFadeIn 0.3s ease forwards;
}

/* Logo entrance */
@keyframes logoFadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.logo-enter {
  animation: logoFadeUp 0.6s ease 0.3s forwards;
  opacity: 0;
}

.subtitle-enter {
  animation: logoFadeUp 0.6s ease 0.7s forwards;
  opacity: 0;
}

.cursor-enter {
  animation: logoFadeUp 0.6s ease 1.1s forwards;
  opacity: 0;
}

/* Cursor blink */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.cursor-blink {
  animation: blink 1.1s step-end infinite;
}

/* Typing dots */
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1;   }
}

.dot-1 { animation: dotPulse 1.4s ease-in-out infinite; }
.dot-2 { animation: dotPulse 1.4s ease-in-out 0.2s infinite; }
.dot-3 { animation: dotPulse 1.4s ease-in-out 0.4s infinite; }

/* Input focus */
.chat-input:focus {
  outline: none;
  border-bottom-color: rgba(255, 255, 255, 0.8);
}

/* Scrollbar for message list */
.message-list::-webkit-scrollbar { width: 0px; }

Replace tailwind.config.ts with:

import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'monospace'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'miaw-purple': '#a78bfa',
        'miaw-pink': '#f472b6',
      }
    },
  },
  plugins: [],
}

export default config
```

---

### T-04 · Knowledge Base Files
**Depends on:** T-01
**Time estimate:** 30 min
**Replit agent instruction:**

```
Create a /knowledge directory in the project root with these 4 files.
Write the content EXACTLY as specified — this is what the AI agent will know.

FILE 1: knowledge/curriculum.md
---
# MIAW Curriculum

## What is MIAW?
MIAW (Master In Intelligent Artificial Worlds) is a new worldwide postgraduate program focused on designing, building, and deploying AI world models with a primary focus on the AEC sector (Architecture, Engineering, Construction). It is the first master's degree globally dedicated to spatial AI and physical world modeling.

## Program Structure
- Duration: 6 months intensive, online-first with synchronous live sessions
- Language: English
- Format: Project-based learning, real deliverables from week 1
- Cohort size: Small international cohort (max 30 participants per cohort)
- First cohort target: Q4 2026

## Core Modules

### Module 1: Foundations of World Models
What world models are, why they matter, how they differ from traditional ML. Spatial reasoning, scene graphs, physical simulation. Key papers: GPT-4V applied to spatial understanding, NeRF-based world models, Gaussian splatting.

### Module 2: AI Agents in Physical Environments
Building autonomous agents that perceive, plan, and act in AEC contexts. BIM integration. Multi-agent coordination for construction workflows. Tool use, memory systems, reasoning chains.

### Module 3: Generative Design Systems
Parametric design meets generative AI. Text-to-3D workflows. Diffusion models for architectural generation. Controlling outputs with constraints (structural, zoning, client brief).

### Module 4: Computational Geometry & Spatial AI
Point clouds, mesh processing, NeRF, Gaussian splatting. Working with Rhino/Grasshopper programmatically. Python for geometry: trimesh, open3d, shapely.

### Module 5: Data Pipelines for the Built Environment
BIM data (IFC format), GIS integration, sensor data from IoT on construction sites. Building datasets for training domain-specific models.

### Module 6: Deployment & Real-World Integration
From prototype to production. API design for AEC tools. Edge deployment on construction sites. Integration with existing AEC software ecosystems (Autodesk, Bentley, McNeel).

## Who Is This For?
- Architects wanting to build, not just use, AI tools
- Engineers interested in computational design and automation
- Researchers in spatial AI, robotics, or computer vision
- Software developers moving into the AEC domain
- Urban planners thinking about AI-driven city systems

## What You Will Build
By the end of the master, each participant will have shipped: a working AI agent integrated with a BIM workflow OR a generative design system with real constraints OR a spatial world model trained on domain data.

## Outcomes
- Portfolio of 3-4 real projects
- Network of international AEC + AI professionals
- Access to MIAW's ongoing research community
---

FILE 2: knowledge/aec-context.md
---
# AEC Sector & AI — Why Now

## The Transformation
The Architecture, Engineering, and Construction sector is undergoing its largest transformation since the introduction of CAD in the 1980s. Unlike previous software waves, AI is not just changing how AEC professionals work — it is redefining what is possible to design and build.

## What Are World Models?
A world model is an AI system that builds an internal representation of a physical environment — understanding space, structure, material properties, and how things change over time. Unlike image classifiers or language models, world models reason spatially: they can answer "what happens if this wall moves?" or "where is the structural load path?"

In AEC, world models enable:
- Automated code compliance checking
- Generative structural optimization
- Construction site monitoring via vision AI
- Predictive maintenance for buildings
- Autonomous design iteration at scale

## Why AEC Is Behind
Despite massive potential, AEC has been slow to adopt AI because:
1. Data is fragmented (each project is unique, data rarely shared)
2. Tools are siloed (BIM, CAD, GIS, scheduling — separate systems)
3. The industry has few AI/ML practitioners with domain knowledge
4. Regulatory frameworks for AI in construction are nascent

This gap is the opportunity MIAW addresses.

## Key Technologies Reshaping AEC
- Large Language Models for design reasoning and documentation
- Diffusion models for generative design
- NeRF / Gaussian Splatting for 3D scene reconstruction
- Reinforcement learning for construction robot control
- Graph neural networks for structural analysis
- Computer vision for site safety and progress monitoring

## The Practitioner Gap
There are thousands of architects who want to build AI tools. There are thousands of AI engineers who want to work on physical systems. Almost no one has both. MIAW closes that gap.
---

FILE 3: knowledge/faculty.md
---
# Faculty & Research Direction

## Vision
MIAW faculty are practitioners, not just academics. The guiding principle: every instructor has shipped something real — a tool used in practice, a system deployed on a real project, a paper that changed how the field thinks.

## Research Focus Areas
- Spatial AI and scene understanding for built environments
- Generative systems with architectural and structural constraints
- Human-AI collaboration in design workflows
- Autonomous agents for construction management
- Sustainable design optimization via AI

## Guest Practitioners
Each cohort includes sessions with active practitioners from leading architecture firms, engineering consultancies, and AI labs working at the intersection of spatial AI and the built environment. Names confirmed closer to cohort launch.

## Mentorship Model
Every participant is paired with a mentor from industry or research for the duration of the program. Mentors provide project feedback, career guidance, and network access.
---

FILE 4: knowledge/faq.md
---
# Frequently Asked Questions

## Admissions
Q: What background do I need?
A: You need either: (a) professional experience in AEC (architecture, engineering, construction) with curiosity about AI, OR (b) software/AI background with interest in physical world applications. You do not need both — the program bridges them.

Q: Do I need to code?
A: Basic Python is strongly recommended. We teach what you need within the program, but arriving with Python fundamentals (functions, loops, basic libraries) will let you focus on the domain rather than syntax.

Q: Is there an application process?
A: Yes. Applications involve a short portfolio or work sample, a written statement about why you're applying, and a brief interview. We are keeping cohorts small to maintain quality.

## Program Details
Q: How intensive is it?
A: Plan for 20-25 hours per week. This is a serious commitment, but structured for working professionals — live sessions happen in slots that work across time zones (EU/Americas overlap, or EU/Asia overlap depending on cohort composition).

Q: Is it fully online?
A: Online-first. There will be 1-2 optional in-person intensive weekends per cohort, location TBD. These are optional but strongly recommended.

Q: What language is the program in?
A: English. All materials, sessions, and submissions are in English.

## Cost & Timeline
Q: How much does it cost?
A: Pricing is being finalized. Early applicants will have access to founder pricing. Range being considered: €4,000-8,000 total, with payment plans available.

Q: When does the first cohort start?
A: Targeting Q4 2026. Exact date depends on cohort composition and faculty availability.

Q: Is there a certificate?
A: Yes. A certificate of completion from MIAW, with project portfolio as primary evidence of learning.

## Technical
Q: What tools will we use?
A: Python, Jupyter, Rhino/Grasshopper (basics), Revit API (basics), standard ML libraries (PyTorch, HuggingFace), Anthropic/OpenAI APIs, GitHub. All tools either free or provided as part of the program.
---
```

---

### T-05 · Layout & Root Page Setup
**Depends on:** T-03
**Time estimate:** 25 min
**Replit agent instruction:**

```
Replace app/layout.tsx with exactly:

import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MIAW — Master In Intelligent Artificial Worlds',
  description: 'A worldwide master\'s program for architects, engineers, and researchers building the next generation of AI-native physical world systems.',
  openGraph: {
    title: 'MIAW — Master In Intelligent Artificial Worlds',
    description: 'The first master\'s program dedicated to AI world models in the AEC sector.',
    url: 'https://miaw.ai',
    siteName: 'MIAW',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'MIAW — Master In Intelligent Artificial Worlds',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MIAW — Master In Intelligent Artificial Worlds',
    description: 'AI world models for the built environment.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}


Replace app/page.tsx with exactly:

import ConversationCanvas from '@/components/ConversationCanvas'

export default function Home() {
  return <ConversationCanvas />
}
```

---

### T-06 · TypingIndicator Component
**Depends on:** T-03
**Time estimate:** 15 min
**Replit agent instruction:**

```
Create components/TypingIndicator.tsx with exactly:

export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <span className="dot-1 w-1.5 h-1.5 bg-white rounded-full block" />
      <span className="dot-2 w-1.5 h-1.5 bg-white rounded-full block" />
      <span className="dot-3 w-1.5 h-1.5 bg-white rounded-full block" />
    </div>
  )
}
```

---

### T-07 · MessageBubble Component
**Depends on:** T-02, T-06
**Time estimate:** 20 min
**Replit agent instruction:**

```
Create components/MessageBubble.tsx with exactly:

import { Message } from '@/types'
import clsx from 'clsx'

interface MessageBubbleProps {
  message: Message
  isLatest?: boolean
}

export default function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const isAgent = message.role === 'assistant'

  return (
    <div
      className={clsx(
        'message-enter max-w-[85%] sm:max-w-[72%]',
        isAgent ? 'self-start' : 'self-end'
      )}
    >
      <div
        className={clsx(
          'text-white leading-relaxed text-[15px] sm:text-base',
          isAgent
            ? 'text-left'
            : 'text-right bg-white/10 backdrop-blur-sm rounded-2xl rounded-br-sm px-4 py-2.5'
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
```

---

### T-08 · CursorPrompt Component
**Depends on:** T-03
**Time estimate:** 15 min
**Replit agent instruction:**

```
Create components/CursorPrompt.tsx with exactly:

interface CursorPromptProps {
  onClick: () => void
}

export default function CursorPrompt({ onClick }: CursorPromptProps) {
  return (
    <button
      onClick={onClick}
      className="cursor-enter fixed bottom-10 right-10 sm:bottom-14 sm:right-14 flex items-center gap-2 group hover:opacity-80 transition-opacity"
      aria-label="Start conversation"
    >
      {/* Cursor SVG */}
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white"
      >
        <path
          d="M0 0L0 17.5L4.5 13L7.5 20L9.5 19.2L6.5 12H12L0 0Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-mono text-white text-sm sm:text-base italic tracking-wide">
        ask me anything
      </span>
    </button>
  )
}
```

---

### T-09 · CTAOverlay Component
**Depends on:** T-02, T-03
**Time estimate:** 25 min
**Replit agent instruction:**

```
Create components/CTAOverlay.tsx with exactly:

import { useState } from 'react'
import { VisitorProfile } from '@/types'

interface CTAOverlayProps {
  profile: VisitorProfile
  conversationLength: number
  onSubmit: (email: string) => Promise<void>
}

export default function CTAOverlay({ profile, conversationLength, onSubmit }: CTAOverlayProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await onSubmit(email)
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start">
        <p className="text-white text-base font-medium mb-1">You're in.</p>
        <p className="text-white/70 text-sm leading-relaxed">
          We'll reach out when applications open. People like you are exactly who we're building this for.
        </p>
      </div>
    )
  }

  return (
    <div className="message-enter mt-8 border border-white/30 rounded-2xl p-6 backdrop-blur-sm bg-white/5 max-w-[480px] self-start">
      <p className="text-white text-base font-medium mb-1">
        Want to be part of the first cohort?
      </p>
      <p className="text-white/70 text-sm mb-4 leading-relaxed">
        We're keeping this small on purpose. Leave your email and we'll reach out when applications open.
      </p>

      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="your@email.com"
          className="flex-1 bg-transparent border-b border-white/40 text-white placeholder:text-white/40 text-sm py-2 px-1 focus:outline-none focus:border-white/80 transition-colors"
          style={{ fontSize: '16px' }} /* Prevent iOS zoom */
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-white/90 text-sm font-medium hover:text-white transition-colors disabled:opacity-50 ml-2 whitespace-nowrap"
        >
          {loading ? '...' : 'Join waitlist'}
        </button>
      </div>

      {error && (
        <p className="text-pink-200 text-xs mt-2">{error}</p>
      )}
    </div>
  )
}
```

---

### T-10 · ConversationCanvas — Static Shell (no API yet)
**Depends on:** T-07, T-08, T-09, T-02
**Time estimate:** 45 min
**Replit agent instruction:**

```
Create components/ConversationCanvas.tsx with exactly this content.
This version uses a mock response — no API calls yet.

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { Message, VisitorProfile, ConversationState } from '@/types'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import CursorPrompt from './CursorPrompt'
import CTAOverlay from './CTAOverlay'
import clsx from 'clsx'

const INITIAL_PROFILE: VisitorProfile = {
  type: 'unknown',
  context: '',
  identified: false,
  identifiedAtTurn: null,
}

const INITIAL_STATE: ConversationState = {
  messages: [],
  profile: INITIAL_PROFILE,
  turnCount: 0,
  isStreaming: false,
  showCTA: false,
  error: null,
}

// MOCK — will be replaced in T-15
const MOCK_FIRST_MESSAGE = "Hello. I'm MIAW.\n\nBefore I tell you what this master is about — tell me what you work on. What does your day actually look like?"

export default function ConversationCanvas() {
  const [state, setState] = useState<ConversationState>(INITIAL_STATE)
  const [inputValue, setInputValue] = useState('')
  const [conversationStarted, setConversationStarted] = useState(false)
  const [showHowToApply, setShowHowToApply] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messageListRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [state.messages, state.isStreaming])

  // Focus input when conversation starts
  useEffect(() => {
    if (conversationStarted) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [conversationStarted])

  const startConversation = useCallback(async () => {
    if (conversationStarted) return
    setConversationStarted(true)
    setShowHowToApply(false)

    // Add mock first agent message
    const firstMessage: Message = {
      id: nanoid(),
      role: 'assistant',
      content: MOCK_FIRST_MESSAGE,
      timestamp: Date.now(),
    }

    setState(prev => ({
      ...prev,
      messages: [firstMessage],
      turnCount: 1,
    }))
  }, [conversationStarted])

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!conversationStarted && e.key !== 'Tab' && e.key !== 'Escape') {
      startConversation()
    }
  }, [conversationStarted, startConversation])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  const sendMessage = useCallback(async () => {
    const content = inputValue.trim()
    if (!content || state.isStreaming) return

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    setInputValue('')
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isStreaming: true,
      error: null,
    }))

    // MOCK response — T-15 replaces this with real API call
    setTimeout(() => {
      const mockReply: Message = {
        id: nanoid(),
        role: 'assistant',
        content: `Interesting. Tell me more about ${content.split(' ').slice(0, 3).join(' ')}... What tools do you use today that feel like they're holding you back?`,
        timestamp: Date.now(),
      }
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, mockReply],
        isStreaming: false,
        turnCount: prev.turnCount + 1,
        showCTA: prev.turnCount + 1 >= 8,
      }))
    }, 1200)
  }, [inputValue, state.isStreaming])

  const handleWaitlistSubmit = async (email: string) => {
    // T-20 implements this properly
    console.log('Waitlist submission (mock):', email)
    await new Promise(resolve => setTimeout(resolve, 800))
  }

  return (
    <div
      className="gradient-canvas w-screen h-[100dvh] relative flex flex-col overflow-hidden"
      onClick={!conversationStarted ? startConversation : undefined}
    >
      {/* How to apply — top right */}
      {showHowToApply && (
        <div className="absolute top-6 right-8 sm:top-8 sm:right-12 z-10">
          <a
            href="#"
            className="text-white/70 text-sm hover:text-white transition-colors font-sans tracking-wide"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); startConversation(); }}
          >
            How to apply
          </a>
        </div>
      )}

      {/* Pre-conversation: centered logo */}
      {!conversationStarted && (
        <div className="flex-1 flex flex-col items-center justify-center select-none">
          <h1 className="logo-enter font-mono font-bold text-white tracking-wider"
            style={{ fontSize: 'clamp(52px, 10vw, 96px)' }}>
            miaw
          </h1>
          <p className="subtitle-enter text-white/75 font-sans text-lg sm:text-xl mt-3 tracking-wide font-light">
            Master In Intelligent Artificial Worlds
          </p>
        </div>
      )}

      {/* Active conversation */}
      {conversationStarted && (
        <div className="flex-1 flex flex-col min-h-0">

          {/* Logo — small, top left */}
          <div className="flex-shrink-0 px-6 sm:px-12 pt-6 sm:pt-8 pb-2">
            <span className="font-mono font-bold text-white text-xl sm:text-2xl tracking-wider opacity-80">
              miaw
            </span>
          </div>

          {/* Message list */}
          <div
            ref={messageListRef}
            className="message-list flex-1 overflow-y-auto px-6 sm:px-12 py-4 flex flex-col gap-4"
          >
            {state.messages.map((msg, i) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isLatest={i === state.messages.length - 1}
              />
            ))}

            {state.isStreaming && (
              <div className="self-start">
                <TypingIndicator />
              </div>
            )}

            {state.showCTA && !state.isStreaming && (
              <CTAOverlay
                profile={state.profile}
                conversationLength={state.turnCount}
                onSubmit={handleWaitlistSubmit}
              />
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          {!state.showCTA && (
            <div className="flex-shrink-0 px-6 sm:px-12 pb-8 sm:pb-10 pt-2">
              <div className="flex items-end gap-3 border-b border-white/30 pb-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="type here..."
                  className="chat-input flex-1 bg-transparent text-white placeholder:text-white/40 text-sm sm:text-base py-2 focus:outline-none border-b border-transparent"
                  style={{ fontSize: '16px' }}
                  disabled={state.isStreaming}
                />
                <button
                  onClick={sendMessage}
                  disabled={state.isStreaming || !inputValue.trim()}
                  className="text-white/60 hover:text-white transition-colors disabled:opacity-30 pb-2 text-sm"
                  aria-label="Send message"
                >
                  ↵
                </button>
              </div>

              {state.error && (
                <p className="text-pink-200 text-xs mt-2">{state.error}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Cursor prompt — only pre-conversation */}
      {!conversationStarted && (
        <CursorPrompt onClick={startConversation} />
      )}
    </div>
  )
}
```

---

### T-11 · Verify Static UI Renders
**Depends on:** T-10
**Time estimate:** 10 min
**Replit agent instruction:**

```
Run the development server:
npm run dev

Verify the following manually (or describe what you see):
1. Full-screen gradient background loads (purple to pink)
2. "miaw" text appears in monospace font, centered
3. Subtitle "Master In Intelligent Artificial Worlds" appears below
4. "ask me anything" cursor prompt appears bottom-right
5. "How to apply" appears top-right
6. Clicking anywhere OR pressing any key starts the conversation
7. When conversation starts, logo moves top-left (smaller)
8. Mock first message appears with typing delay simulation
9. User can type a message and receive a mock reply
10. After 8 exchanges, CTA overlay appears

If any of these fail, fix them before proceeding. Do NOT move to T-12 until all 10 pass.
```

---

## WEEK 1 CONTINUED — BACKEND & API

### T-12 · RAG Knowledge Retrieval Module
**Depends on:** T-04, T-02
**Time estimate:** 35 min
**Replit agent instruction:**

```
Create lib/rag.ts with exactly:

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { KnowledgeChunk } from '@/types'

// ─── Load all knowledge files at startup ──────────────────────────
interface KnowledgeFile {
  filename: string
  content: string
  chunks: string[]
}

let knowledgeBase: KnowledgeFile[] = []

function loadKnowledge(): KnowledgeFile[] {
  if (knowledgeBase.length > 0) return knowledgeBase

  const knowledgePath = join(process.cwd(), 'knowledge')
  const files = readdirSync(knowledgePath).filter(f => f.endsWith('.md'))

  knowledgeBase = files.map(filename => {
    const content = readFileSync(join(knowledgePath, filename), 'utf-8')
    // Split into chunks by section (## headers) — max ~600 chars each
    const chunks = splitIntoChunks(content)
    return { filename, content, chunks }
  })

  return knowledgeBase
}

function splitIntoChunks(text: string): string[] {
  // Split on ## headers, keep header with its content
  const sections = text.split(/\n(?=##)/)
  const chunks: string[] = []

  for (const section of sections) {
    if (section.trim().length === 0) continue
    // If section > 800 chars, split further by paragraph
    if (section.length > 800) {
      const paragraphs = section.split(/\n\n+/)
      let buffer = ''
      for (const para of paragraphs) {
        if ((buffer + para).length > 700) {
          if (buffer.trim()) chunks.push(buffer.trim())
          buffer = para
        } else {
          buffer += '\n\n' + para
        }
      }
      if (buffer.trim()) chunks.push(buffer.trim())
    } else {
      chunks.push(section.trim())
    }
  }

  return chunks
}

// ─── Keyword scoring ──────────────────────────────────────────────
function scoreChunk(chunk: string, query: string): number {
  const queryWords = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3) // ignore stop words

  const chunkLower = chunk.toLowerCase()
  let score = 0

  for (const word of queryWords) {
    // Exact word match
    const matches = (chunkLower.match(new RegExp(word, 'g')) || []).length
    score += matches * 2
    // Partial match (prefix)
    const partials = (chunkLower.match(new RegExp(word.slice(0, 4), 'g')) || []).length
    score += partials * 0.5
  }

  // Boost if query contains domain keywords
  const domainKeywords = ['architect', 'engineer', 'aec', 'bim', 'design', 'construction', 'building', 'ai', 'model', 'curriculum', 'module', 'cost', 'price', 'duration', 'apply', 'admission']
  for (const kw of domainKeywords) {
    if (query.toLowerCase().includes(kw) && chunkLower.includes(kw)) {
      score += 3
    }
  }

  return score
}

// ─── Main retrieval function ──────────────────────────────────────
export function retrieveContext(
  userMessage: string,
  conversationHistory: string,
  topK: number = 3
): string {
  const kb = loadKnowledge()
  const query = `${userMessage} ${conversationHistory.slice(-200)}` // include recent context

  const scored: { chunk: string; score: number; source: string }[] = []

  for (const file of kb) {
    for (const chunk of file.chunks) {
      const score = scoreChunk(chunk, query)
      if (score > 0) {
        scored.push({ chunk, score, source: file.filename })
      }
    }
  }

  // Sort by score descending, take top K
  const topChunks = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)

  if (topChunks.length === 0) {
    // Return general overview if nothing matches
    return kb[0]?.chunks[0] || ''
  }

  return topChunks
    .map(c => `[${c.source}]\n${c.chunk}`)
    .join('\n\n---\n\n')
}

// ─── Export for testing ───────────────────────────────────────────
export function getKnowledgeStats() {
  const kb = loadKnowledge()
  return {
    files: kb.length,
    totalChunks: kb.reduce((acc, f) => acc + f.chunks.length, 0),
  }
}
```

---

### T-13 · Visitor Profile Inference Module
**Depends on:** T-02
**Time estimate:** 25 min
**Replit agent instruction:**

```
Create lib/profile.ts with exactly:

import { Message, VisitorProfile, VisitorType } from '@/types'

const TYPE_SIGNALS: Record<VisitorType, string[]> = {
  architect: ['architect', 'architecture', 'design', 'building', 'facade', 'floor plan', 'revit', 'autocad', 'rhino', 'sketchup', 'render', 'project', 'client', 'studio', 'firm', 'aia', 'riba'],
  engineer: ['engineer', 'engineering', 'structural', 'civil', 'mep', 'calculation', 'load', 'stress', 'analysis', 'simulation', 'robot', 'tekla', 'staad'],
  researcher: ['research', 'phd', 'paper', 'academic', 'university', 'lab', 'professor', 'thesis', 'study', 'publish', 'citation', 'dataset'],
  developer: ['developer', 'software', 'code', 'programming', 'python', 'javascript', 'api', 'backend', 'frontend', 'ml', 'machine learning', 'model', 'deploy', 'github', 'engineer'],
  student: ['student', 'studying', 'degree', 'university', 'college', 'graduation', 'master', 'bachelor', 'semester', 'professor', 'class'],
  urban_planner: ['urban', 'city', 'planning', 'municipality', 'zoning', 'gis', 'infrastructure', 'transport', 'public space', 'masterplan'],
  unknown: [],
}

function extractUserText(messages: Message[]): string {
  return messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ')
}

function scoreType(text: string, type: VisitorType): number {
  const signals = TYPE_SIGNALS[type]
  let score = 0
  for (const signal of signals) {
    if (text.includes(signal)) {
      score += signal.split(' ').length > 1 ? 3 : 1 // multi-word signals score higher
    }
  }
  return score
}

export function inferProfile(
  messages: Message[],
  currentProfile: VisitorProfile,
  currentTurn: number
): VisitorProfile {
  const userText = extractUserText(messages)
  if (!userText || userText.length < 10) return currentProfile

  // Score each type
  const scores: Record<VisitorType, number> = {
    architect: scoreType(userText, 'architect'),
    engineer: scoreType(userText, 'engineer'),
    researcher: scoreType(userText, 'researcher'),
    developer: scoreType(userText, 'developer'),
    student: scoreType(userText, 'student'),
    urban_planner: scoreType(userText, 'urban_planner'),
    unknown: 0,
  }

  // Find best match
  const sorted = (Object.entries(scores) as [VisitorType, number][])
    .sort((a, b) => b[1] - a[1])

  const [bestType, bestScore] = sorted[0]
  const identified = bestScore >= 2

  // Build context summary from first user message
  const firstUserMessage = messages.find(m => m.role === 'user')?.content || ''
  const context = firstUserMessage.length > 120
    ? firstUserMessage.slice(0, 117) + '...'
    : firstUserMessage

  return {
    type: identified ? bestType : 'unknown',
    context,
    identified,
    identifiedAtTurn: identified && !currentProfile.identified ? currentTurn : currentProfile.identifiedAtTurn,
  }
}

export function profileSummary(profile: VisitorProfile): string {
  if (!profile.identified) return 'Profile: not yet identified. Continue conversation to learn more.'
  return `Profile: ${profile.type}. Context: "${profile.context}"`
}
```

---

### T-14 · System Prompt Builder
**Depends on:** T-02
**Time estimate:** 20 min
**Replit agent instruction:**

```
Create lib/systemPrompt.ts with exactly:

import { VisitorProfile } from '@/types'
import { profileSummary } from './profile'

export function buildSystemPrompt(
  ragContext: string,
  profile: VisitorProfile,
  turnCount: number
): string {
  const ctaPhase = turnCount >= 7

  return `You are the MIAW agent — the first point of contact for a new worldwide master's program focused on AI world models applied to the AEC sector (Architecture, Engineering, Construction).

MIAW stands for Master In Intelligent Artificial Worlds.

YOUR PERSONA:
- Intellectually curious and technically precise
- Direct, never verbose, never use marketing speak or buzzwords
- You demonstrate intelligence by being intelligent — you don't say "we're cutting-edge", you prove it through how you talk
- You're genuinely interested in who this person is before selling anything
- You have a slight edge — you know this program is different and you don't need to oversell it

CONVERSATION RULES:
1. If turnCount is 0 or this is your first response: introduce yourself very briefly (1 sentence), then ask who the visitor is and what they work on. Nothing else. One question only.
2. For subsequent turns: always respond directly to what they said, then ask exactly ONE follow-up question. Never ask multiple questions.
3. Keep responses under 100 words UNLESS they ask a specific technical question, in which case go as deep as needed.
4. Never invent facts about the master. If you don't know something, say: "We're still defining that — and honestly, the right people could help shape it."
5. Shape your examples and references to their professional context (detected profile: ${profile.type}).
6. Never use em-dashes in bullet lists. Prefer plain prose.
7. Use line breaks generously — this is a conversation, not an essay.

${ctaPhase ? `CTA PHASE (turn ${turnCount}): You've had a real conversation now. Naturally — not forcefully — mention that people like them are exactly who the first cohort is being built for, and ask if they'd like to join the waitlist. Make it feel like an invitation, not a form.` : ''}

CURRENT VISITOR PROFILE:
${profileSummary(profile)}

MASTER KNOWLEDGE BASE (use this to answer questions accurately):
${ragContext || 'No specific context retrieved — answer from general MIAW knowledge above.'}

CURRENT TURN: ${turnCount}

Remember: you are not a chatbot. You are the master itself, speaking.`
}
```

---

### T-15 · Chat API Route with Streaming
**Depends on:** T-12, T-13, T-14, T-02
**Time estimate:** 45 min
**Replit agent instruction:**

```
Create app/api/chat/route.ts with exactly:

import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { retrieveContext } from '@/lib/rag'
import { buildSystemPrompt } from '@/lib/systemPrompt'
import { ChatRequestBody } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Simple in-memory rate limiter ───────────────────────────────
// Replaced by Upstash Redis in T-21
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 30       // requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000  // 1 hour in ms

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  record.count += 1
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

export async function POST(req: NextRequest) {
  // ─── Get client IP ────────────────────────────────────────────
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'

  // ─── Rate limit check ─────────────────────────────────────────
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'rate_limit', message: "You've had a good conversation. Come back in an hour." },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
    )
  }

  // ─── Parse body ───────────────────────────────────────────────
  let body: ChatRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { messages, profile, turnCount } = body

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'missing_messages' }, { status: 400 })
  }

  // ─── RAG retrieval ────────────────────────────────────────────
  const lastUserMessage = messages.filter(m => m.role === 'user').at(-1)?.content || ''
  const conversationHistory = messages.map(m => m.content).join(' ')
  const ragContext = retrieveContext(lastUserMessage, conversationHistory, 3)

  // ─── System prompt ────────────────────────────────────────────
  const systemPrompt = buildSystemPrompt(ragContext, profile, turnCount)

  // ─── Anthropic streaming ──────────────────────────────────────
  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages: messages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    // Create a ReadableStream to pipe tokens to the client
    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ delta: chunk.delta.text }) + '\n'
              controller.enqueue(encoder.encode(data))
            }
          }
          controller.close()
        } catch (err) {
          controller.error(err)
        }
      },
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-RateLimit-Remaining': String(remaining),
      },
    })
  } catch (err: unknown) {
    console.error('[MIAW Chat API Error]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: 'api_error', message },
      { status: 500 }
    )
  }
}

// ─── Disable body parser for streaming ───────────────────────────
export const runtime = 'nodejs'
export const maxDuration = 30
```

---

### T-16 · Wire Real API into ConversationCanvas
**Depends on:** T-15, T-10, T-13
**Time estimate:** 40 min
**Replit agent instruction:**

```
Update components/ConversationCanvas.tsx.

Replace the sendMessage function and the MOCK_FIRST_MESSAGE constant with real API calls.

REMOVE these lines:
- const MOCK_FIRST_MESSAGE = ...
- The setTimeout mock in sendMessage

ADD this import at the top of the file:
import { inferProfile } from '@/lib/profile'

REPLACE the startConversation function body with:

const startConversation = useCallback(async () => {
  if (conversationStarted) return
  setConversationStarted(true)
  setShowHowToApply(false)
  setState(prev => ({ ...prev, isStreaming: true }))

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [],
        profile: INITIAL_PROFILE,
        turnCount: 0,
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: err.message || 'Failed to connect. Try again.',
      }))
      return
    }

    await streamResponse(response, [])
  } catch {
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: 'Connection failed. Check your internet and try again.',
    }))
  }
}, [conversationStarted])


ADD this helper function (before sendMessage):

const streamResponse = useCallback(async (
  response: Response,
  existingMessages: Message[]
) => {
  const assistantMessage: Message = {
    id: nanoid(),
    role: 'assistant',
    content: '',
    timestamp: Date.now(),
  }

  setState(prev => ({
    ...prev,
    messages: [...existingMessages, assistantMessage],
    isStreaming: true,
  }))

  const reader = response.body?.getReader()
  if (!reader) return

  const decoder = new TextDecoder()
  let fullContent = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n').filter(Boolean)

      for (const line of lines) {
        try {
          const parsed = JSON.parse(line)
          if (parsed.delta) {
            fullContent += parsed.delta
            setState(prev => ({
              ...prev,
              messages: prev.messages.map(m =>
                m.id === assistantMessage.id
                  ? { ...m, content: fullContent }
                  : m
              ),
            }))
          }
        } catch {
          // Partial JSON line, ignore
        }
      }
    }
  } finally {
    reader.releaseLock()
    setState(prev => {
      const newTurnCount = prev.turnCount + 1
      const allMessages = [...existingMessages, { ...assistantMessage, content: fullContent }]
      const newProfile = inferProfile(allMessages, prev.profile, newTurnCount)
      return {
        ...prev,
        isStreaming: false,
        turnCount: newTurnCount,
        profile: newProfile,
        showCTA: newTurnCount >= 8,
      }
    })
  }
}, [])


REPLACE the sendMessage function with:

const sendMessage = useCallback(async () => {
  const content = inputValue.trim()
  if (!content || state.isStreaming) return

  const userMessage: Message = {
    id: nanoid(),
    role: 'user',
    content,
    timestamp: Date.now(),
  }

  const newMessages = [...state.messages, userMessage]
  setInputValue('')
  setState(prev => ({
    ...prev,
    messages: newMessages,
    isStreaming: true,
    error: null,
  }))

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        profile: state.profile,
        turnCount: state.turnCount,
      }),
    })

    if (response.status === 429) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: "You've had a good conversation. Come back in a bit.",
      }))
      return
    }

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: err.message || 'Something went wrong. Try again.',
      }))
      return
    }

    await streamResponse(response, newMessages)

  } catch {
    setState(prev => ({
      ...prev,
      isStreaming: false,
      error: 'Connection failed. Try again.',
    }))
  }
}, [inputValue, state, streamResponse])
```

---

### T-17 · Verify Full End-to-End Conversation
**Depends on:** T-16
**Time estimate:** 15 min
**Replit agent instruction:**

```
ANTHROPIC_API_KEY must be set in .env.local before running this test.

Run: npm run dev

Test the following scenarios and verify each passes:

TEST 1 — First load:
- Open http://localhost:3000
- Gradient renders, logo centered, cursor prompt visible
- Press any key → conversation starts
- Agent sends first message within 2 seconds (streaming tokens visible)
- Agent's first message asks who you are / what you work on

TEST 2 — Conversation flow:
- Reply: "I'm an architect working on residential projects in Madrid"
- Agent should respond referencing architecture/AEC
- Reply 2-3 more times about your work
- Check that responses stay contextual and under ~100 words per turn

TEST 3 — RAG verification:
- Ask: "What modules does the master have?"
- Agent should describe the specific modules from curriculum.md accurately

TEST 4 — CTA trigger:
- After 8 total turns, the waitlist form should appear
- The input bar should hide when CTA is shown

TEST 5 — Error state:
- Temporarily set ANTHROPIC_API_KEY to an invalid value
- Conversation should show error message, not crash

Fix any failures before proceeding to Week 2 tasks.
```

---

## WEEK 2 — POLISH & INTEGRATIONS

### MILESTONE W2: Analytics tracking, waitlist capture, mobile-ready, rate limiting hardened.

---

### T-18 · PostHog Analytics Setup
**Depends on:** T-17
**Time estimate:** 30 min
**Replit agent instruction:**

```
Create lib/analytics.ts with exactly:

'use client'

import posthog from 'posthog-js'

let initialized = false

export function initPostHog() {
  if (initialized || typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    capture_pageview: false,  // We track manually
    capture_pageleave: true,
    autocapture: false,       // No accidental PII capture
    persistence: 'memory',    // Don't persist to localStorage — GDPR safe
  })

  initialized = true
}

export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null>
) {
  if (typeof window === 'undefined') return
  if (!initialized) initPostHog()
  posthog.capture(event, { ...properties, product: 'miaw_phase0' })
}

// ─── Typed event helpers ──────────────────────────────────────────
export const analytics = {
  pageLoaded: (referrer: string) =>
    trackEvent('page_loaded', { referrer: referrer || 'direct' }),

  conversationStarted: () =>
    trackEvent('conversation_started'),

  conversationTurn: (turn: number, visitorType: string, messageLength: number) =>
    trackEvent('conversation_turn', { turn_number: turn, visitor_type: visitorType, message_length: messageLength }),

  profileIdentified: (visitorType: string, turnWhenIdentified: number) =>
    trackEvent('profile_identified', { visitor_type: visitorType, turn_when_identified: turnWhenIdentified }),

  ctaShown: (turnNumber: number, visitorType: string) =>
    trackEvent('cta_shown', { turn_number: turnNumber, visitor_type: visitorType }),

  waitlistSubmitted: (visitorType: string, emailDomainTld: string, conversationLength: number) =>
    trackEvent('waitlist_submitted', {
      visitor_type: visitorType,
      email_domain_tld: emailDomainTld,
      conversation_length: conversationLength,
    }),

  errorShown: (errorType: string, turnNumber: number) =>
    trackEvent('error_shown', { error_type: errorType, turn_number: turnNumber }),
}


Now update components/ConversationCanvas.tsx to add analytics:

ADD this import:
import { analytics } from '@/lib/analytics'

ADD this useEffect (runs once on mount):
useEffect(() => {
  analytics.pageLoaded(document.referrer)
}, [])

In startConversation, after setConversationStarted(true), ADD:
analytics.conversationStarted()

In streamResponse, after the final setState, ADD:
analytics.conversationTurn(newTurnCount, newProfile.type, fullContent.length)
if (newProfile.identified && !prev.profile.identified) {
  analytics.profileIdentified(newProfile.type, newTurnCount)
}
if (newTurnCount >= 8) {
  analytics.ctaShown(newTurnCount, newProfile.type)
}
```

---

### T-19 · Waitlist API Route
**Depends on:** T-02
**Time estimate:** 30 min
**Replit agent instruction:**

```
Create app/api/waitlist/route.ts with exactly:

import { NextRequest, NextResponse } from 'next/server'
import { WaitlistRequestBody } from '@/types'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || 'Waitlist'

async function saveToAirtable(data: WaitlistRequestBody): Promise<void> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    // Fallback: log to console in dev
    console.log('[WAITLIST] Airtable not configured. Would have saved:', data)
    return
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        Email: data.email,
        'Visitor Type': data.visitorType,
        'Conversation Length': data.conversationLength,
        'Referrer': data.referrer || 'direct',
        'Submitted At': new Date().toISOString(),
        Source: 'MIAW Phase 0 Agent',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Airtable error: ${response.status} — ${error}`)
  }
}

function extractEmailDomainTld(email: string): string {
  try {
    const domain = email.split('@')[1] || ''
    const parts = domain.split('.')
    return parts.slice(-2).join('.')  // e.g. "gmail.com"
  } catch {
    return 'unknown'
  }
}

export async function POST(req: NextRequest) {
  let body: WaitlistRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  const { email, visitorType, conversationLength, referrer } = body

  // Validate email
  if (!email || !email.includes('@') || email.length > 254) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }

  try {
    await saveToAirtable({ email, visitorType, conversationLength, referrer })

    return NextResponse.json({
      success: true,
      domainTld: extractEmailDomainTld(email), // returned for analytics, not PII
    })
  } catch (err) {
    console.error('[WAITLIST ERROR]', err)
    return NextResponse.json({ error: 'save_failed' }, { status: 500 })
  }
}

export const runtime = 'nodejs'
```

---

### T-20 · Wire Waitlist into CTAOverlay
**Depends on:** T-19, T-18
**Time estimate:** 20 min
**Replit agent instruction:**

```
Update components/ConversationCanvas.tsx.

REPLACE the handleWaitlistSubmit function with:

const handleWaitlistSubmit = async (email: string) => {
  const response = await fetch('/api/waitlist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      visitorType: state.profile.type,
      conversationLength: state.turnCount,
      referrer: document.referrer || undefined,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to submit')
  }

  const data = await response.json()

  // Analytics — use domain TLD, not email
  analytics.waitlistSubmitted(
    state.profile.type,
    data.domainTld || 'unknown',
    state.turnCount
  )
}
```

---

### T-21 · Upstash Redis Rate Limiting
**Depends on:** T-15
**Time estimate:** 25 min
**Replit agent instruction:**

```
Update app/api/chat/route.ts to use Upstash Redis when available.

ADD this import at the top (after existing imports):
import { Redis } from '@upstash/redis'

ADD this after the Anthropic client initialization:

// ─── Upstash Redis rate limiter (production) ──────────────────────
let redis: Redis | null = null
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  }
} catch {
  console.warn('[MIAW] Upstash Redis not configured — using in-memory rate limiting')
}

REPLACE the checkRateLimit function with:

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const key = `miaw:rl:${ip}`
  const LIMIT = 30
  const WINDOW = 3600 // 1 hour in seconds

  // Use Redis if available
  if (redis) {
    try {
      const count = await redis.incr(key)
      if (count === 1) {
        await redis.expire(key, WINDOW)
      }
      const allowed = count <= LIMIT
      return { allowed, remaining: Math.max(0, LIMIT - count) }
    } catch (err) {
      console.error('[Redis rate limit error]', err)
      // Fall through to in-memory on Redis failure
    }
  }

  // In-memory fallback
  const now = Date.now()
  const record = rateLimitMap.get(ip)
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW * 1000 })
    return { allowed: true, remaining: LIMIT - 1 }
  }
  if (record.count >= LIMIT) return { allowed: false, remaining: 0 }
  record.count += 1
  return { allowed: true, remaining: LIMIT - record.count }
}

Update the POST handler to use await on checkRateLimit:
const { allowed, remaining } = await checkRateLimit(ip)
```

---

### T-22 · Mobile Viewport Fixes
**Depends on:** T-10
**Time estimate:** 30 min
**Replit agent instruction:**

```
The main issue on mobile is the virtual keyboard pushing content.
Update components/ConversationCanvas.tsx with these specific fixes.

ADD this useEffect for visualViewport (keyboard handling):

useEffect(() => {
  if (typeof window === 'undefined') return

  const handleResize = () => {
    // When keyboard opens, visualViewport.height decreases
    // We need the message list to shrink, not be hidden
    const viewport = window.visualViewport
    if (!viewport) return

    const keyboardHeight = window.innerHeight - viewport.height
    document.documentElement.style.setProperty(
      '--keyboard-height',
      `${keyboardHeight}px`
    )
  }

  window.visualViewport?.addEventListener('resize', handleResize)
  return () => window.visualViewport?.removeEventListener('resize', handleResize)
}, [])


ADD to globals.css:

/* Mobile keyboard compensation */
.input-bar {
  padding-bottom: calc(env(safe-area-inset-bottom) + 1.5rem + var(--keyboard-height, 0px));
}

@supports (height: 100dvh) {
  .gradient-canvas {
    height: 100dvh;
  }
}


UPDATE the outer div className in ConversationCanvas to add:
style={{ height: '100dvh' }}
Remove h-[100dvh] from className and use the style prop instead for better browser support.


UPDATE the input div container to use the mobile-safe class:
Replace the existing pb-8 sm:pb-10 div className with:
"flex-shrink-0 px-6 sm:px-12 input-bar pt-2"


ADD touch target sizing to the send button:
className="text-white/60 hover:text-white transition-colors disabled:opacity-30 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-sm"


VERIFY on mobile by opening Chrome DevTools device toolbar:
- iPhone SE (375px): gradient fills screen, no overflow
- Pixel 7 (412px): input stays above keyboard
- Landscape: conversation panel fills full width, no horizontal scroll
```

---

### T-23 · Error Boundary & Graceful Degradation
**Depends on:** T-16
**Time estimate:** 25 min
**Replit agent instruction:**

```
Create components/ErrorBoundary.tsx with exactly:

'use client'

import { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: string }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="gradient-canvas w-screen h-screen flex flex-col items-center justify-center">
          <p className="font-mono text-white text-4xl font-bold mb-4">miaw</p>
          <p className="text-white/70 text-sm mb-6">Something went wrong. The agent is taking a moment.</p>
          <button
            onClick={() => window.location.reload()}
            className="text-white border border-white/30 px-6 py-2 rounded-full text-sm hover:bg-white/10 transition-colors"
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}


Update app/page.tsx to wrap with ErrorBoundary:

import ConversationCanvas from '@/components/ConversationCanvas'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function Home() {
  return (
    <ErrorBoundary>
      <ConversationCanvas />
    </ErrorBoundary>
  )
}


Update ConversationCanvas to show inline errors gracefully.
In the isStreaming state and error rendering section, ensure:
- API timeout (no response in 12s): show retry button, not blank screen
- Network error: show "Connection lost. Check your internet connection."
- 429 rate limit: show "You've had a good conversation. Come back in an hour."

ADD this timeout logic to the streamResponse call in sendMessage:

const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 12000)

const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ... }),
  signal: controller.signal,
})
clearTimeout(timeout)
```

---

## WEEK 3 — HARDENING & LAUNCH

### MILESTONE W3: Lighthouse > 90, prod deployed, custom domain, live.

---

### T-24 · OG Image & SEO
**Depends on:** T-05
**Time estimate:** 20 min
**Replit agent instruction:**

```
Create app/api/og/route.tsx for dynamic OG image generation using Next.js ImageResponse:

import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #a78bfa 0%, #818cf8 30%, #c084fc 60%, #f472b6 100%)',
          fontFamily: 'monospace',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 800, color: 'white', letterSpacing: '0.05em' }}>
          miaw
        </div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.8)', marginTop: 16, fontFamily: 'sans-serif' }}>
          Master In Intelligent Artificial Worlds
        </div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 8, fontFamily: 'sans-serif' }}>
          AI world models for the built environment
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}


Update app/layout.tsx metadata to use the dynamic OG route:
Change og:image url to '/api/og'

Update app/layout.tsx to add canonical URL and robots:
export const metadata: Metadata = {
  ...existing,
  metadataBase: new URL('https://miaw.ai'), // change to actual domain
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}
```

---

### T-25 · Performance Audit & Bundle Check
**Depends on:** T-23
**Time estimate:** 30 min
**Replit agent instruction:**

```
Run a production build and verify bundle sizes:

npm run build

Verify in the build output:
- app/page.tsx: First Load JS should be < 100kB
- No @anthropic-ai/sdk in client bundle (it's server-only)
- No large unexpected dependencies

If @anthropic-ai/sdk appears in client bundle:
Add to the top of lib/claude.ts: 'server only'
AND ensure all files importing from @anthropic-ai/sdk are in:
- app/api/*/route.ts (server-only)
- lib/ files that are only imported by API routes

Common issue: if ConversationCanvas imports anything from lib/ that imports Anthropic SDK,
the SDK leaks to the client. Verify the import chain:
ConversationCanvas.tsx → lib/profile.ts (OK — no SDK)
ConversationCanvas.tsx → lib/analytics.ts (OK — no SDK)
app/api/chat/route.ts → lib/rag.ts (OK — server only)
app/api/chat/route.ts → lib/systemPrompt.ts (OK — server only)

Run Lighthouse audit on the built app:
npx serve@latest out (after next export) OR deploy to Vercel and run Lighthouse there.

Target scores:
- Performance: > 88
- Accessibility: > 92
- Best Practices: > 95
- SEO: > 90

Fix any accessibility issues found (focus trapping, ARIA labels, color contrast on input).
```

---

### T-26 · Vercel Deployment & Environment Variables
**Depends on:** T-25
**Time estimate:** 20 min
**Replit agent instruction:**

```
Deploy to Vercel. Execute these steps:

1. Ensure vercel.json exists in root:
{
  "functions": {
    "app/api/chat/route.ts": { "maxDuration": 30 },
    "app/api/waitlist/route.ts": { "maxDuration": 10 }
  }
}

2. Install Vercel CLI if not installed: npm i -g vercel

3. Run: vercel

4. On the Vercel dashboard, go to Settings > Environment Variables and add:
   ANTHROPIC_API_KEY = [your key]
   NEXT_PUBLIC_POSTHOG_KEY = [your key]
   NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com
   UPSTASH_REDIS_REST_URL = [your url]
   UPSTASH_REDIS_REST_TOKEN = [your token]
   AIRTABLE_API_KEY = [your key]
   AIRTABLE_BASE_ID = [your base id]
   AIRTABLE_TABLE_NAME = Waitlist

5. Trigger a production deployment: vercel --prod

6. Verify the deployment URL works end-to-end:
   - Open the Vercel URL
   - Start conversation
   - Send 3 messages
   - Check Vercel logs (vercel logs) for any API errors
   - Check PostHog dashboard for events
   - Check Airtable for test waitlist entries (if configured)
```

---

### T-27 · Final QA Checklist
**Depends on:** T-26
**Time estimate:** 45 min
**Replit agent instruction:**

```
Execute this full QA checklist. Fix every failure before marking launch-ready.

VISUAL QA:
[ ] Gradient renders correctly on Chrome, Safari, Firefox
[ ] Logo animation plays once on load (not looping)
[ ] "ask me anything" cursor is visible and positioned correctly bottom-right
[ ] "How to apply" is visible top-right before conversation starts
[ ] Both elements disappear when conversation starts
[ ] Logo moves to top-left (smaller) when conversation starts
[ ] Message bubbles animate in (fade up) as they appear
[ ] Typing indicator shows while agent is generating
[ ] CTA appears after turn 8 without layout break
[ ] No content overflows viewport on any screen size

CONVERSATION QA:
[ ] Agent sends first message within 3 seconds
[ ] First message asks about the visitor (not a generic greeting)
[ ] Streaming works (tokens appear one by one, not all at once)
[ ] User can send messages with Enter key
[ ] User can send messages with the ↵ button
[ ] Send button is disabled while agent is typing
[ ] After 8 turns, CTA appears and input bar hides

API QA:
[ ] /api/chat returns 429 after 30 requests from same IP
[ ] /api/chat returns streaming response (Content-Type: text/event-stream)
[ ] /api/waitlist saves to Airtable (or logs if not configured)
[ ] /api/waitlist rejects invalid emails (no @)

MOBILE QA (use Chrome DevTools device emulation):
[ ] iPhone SE (375x667): full gradient, text readable, no overflow
[ ] iPhone 14 Pro (393x852): keyboard doesn't cover input
[ ] Pixel 7 (412x915): same
[ ] Tap targets are >= 44px

ANALYTICS QA:
[ ] Open PostHog Live Events
[ ] Load the page → see page_loaded event
[ ] Start conversation → see conversation_started event
[ ] Send a message → see conversation_turn event
[ ] Submit email → see waitlist_submitted event (with domain TLD, not full email)
[ ] Verify NO message content is tracked

PERFORMANCE QA:
[ ] Run Lighthouse on production URL
[ ] Performance score: >= 88
[ ] No console errors in production
[ ] No 404s for any assets (check Network tab)
```

---

### T-28 · System Prompt Tuning (Human Task, Not Agent)
**Depends on:** T-27
**Time estimate:** 2-4 hours of conversation testing
**Note:** This task is done by a human, not the Replit agent.

```
HUMAN TASK — Do not feed to Replit agent.

Run these test conversations on the production URL. For each, evaluate the agent's response quality.

PERSONA 1 — Madrid architect:
Turn 1: "I'm an architect at a firm in Madrid, mostly residential"
Turn 2: "We do a lot of single-family homes, some small multifamily"
Turn 3: "I use Revit and SketchUp, dabble with Grasshopper"
Turn 4: "I'm frustrated that AI tools don't understand architectural constraints"

Expected: agent should discuss Module 3 (generative design with constraints), ask about what types of constraints matter to them.

PERSONA 2 — ML researcher:
Turn 1: "I do ML research, mostly computer vision and 3D reconstruction"
Turn 2: "I work on NeRF and Gaussian splatting"
Turn 3: "I'm interested in applying this to built environments"

Expected: agent should demonstrate knowledge of NeRF/GS, connect to AEC applications, discuss Module 4.

PERSONA 3 — Unknown / vague:
Turn 1: "just curious what this is"
Turn 2: "I work in tech"
Turn 3: "I don't really have a background in architecture"

Expected: agent should stay curious, not assume, eventually ask what draws them to physical/built environments.

EVALUATION CRITERIA:
- Does the agent ask ONE question per turn? (never multiple)
- Does it stay under ~100 words?
- Does it reference specific master content accurately?
- Does the CTA feel natural at turn 8, not forced?
- Does it ever make up facts not in the knowledge base?

AFTER TESTING:
Update lib/systemPrompt.ts with any refinements needed.
Update knowledge/*.md with any missing information the agent needs.
```

---

## APPENDIX A — ENVIRONMENT VARIABLE REFERENCE

| Variable | Where to get | Required |
|---|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com | ✅ Critical |
| `NEXT_PUBLIC_POSTHOG_KEY` | app.posthog.com → Project Settings | Optional |
| `NEXT_PUBLIC_POSTHOG_HOST` | app.posthog.com | Optional |
| `UPSTASH_REDIS_REST_URL` | console.upstash.com → Redis → REST API | Optional (in-memory fallback) |
| `UPSTASH_REDIS_REST_TOKEN` | console.upstash.com → Redis → REST API | Optional |
| `AIRTABLE_API_KEY` | airtable.com → Account → Developer Hub | Optional (logs to console) |
| `AIRTABLE_BASE_ID` | airtable.com → API docs → your base | Optional |
| `AIRTABLE_TABLE_NAME` | Name of table in your Airtable base | Optional (defaults to "Waitlist") |

## APPENDIX B — TASK DEPENDENCY GRAPH

```
T-01 Bootstrap
 ├── T-02 Types
 │    ├── T-06 TypingIndicator
 │    ├── T-07 MessageBubble
 │    ├── T-09 CTAOverlay
 │    ├── T-12 RAG
 │    ├── T-13 Profile
 │    └── T-19 Waitlist API
 ├── T-03 CSS/Tailwind
 │    ├── T-06, T-07, T-08, T-09
 │    └── T-22 Mobile fixes
 └── T-04 Knowledge Base
      └── T-12 RAG
           └── T-14 System Prompt
                └── T-15 Chat API Route
                     └── T-16 Wire API → Canvas
                          └── T-17 E2E Verify ✅
                               ├── T-18 Analytics
                               ├── T-20 Waitlist Wire
                               ├── T-21 Redis Rate Limit
                               ├── T-23 Error Boundary
                               └── T-25 Build Audit
                                    └── T-26 Vercel Deploy
                                         └── T-27 Final QA ✅
```

## APPENDIX C — AIRTABLE SETUP

Create a base called "MIAW" with a table called "Waitlist" with these fields:
- **Email** (Email field type)
- **Visitor Type** (Single select: architect, engineer, researcher, developer, student, urban_planner, unknown)
- **Conversation Length** (Number)
- **Referrer** (Single line text)
- **Submitted At** (Date/time, ISO format)
- **Source** (Single line text)

---

*MIAW Phase 0 — Implementation Plan v2.0 · 28 tasks · 3 weeks · May 2026*
