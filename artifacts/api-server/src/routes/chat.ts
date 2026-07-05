import { Router } from "express";
import { z } from "zod";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { getStaticPreamble, buildDynamicSuffix } from "../lib/systemPrompt";
import { Redis } from "@upstash/redis";

const router = Router();

let redis: Redis | null = null;
try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch {
  // Redis not configured — in-memory fallback active
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 40;
const RATE_LIMIT_WINDOW_S = 3600;

async function checkRateLimit(ip: string): Promise<{ allowed: boolean }> {
  const key = `wedding:rl:${ip}`;

  if (redis) {
    try {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW_S);
      return { allowed: count <= RATE_LIMIT_MAX };
    } catch {
      // Fall through to in-memory
    }
  }

  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_S * 1000 });
    return { allowed: true };
  }
  if (record.count >= RATE_LIMIT_MAX) return { allowed: false };
  record.count += 1;
  return { allowed: true };
}

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().max(4000),
});

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).max(40),
  turnCount: z.number().int().min(0).max(60).optional().default(0),
});

getStaticPreamble();

router.post("/chat", async (req, res) => {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "127.0.0.1";

  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    res.status(429).json({
      error: "rate_limit",
      message: "Too many messages. Please come back in a little while.",
    });
    return;
  }

  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.flatten() });
    return;
  }

  const { messages, turnCount } = parsed.data;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  req.socket?.setNoDelay(true);

  const systemBlocks: Array<{
    type: "text";
    text: string;
    cache_control?: { type: "ephemeral" };
  }> = [
    {
      type: "text",
      text: getStaticPreamble(),
      cache_control: { type: "ephemeral" },
    },
    {
      type: "text",
      text: buildDynamicSuffix(turnCount),
    },
  ];

  const claudeMessages =
    messages.length === 0
      ? [{ role: "user" as const, content: "begin" }]
      : messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  try {
    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system: systemBlocks,
      messages: claudeMessages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        res.write(chunk.delta.text);
      }
    }

    res.end();
  } catch (err) {
    req.log.error({ err }, "Claude streaming error");
    if (!res.headersSent) {
      res.status(500).json({ error: "stream_error" });
    } else {
      res.end();
    }
  }
});

export default router;
