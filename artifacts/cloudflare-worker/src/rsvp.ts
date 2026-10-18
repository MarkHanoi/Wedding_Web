import { z } from "zod";
import { sendRsvpNotification } from "./email";
import type { RsvpRow, WorkerEnv } from "./types";

const RSVPEventSchema = z.enum(["friday", "saturday", "sunday"]);
const RSVPSchema = z
  .object({
    name: z.string().trim().min(1).max(200),
    attending: z.enum(["yes", "no"]),
    guests: z.number().int().min(0).max(10).optional().default(0),
    shuttle: z.boolean().optional().default(false),
    events: z.array(RSVPEventSchema).max(3).optional().default([]),
    arrival: z.string().max(500).optional().default(""),
    transportEmail: z
      .string()
      .trim()
      .email()
      .max(254)
      .or(z.literal(""))
      .optional()
      .default(""),
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
    if (entry.attending === "yes" && entry.shuttle && !entry.transportEmail) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["transportEmail"],
        message: "Enter an email address so the couple can contact you about transport.",
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

export async function createRsvp(
  request: Request,
  env: WorkerEnv,
): Promise<Response> {
  const parsed = RSVPSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return jsonResponse(
      { error: "invalid_request", details: parsed.error.flatten() },
      400,
    );
  }

  const {
    name,
    attending,
    guests,
    shuttle,
    events,
    arrival,
    transportEmail,
    dietary,
    message,
  } = parsed.data;
  const result = await env.DB.prepare(
    `INSERT INTO rsvps
       (name, attending, guests, shuttle, events_json, arrival, transport_email, dietary, message, received_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id, name, attending, guests, shuttle, events_json, arrival, transport_email, dietary, message, received_at`,
  )
    .bind(
      name,
      attending,
      attending === "yes" ? guests : 0,
      attending === "yes" && shuttle,
      JSON.stringify(attending === "yes" ? events : []),
      arrival,
      attending === "yes" && shuttle ? transportEmail : "",
      dietary,
      message,
      new Date().toISOString(),
    )
    .first<RsvpRow>();

  if (!result) throw new Error("RSVP insert did not return a row.");
  const entry = fromRsvpRow(result);
  let notification: "sent" | "not_configured" | "failed" = "not_configured";
  try {
    notification = await sendRsvpNotification(env, entry);
  } catch {
    notification = "failed";
    console.error("RSVP notification email failed.");
  }

  return jsonResponse(
    {
      ok: true,
      message: "RSVP received. Thank you!",
      notification,
    },
    201,
  );
}

export async function rsvpCount(env: WorkerEnv): Promise<Response> {
  const row = await env.DB.prepare(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(CASE WHEN attending = 'yes' THEN 1 ELSE 0 END), 0) AS attending,
       COALESCE(SUM(CASE WHEN attending = 'no' THEN 1 ELSE 0 END), 0) AS declined
     FROM rsvps`,
  ).first<{ total: number; attending: number; declined: number }>();
  return jsonResponse(row ?? { total: 0, attending: 0, declined: 0 });
}

export function fromRsvpRow(row: RsvpRow): RSVP {
  let events: RSVP["events"] = [];
  try {
    const parsedEvents: unknown = JSON.parse(row.events_json);
    if (Array.isArray(parsedEvents)) {
      events = parsedEvents.filter(
        (event): event is RSVP["events"][number] =>
          event === "friday" || event === "saturday" || event === "sunday",
      );
    }
  } catch {
    events = [];
  }
  return {
    name: row.name,
    attending: row.attending,
    guests: row.guests,
    shuttle: row.shuttle === 1,
    events,
    arrival: row.arrival,
    transportEmail: row.transport_email,
    dietary: row.dietary,
    message: row.message,
    receivedAt: row.received_at,
  };
}

export async function readJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64 * 1024) return null;
  const body = await request.text();
  if (new TextEncoder().encode(body).byteLength > 64 * 1024) return null;
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
