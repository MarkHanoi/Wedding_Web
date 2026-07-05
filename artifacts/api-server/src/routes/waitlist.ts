import { Router } from "express";
import { z } from "zod";
import { sendWaitlistConfirmation } from "../lib/email";

const router = Router();

// ---------------------------------------------------------------------------
// In-memory store (Airtable is best-effort; this survives Airtable failures)
// Exported so the admin dashboard can read current state.
// ---------------------------------------------------------------------------
export interface WaitlistEntry {
  email: string;
  visitorType: string;
  conversationLength: number;
  referrer?: string;
  createdAt: number;
}

export const waitlistEntries: WaitlistEntry[] = [];

// ---------------------------------------------------------------------------
// Request schema
// ---------------------------------------------------------------------------
const WaitlistRequestSchema = z.object({
  email: z.string().email().max(254),
  visitorType: z
    .enum([
      "architect",
      "engineer",
      "researcher",
      "developer",
      "student",
      "urban_planner",
      "unknown",
    ])
    .optional()
    .default("unknown"),
  conversationLength: z.number().int().min(0).max(30).optional().default(0),
  referrer: z.string().max(500).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractEmailDomainTld(email: string): string {
  try {
    const domain = email.split("@")[1] ?? "";
    const parts = domain.split(".");
    return parts.slice(-2).join(".");
  } catch {
    return "unknown";
  }
}

async function saveToAirtable(entry: WaitlistEntry): Promise<void> {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME ?? "Waitlist";

  if (!apiKey || !baseId) return;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Email: entry.email,
        "Visitor Type": entry.visitorType,
        "Conversation Length": entry.conversationLength,
        Referrer: entry.referrer ?? "direct",
        "Submitted At": new Date(entry.createdAt).toISOString(),
        Source: "MIAW Phase 0 Agent",
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Airtable error ${response.status}: ${text}`);
  }
}

// ---------------------------------------------------------------------------
// POST /api/waitlist
// ---------------------------------------------------------------------------
router.post("/waitlist", async (req, res) => {
  const parsed = WaitlistRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      message: "Invalid request.",
      details: parsed.error.flatten(),
    });
    return;
  }

  const { email, visitorType, conversationLength, referrer } = parsed.data;

  const alreadyExists = waitlistEntries.some((e) => e.email === email);

  const entry: WaitlistEntry = {
    email,
    visitorType,
    conversationLength,
    referrer,
    createdAt: Date.now(),
  };

  if (!alreadyExists) {
    waitlistEntries.push(entry);
    req.log.info({ visitorType }, "Waitlist entry added");

    saveToAirtable(entry).catch((err) => {
      req.log.warn({ err }, "Airtable save failed — entry kept in memory");
    });

    sendWaitlistConfirmation(email, { visitorType }, req.log).catch((err) => {
      req.log.warn({ err }, "Email: waitlist confirmation send failed");
    });
  }

  res.status(201).json({
    success: true,
    message: "You're in. We'll reach out when applications open.",
    domainTld: extractEmailDomainTld(email),
  });
});

export default router;
