# Screen Specifications — WaitlistScreen & ApplyScreen

## Overview

Two full-screen overlay components that replace the previous inline card
sub-views in `CTAOverlay`. Both render as fixed full-screen panels over the
gradient canvas (z-50), using Framer Motion slide-up entry and the same
glass-morphism design language as the rest of the app.

---

## Navigation model

```
ConversationCanvas
├── gradient-canvas (full screen)
│   ├── FloatingImage            z-1
│   ├── [conversation scroll]    z-10
│   ├── [input bar]              z-10
│   ├── CTAOverlay (inline card) z-10  ← triggers screens via callbacks
│   ├── WaitlistScreen           z-50  ← renders over everything
│   └── ApplyScreen              z-50  ← renders over everything
```

**WaitlistScreen** is triggered when the user clicks "Join the waitlist" in
`CTAOverlay`. `ConversationCanvas` holds the `showWaitlistScreen` boolean;
`CTAOverlay` receives the `onOpenWaitlistScreen` callback.

**ApplyScreen** is triggered when `showApplicationSubmit` becomes true
(after the application chat interview reaches `APPLICATION_TURN_LIMIT`).
It replaces the old inline `ApplicationSubmit` component entirely.

---

## WaitlistScreen

**File:** `artifacts/miaw/src/components/WaitlistScreen.tsx`

**Purpose:** A focused, beautiful email collection screen. Replaces the
inline waitlist sub-view in `CTAOverlay`.

**Props:**
```typescript
interface WaitlistScreenProps {
  visitorType: string;         // passed from profile.type
  conversationLength: number;  // passed from turnCount
  onSubmit: (email: string) => Promise<void>;  // calls POST /api/waitlist
  onSaveSession?: () => Promise<void>;         // P3-D remember conversation
  onBack: () => void;          // sets showWaitlistScreen=false
}
```

**Internal states:** `"form"` | `"submitted"`

**Fields collected:**
| Field | Required | Notes |
|---|---|---|
| Name | No | Personalises the success message |
| Email | Yes | POST /api/waitlist payload |
| Background | No | `<select>`: Architect / Engineer / Developer / Researcher / Other |
| Remember conversation | No | P3-D GDPR opt-in checkbox; calls onSaveSession |

**API:** `POST /api/waitlist` — existing endpoint, no changes.

**Entry animation:** `opacity: 0→1` on container, `y: 32→0 + opacity: 0→1`
on card, 0.5s `[0.22,0.1,0.22,1]` ease.

**Exit:** Instant unmount when `onBack` is called (no exit animation needed —
the conversation is revealed immediately beneath).

---

## ApplyScreen

**File:** `artifacts/miaw/src/components/ApplyScreen.tsx`

**Purpose:** Full-screen application submission form. Replaces the inline
`ApplicationSubmit` component. Shown after the application chat interview
reaches `APPLICATION_TURN_LIMIT`.

**Props:**
```typescript
interface ApplyScreenProps {
  onSubmit: (email: string, portfolioUrl: string, gdprConsent: boolean) => Promise<void>;
  onBack: () => void;  // sets showApplicationSubmit=false
}
```

**Internal states:** `"form"` | `"processing"` | `"done"`

**Visual elements unique to this screen:**
- **3-step progress indicator**: `Conversation ✓ → Submit (active) → Review`
  Communicates where the user is in the process.
- **Processing state**: Spinner + "This takes about 10 seconds." reassurance.
  Covers the 8–14s Claude extraction + email send.
- **Done state**: Confirmation card with "← see your personalised response"
  which closes the screen and reveals Claude's ack message in the conversation.

**Fields collected:**
| Field | Required | Notes |
|---|---|---|
| Email | Yes | POST /api/apply payload |
| Portfolio URL | No | POST /api/apply payload |
| GDPR consent | Yes | Checkbox — required for submit |

**API:** `POST /api/apply` — existing endpoint, no changes.
The full conversation history (qualification + application turns) is assembled
in `ConversationCanvas.handleApplicationSubmit` before calling this endpoint.

**Dismissal flow:**
1. User submits → state = `"processing"`
2. `onSubmit` resolves → state = `"done"` (personalised ack is already in
   the conversation behind the screen)
3. User clicks "← see your personalised response" → `onBack()` →
   `setShowApplicationSubmit(false)` → screen unmounts → conversation visible

Note: `handleApplicationSubmit` does NOT call `setShowApplicationSubmit(false)`
itself (that line was removed). Dismissal is always user-initiated from the
done state, giving them time to read the confirmation before returning.

---

## Design tokens

| Token | Value |
|---|---|
| Card background | `bg-black/25 backdrop-blur-2xl` |
| Card border | `border border-white/12 rounded-3xl` |
| Card padding | `p-8 sm:p-10` |
| Card max-width | `max-w-md` |
| Body font | Inter 300, white/60 for secondary text |
| Heading font | Inter 500, white |
| Input style | Bottom-border only (`border-b border-white/40`), no box |
| Submit button | `bg-white/12 border border-white/25 rounded-xl` hover `bg-white/20` |
| Back link | `text-white/45 text-xs`, positioned `absolute top-6 left-6` |
| Z-index | `z-50` (above FloatingImage z-1, above UI chrome z-10) |

---

## Future extensions

- **Pre-fill email** from conversation if user already mentioned it (P6 — session analysis)
- **WaitlistScreen name field → personalized ack** in Claude's first post-waitlist message
- **ApplyScreen motivation field** — optional free-text "Why MIAW?" before submit
- **Stripe enrollment** — after accepted status, ApplyScreen can surface a "Pay enrollment fee" CTA linked to `/api/stripe/checkout-session`
