# UI/UX Design Guide

> Design principles, decisions made, open questions, and future work.

---

## 1. Design Philosophy

The MIAW website has one constraint that overrides all others: **the medium must be the message**.

A program about AI-native practice for architects cannot have a traditional landing page. The standard template (hero → features → pricing → CTA) would immediately signal that MIAW is another course in an already crowded category. The design decision to make the entire experience a conversation with an AI is itself a demonstration of the program's thesis.

This means every design decision must serve the conversation — not distract from it, not decorate it, not compete with it.

---

## 2. Core Design Principles

### P1: Remove, don't add
If content or UI element can be removed without breaking the conversation, it should be. Every pixel that isn't the gradient, the logo, or the conversation is a question: why is this here?

### P2: Slow is trustworthy
The gradient animates slowly (45-second cycle). The logo enters slowly. The streaming text appears at human conversation pace. Speed signals urgency; slowness signals confidence. MIAW doesn't need to rush.

### P3: Typography does the work
Two typefaces. Press Start 2P for "miaw" (the pixel font communicates: we are building something new, from first principles, not building on the existing category). Inter Light 300 for everything else (precision, clarity, no decoration).

### P4: The AI is not a chatbot
Visually, there is no chat interface. No conversation header, no timestamps, no read receipts, no avatar. The agent speaks as plain text on the gradient. This removes all associations with customer service chatbots.

### P5: Interaction reveals, not navigation
The visitor doesn't navigate to information. The conversation reveals it. The sequence of what is revealed is controlled by the AI, not by tabs or sections. This is appropriate because the program itself is deeply sequenced — it knows what you need to know before you do.

---

## 3. Design Decisions Made

### 3.1 The Gradient

**Decision:** Four radial blobs in blue/purple/pink moving slowly via CSS `@property`.

**Rationale:** The gradient must feel alive without being distracting. Static gradients feel like a stock template. Animated gradients with fast movement feel cheap or sales-y. The 45-second cycle creates the sensation of ambient life without drawing attention.

**Color palette:**
- Left: `#5a78e8` (blue, cool intelligence)
- Right: `#e050a8` / `#f055b8` (pink, creativity, energy)
- Top: `#7ab2f8` (light blue, elevation)
- Base: `#8e72d5` (purple, synthesis of the two disciplines)

This is not accidental — blue = technology/AI, pink = architecture/design, purple = MIAW = where both meet.

### 3.2 The Logo Transition

**Decision:** Framer Motion shared layout animation (`layoutId="logo"`) — logo physically moves from center to top-left when conversation starts, and back when reset.

**Rationale:** The logo is the only persistent UI element that bridges the two states (landing / conversation). Making it move rather than disappear-and-reappear preserves spatial memory — the user always knows where they are. The animation communicates: you clicked, something real happened, the environment reorganized around you.

**Technical note:** This required Framer Motion because CSS `transition` cannot animate between two DOM elements in different parent containers. FLIP animation via `layoutId` is the correct primitive.

### 3.3 Message Bubbles

**Decision:** Assistant messages are plain text, left-aligned. User messages are in a frosted glass pill (white/10 backdrop-blur), right-aligned.

**Rationale:** The asymmetry is intentional. The AI's text blends into the gradient — it's speaking from within the environment. The user's text is contained (a pill) — they are a visitor. This reinforces the spatial metaphor: you are in the AI's world, not the other way around.

### 3.4 Input Bar

**Decision:** Borderless text input with only a bottom border, send button at right. No placeholder icon, no attachment, no emoji. Disabled during streaming.

**Rationale:** Maximum simplicity. The input should feel like typing on air. The only affordance is the bottom line (enough to indicate "type here"). The enter-key symbol (↵) as the send button is universally understood and takes no space.

### 3.5 CTA Overlay

**Decision:** Email field appears inline in the message flow as a component, not a modal.

**Rationale:** A modal would break the spatial coherence of the conversation. The CTA feels like the AI handing you a form to sign, in-context, rather than a popup that interrupts. The transition is: the AI says the right thing → the form appears → it's already part of the flow.

### 3.6 Streaming Cursor

**Decision:** A blinking block cursor appears at the end of the last AI message while streaming. Disappears when streaming completes.

**Rationale:** Without the cursor, there is ambiguity: is the AI done or is it still thinking? The blinking cursor (rendered as a Framer Motion animated span, not a CSS cursor) provides clear real-time feedback that content is being generated. It is a classic terminal metaphor — appropriate for a technically-minded audience.

---

## 4. Open Design Decisions

These have not been resolved and represent active design questions for the next iteration.

### 4.1 Mobile experience redesign

**Current state:** The site is functional on mobile but not optimized. Font sizes scale, the input handles the keyboard offset, but the message layout is a direct port of the desktop design.

**Open question:** Should mobile have a different interaction model? On mobile, "click anywhere" is obvious (tap) but the cursor prompt ("ask me anything") doesn't translate spatially. Should mobile show a large tap-to-start button instead?

