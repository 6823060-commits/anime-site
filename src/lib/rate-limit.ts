import { LRUCache } from "lru-cache";

const cache = new LRUCache<string, number[]>({
  max: 5000,
  ttl: 15 * 60 * 1000, // 15 min window
});

/**
 * Returns true if action is allowed, false if rate-limited.
 * key: unique identifier (e.g. "login:" + ip, "otp:" + userId)
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = (cache.get(key) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= limit) {
    cache.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  cache.set(key, timestamps);
  return true;
}

export function getClientIp(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}