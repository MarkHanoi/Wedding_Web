import { Router } from "express";
import { z } from "zod";

const router = Router();

const RSVPSchema = z.object({
  name: z.string().min(1).max(200),
  attending: z.enum(["yes", "no"]),
  guests: z.number().int().min(0).max(10).optional().default(0),
  shuttle: z.boolean().optional().default(false),
  dietary: z.string().max(500).optional().default(""),
  message: z.string().max(1000).optional().default(""),
});

type RSVP = z.infer<typeof RSVPSchema> & { receivedAt: string };

const rsvps: RSVP[] = [];

router.post("/rsvp", (req, res) => {
  const parsed = RSVPSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    return;
  }

  const entry: RSVP = {
    ...parsed.data,
    receivedAt: new Date().toISOString(),
  };
  rsvps.push(entry);

  req.log.info({ name: entry.name, attending: entry.attending }, "RSVP received");

  res.status(201).json({ ok: true, message: "RSVP received. Thank you!" });
});

router.get("/rsvp/count", (_req, res) => {
  const yes = rsvps.filter((r) => r.attending === "yes").length;
  const no = rsvps.filter((r) => r.attending === "no").length;
  res.json({ total: rsvps.length, attending: yes, declined: no });
});

export default router;