**Considerations:**
- 40–60% of first-time visitors are likely mobile
- The conversation is text-heavy — small screens constrain reading comfort
- The gradient is less impactful on small screens

**Design options:**
1. Mobile-optimized layout with bottom sheet input (native feel)
2. Identical to desktop but with larger touch targets
3. Progressive: desktop gets the immersive full-page version; mobile gets a lighter, more legible version

### 4.2 Conversation restart UX

**Current state:** Clicking the "miaw" logo resets the conversation with no confirmation prompt.

**Open question:** Should there be a reset confirmation? Currently a mis-click destroys the conversation. However, a confirmation modal disrupts the minimal aesthetic.

**Options:**
1. Current behavior (instant reset, no confirm)
2. Confirmation: "Start over?" as a brief text overlay
3. Undo: show the reset state briefly and allow undo within 3 seconds

### 4.3 How to apply link

**Current state:** "How to apply" is a centered link at the top of the landing state that also triggers the conversation. It disappears when the conversation starts.

**Open question:** This is confusing — clicking "How to apply" starts a conversation rather than navigating anywhere. Should this become a real destination (a separate application form page) or should its label change to reflect that it triggers the AI?

**Options:**
1. Change label to "Talk to us" or "Start here"
2. Keep as is — the ambiguity may be intentional (the AI is the application process)
3. Link to a future dedicated application page

### 4.4 Progress indicator for conversation

**Current state:** There is no visual indicator of where in the 8-turn conversation the visitor is.

**Open question:** Should visitors see that there are N turns before the waitlist CTA? Arguments for: reduces abandonment ("I see the end from here"). Arguments against: turns conversation into a game to complete rather than a genuine exchange.

### 4.5 Sound design

**Open question:** Should there be subtle audio feedback? A very quiet keystroke sound when the user types, or a soft tone when the AI begins responding? This could reinforce the "typewriter" metaphor.

**Recommendation:** Not for launch. Sound requires an explicit opt-in mechanism (mute/unmute control), which adds UI complexity. Revisit when the core experience is validated.

### 4.6 Dark mode / gradient adaptation

**Current state:** Single gradient palette. No dark/light mode.

**Open question:** Should the gradient subtly shift as the conversation progresses? E.g., as the AI learns more about a visitor (architect vs. developer), the color palette shifts slightly toward the "design" or "tech" side?

**Implementation path:** CSS custom property updates from JavaScript — the gradient blobs already use typed CSS variables, so shifting them is a one-line update per turn. The question is whether this is meaningful or distracting.

---

## 5. Accessibility Status

| Concern | Status | Priority |
|---|---|---|
| ARIA live region for AI messages | Implemented (polite) | Done |
| `role="log"` on message list | Implemented | Done |
| Keyboard navigation (no mouse needed) | Implemented (keydown starts conversation) | Done |
| Input autoFocus on conversation start | Implemented | Done |
| Minimum tap target size (44px) | Implemented (send button) | Done |
| Color contrast (text on gradient) | Not formally tested (WCAG AA) | High |
| Focus management on CTA overlay | autoFocus on email input | Done |
| Screen reader announcement of streaming content | sr-only live region updates on complete | Partial — updates during streaming would be spammy |
| Reduced motion preference | Not implemented | Medium |

**Open work: reduced motion**

Visitors with `prefers-reduced-motion: reduce` will still see the gradient animation and Framer Motion transitions. This should be respected:
- Gradient: pause animation on `prefers-reduced-motion`
- Logo: disable FLIP animation, use opacity transition only
- Message bubbles: disable enter animation

Implementation: one CSS `@media` block + `useReducedMotion()` hook from Framer Motion.

---

## 6. Planned UI Features (Phase 2)

| Feature | Description | Priority |
|---|---|---|
| Email confirmation feedback | After waitlist submit, show "check your inbox" state | High |
| Application form page | /apply — structured form post-waitlist | High |
| Faculty profiles | Static page or conversation-accessible bios | Medium |
| Share functionality | Share the site with a friend — OG image already exists | Medium |
| Program detail deep-dives | Module-specific sub-conversations or static pages | Medium |
| Cohort status indicator | "32 people on waitlist" — social proof | Low |
| Language selection | Spanish/Portuguese for LatAm market | Low |

---

## 7. Design System Reference

### Typography

| Use | Font | Weight | Size |
|---|---|---|---|
| Logo mark | Press Start 2P | 400 | `clamp(36px, 5vw, 66px)` landing / `clamp(13px, 1.8vw, 20px)` conversation |
| Subtitle | Inter | 300 | `clamp(11px, 1.3vw, 14px)` |
| Body / conversation | Inter | 400 | 15px (mobile) / 16px (desktop) |
| Input | Inter | 400 | 16px (prevents iOS zoom) |
| Error messages | Inter | 400 | 12px |

### Colors

