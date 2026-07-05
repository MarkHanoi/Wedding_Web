# MIAW — Director Meeting: Questions & Briefing
**Master In Intelligent Artificial Worlds**
Prepared for: Call with Program Director
Date: May 2026

---

## What Is the MIAW Agent?

MIAW is a conversational AI agent that replaces a traditional landing page. A visitor lands on an animated gradient screen, clicks anywhere, and Claude (Anthropic) starts interviewing them — up to 8 turns — before presenting a waitlist call-to-action.

The agent:
- Infers the visitor's profile (architect, engineer, researcher, developer, student, urban planner)
- Tailors each response using a knowledge base covering the curriculum (9 modules), AEC context, and FAQ
- Streams responses in real time — no forms, no navigation, just conversation
- Captures waitlist entries and stores them in Airtable

---

## Cost Overview

| Item | Estimate |
|---|---|
| AI per conversation | ~$0.05–$0.15 (8 turns, Claude Sonnet) |
| 1,000 conversations / month | ~$50–$150 in AI credits |
| 10,000 conversations / month | ~$500–$1,500 |
| Hosting (Replit Autoscale) | ~$20–$50 / month |
| Rate limiting (Upstash Redis) | Free tier covers most loads |
| Waitlist capture (Airtable) | Free tier up to 1,000 records |
| Analytics (PostHog) | Free up to 1M events / month |

> These are estimates. Final cost depends on conversation length and traffic volume. Rate limiting is already built in to protect against runaway costs.

---

## Questions for the Director

### 1. Scope — Text Only or Also Images?
The agent currently handles text conversations only. Should we also allow prospective students to share images — portfolio work, sketches, or reference projects — or should the experience remain purely text-based for v1?

---

### 2. Documentation
What documentation does the program need from us — technical handover docs, a content editing guide, or an end-user FAQ? Who internally will own and update the knowledge base as the curriculum evolves?

---

### 3. Conversation Structure — Linear Thread or Open Dialogue?
Right now the agent follows a single guided thread of 8 questions. Should we keep that linear journey, or allow the user to steer the conversation freely? And on the entry point: clicking the logo feels like a discovery moment — does that interaction feel right for the audience, or would a more explicit "Start" button be safer?

---

### 4. Agent Personality and Tone
How should the agent present itself — academic and formal, warm and conversational, or provocative and design-forward, given the AEC/creative audience? Should it have a name or persona, or stay anonymous?

---

### 5. Should the Agent Lead or Respond?
Should the agent proactively ask questions about the visitor's background and goals, or wait and answer what the visitor asks? Currently it leads. Is that the right posture for your admissions context?

---

### 6. Handling Off-Topic Questions
When someone asks something outside the scope of the master — personal advice, general AI questions, unrelated topics — should the agent politely redirect, answer briefly and pivot, or decline entirely? What tone do you want for those moments?

---

### 7. Conversation Goal — What Is the Desired Outcome?
Is the single desired outcome to capture a waitlist entry, to qualify applicants, to inform and inspire — or all three? That determines how the agent steers each turn.

---

### 8. Full Cost Approval
At current architecture, AI costs run roughly $0.05–$0.15 per conversation and hosting is ~$20–$50/month. What is the expected traffic volume at launch and at peak? That will let us size the infrastructure and set a realistic monthly budget.

---

### 9. Languages
Is the program multilingual — will the agent need to respond in Spanish, Portuguese, or other languages — or is English the default for all interactions?

---

### 10. Admissions Calendar Sensitivity
Are there blackout periods — such as after an application deadline — when the agent's message should change? Should it know whether applications are open or closed and adjust accordingly?

---

### 11. Curriculum Accuracy and Approval
Who is the internal owner who approves changes to the knowledge base? If a faculty member updates a module, what is the process for that to reach the agent?

---

### 12. Waitlist vs. Direct Application
The agent currently ends with a waitlist CTA. Should it ever route directly to the application form instead? What is the trigger — a certain visitor profile, a certain point in the conversation?

---

### 13. Visitor Data and GDPR
What data can we store about visitors — conversation history, inferred profile, email from the waitlist? Who is the data controller, and does the program have GDPR compliance requirements we need to meet?

---

### 14. Analytics and Reporting
What metrics matter to the director — number of conversations, conversion to waitlist, drop-off point, visitor profile breakdown? Who receives that report and how often?

---

### 15. Integration with Existing CRM or Admissions System
Is there an existing CRM, HubSpot, Salesforce, or admissions platform where waitlist entries should land? Currently they go to Airtable — should we pipe them further?

---

### 16. Moderation and Misuse
The agent is public and unmoderated. What happens if someone tries to extract the system instructions or generate harmful content? What is your risk tolerance and expected handling?

---

### 17. Mobile Experience
A large share of prospective students will arrive on mobile. Is the current full-screen chat experience acceptable on phone, or does the director want a more traditional mobile layout as a fallback?

---

### 18. Lifespan and Ownership Post-Launch
After the initial build, who maintains the agent — the school's IT team, an external agency, or do you expect us to stay on retainer? What is the expected shelf life before a redesign?

---

*Document prepared for internal use — MIAW project team, May 2026*
