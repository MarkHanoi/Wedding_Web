import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db";
import { sendRsvpNotification } from "../lib/mailer";

const router = Router();
const RSVPEventSchema = z.enum(["friday", "saturday", "sunday"]);

const RSVPSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    attending: z.enum(["yes", "no"]),
    guests: z.number().int().min(0).max(10).optional().default(0),
    shuttle: z.boolean().optional().default(false),
    events: z.array(RSVPEventSchema).max(3).optional().default([]),
    arrival: z.string().max(500).optional().default(""),
    dietary: z.string().max(500).optional().default(""),
    message: z.string().max(1000).optional().default(""),
  })
  .superRefine((entry, context) => {
    if (entry.attending === "yes" && entry.events.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["events"],
        message: "Choose at least one event.",
      });
    }
    if (new Set(entry.events).size !== entry.events.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["events"],
        message: "Each event can only be selected once.",
      });
    }
  });

export type RSVP = z.infer<typeof RSVPSchema> & { receivedAt: string };

router.post("/rsvp", async (req, res, next) => {
  const parsed = RSVPSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    return;
  }

  try {
    const { name, attending, guests, shuttle, events, arrival, dietary, message } = parsed.data;
    const result = await pool.query<{
      id: string;
      name: string;
      attending: "yes" | "no";
      guests: number;
      shuttle: boolean;
      events: string[];
      arrival: string;
      dietary: string;
      message: string;
      received_at: Date;
    }>(
      `INSERT INTO rsvps (name, attending, guests, shuttle, events, arrival, dietary, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, attending, guests, shuttle, events, arrival, dietary, message, received_at`,
      [
        name,
        attending,
        attending === "yes" ? guests : 0,
        attending === "yes" ? shuttle : false,
        attending === "yes" ? events : [],
        arrival,
        dietary,
        message,
      ],
    );
    const row = result.rows[0];
    const entry: RSVP = {
      name: row.name,
      attending: row.attending,
      guests: row.guests,
      shuttle: row.shuttle,
      events: row.events as RSVP["events"],
      arrival: row.arrival,
      dietary: row.dietary,
      message: row.message,
      receivedAt: row.received_at.toISOString(),
    };

    let notification: "sent" | "not_configured" | "failed" = "not_configured";
    try {
      notification = await sendRsvpNotification(entry);
    } catch (error) {
      notification = "failed";
      req.log.error(
        { code: error instanceof Error && "code" in error ? error.code : undefined },
        "RSVP notification email failed",
      );
    }

    req.log.info({ attending: entry.attending }, "RSVP received");
    res.status(201).json({
      ok: true,
      message: "RSVP received. Thank you!",
      notification,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/rsvp/count", async (_req, res, next) => {
  try {
    const result = await pool.query<{
      total: number;
      attending: number;
      declined: number;
    }>(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE attending = 'yes')::int AS attending,
         COUNT(*) FILTER (WHERE attending = 'no')::int AS declined
       FROM rsvps`,
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