| Token | Value | Use |
|---|---|---|
| Gradient left | `#5a78e8` | Blue blob |
| Gradient right | `#e050a8` / `#f055b8` | Pink blob |
| Gradient top | `#7ab2f8` | Light blue |
| Gradient base | `#8e72d5` | Base purple |
| Text primary | `white` | All primary content |
| Text secondary | `rgba(255,255,255,0.8)` | Subtitle, secondary labels |
| Text tertiary | `rgba(255,255,255,0.4)` | Input placeholder |
| User bubble | `rgba(255,255,255,0.1)` | User message background |
| Input border | `rgba(255,255,255,0.3)` | Bottom border of input |
| Error | `#fbcfe8` (pink-200) | Error messages |

---

## 6. Program Pages — Gradient Text System (Foundations & Advanced)

The Foundations and Advanced program pages use the same animated gradient canvas (`gradient-canvas`) as the landing page, but the content is extensive enough that dark text on the light gradient is required for legibility. This produces the characteristic look of those pages: dark ink typography over a softly shifting pastel background.

### 6.1 The Two-Surface Rule

Every element on the program pages belongs to one of two surfaces:

| Surface | Background | Text color family |
|---|---|---|
| **Gradient canvas** | The animated gradient | `dark` tokens (deep purple ink) |
| **Glass panel** | `rgba(0,0,0,0.2–0.38)` with backdrop-blur | `white` tokens |

Glass panels are: the sticky topbar, the footer, the MiniChat widget, the timeline cells, and the Workshop cards. Everything else sits directly on the gradient and uses dark ink.

### 6.2 Dark Ink Tokens

All six tokens encode a deep purple-black (`30, 15, 50`) — the same hue family as the gradient's purple anchor, making the text feel like it belongs in the palette rather than clashing with it.

| Token | Value | Typical use |
|---|---|---|
| `dark88` | `rgba(30,15,50,0.88)` | Hero titles, module titles, section headings, stat numbers |
| `dark70` | `rgba(30,15,50,0.70)` | Body copy, descriptions |
| `dark55` | `rgba(30,15,50,0.55)` | Tag pills, topic chips, meta field values |
| `dark38` | `rgba(30,15,50,0.38)` | Label text (uppercase tracking), module subtitles |
| `dark28` | `rgba(30,15,50,0.28)` | Module number (large, decorative), secondary meta |

### 6.3 Typography Discipline

The pixel font (`DePixelBreit`) is reserved exclusively for the "miaw" logotype — in the topbar and the footer — and nowhere else. All headings, titles, stats, and body text use **Inter**.

| Role | Font | Weight | Size |
|---|---|---|---|
| Hero title (h1) | Inter | 700 | `clamp(32px, 5vw, 72px)` |
| Section heading (h2) | Inter | 700 | `clamp(18–20px, 2.5–3vw, 30–38px)` |
| Module title (h3) | Inter | 700 | `clamp(15px, 1.8vw, 22px)` |
| Stat numbers | Inter | 700 | `clamp(22px, 3.5vw, 46px)` |
| Body copy | Inter | 400 | `0.94rem` |
| Label (uppercase) | Inter | 500 | `0.70rem`, tracking `0.16em` |
| Module subtitle | Inter | 400 italic | `0.85rem` |
| Logo ("miaw") | DePixelBreit | normal | `15–17px` |

### 6.4 Chip & Pill Components on the Gradient

Tag pills and topic chips invert their glass treatment: instead of white-on-dark, they use a very subtle dark-on-light treatment to match the canvas.

```
TagPill:   background rgba(30,15,50,0.06)  border rgba(30,15,50,0.10)  text dark55
TopicChip: background rgba(30,15,50,0.05)  border rgba(30,15,50,0.08)  text dark55
```

### 6.5 Dividers on the Gradient

Section dividers between gradient-canvas elements use:
```
1px solid rgba(30,15,50,0.10)
```
Section dividers between glass panels (topbar bottom, footer top, workshop section top) use the white divider:
```
1px solid rgba(255,255,255,0.08)
```

### 6.6 Hero Title Capitalisation

The first word of `titleLine1` is always capitalised in Latin-script languages (English, Spanish, French, German, Portuguese). CJK languages (Chinese, Japanese) are unaffected. This applies to both the Foundations page and any future program pages.

```
en  "Foundations of"   titleLine2  "intelligent worlds."
es  "Fundamentos de"   titleLine2  "mundos inteligentes."
fr  "Fondements des"   titleLine2  "mondes intelligents."
de  "Grundlagen der"   titleLine2  "intelligenten welten."
pt  "Fundamentos dos"  titleLine2  "mundos inteligentes."
```

### Spacing

Standard Tailwind scale. Key values:
- Horizontal padding: `px-6` (mobile) / `px-12` (desktop)
- Message gap: `gap-4`
- Input bar padding: `pt-2`
- Logo padding: `pt-6 sm:pt-8 pb-2`

### Breakpoints (Tailwind defaults)
- `sm`: 640px — primary responsive breakpoint
- `md`: 768px — used sparingly
- No mobile-specific breakpoint below sm (handled by `clamp()`)
