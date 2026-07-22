import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const ipCache = new Map<string, { count: number; expiresAt: number }>();
const LIMIT = 5; // max 5 requests
const WINDOW_MS = 60 * 1000; // per 1 minute

export const rateLimitMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const req = getRequest();
    const ip =
      req?.headers.get("cf-connecting-ip") || req?.headers.get("x-forwarded-for") || "unknown";

    const now = Date.now();
    const record = ipCache.get(ip);

    if (record) {
      if (now > record.expiresAt) {
        // Reset
        ipCache.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
      } else if (record.count >= LIMIT) {
        throw new Error("Too many requests. Please try again in a minute.");
      } else {
        record.count += 1;
      }
    } else {
      ipCache.set(ip, { count: 1, expiresAt: now + WINDOW_MS });
    }

    // Cleanup old cache entries periodically to prevent memory growth
    if (ipCache.size > 1000) {
      for (const [key, val] of ipCache.entries()) {
        if (now > val.expiresAt) ipCache.delete(key);
      }
    }

    return next();
  },
);
