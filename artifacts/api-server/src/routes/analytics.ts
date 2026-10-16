import { Router } from "express";
import { z } from "zod";
import { pool } from "../lib/db";

const router = Router();
const VisitSchema = z.object({
  eventId: z.string().uuid(),
  path: z.string().min(1).max(100),
});

router.post("/analytics/visit", async (req, res, next) => {
  const parsed = VisitSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  if (parsed.data.path === "/admin" || parsed.data.path.startsWith("/admin/")) {
    res.sendStatus(204);
    return;
  }

  try {
    await pool.query(
      "INSERT INTO site_visits (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING",
      [parsed.data.eventId],
    );
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

export default router;
