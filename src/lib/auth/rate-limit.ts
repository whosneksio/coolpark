import { getRedis } from '@/lib/redis';

/**
 * NextRequest.ip was removed in Next 15, so read the proxy header.
 *
 * Honest limit: with nothing trusted in front of the app this header is
 * client-controlled and trivially spoofable, and locally it's usually absent so
 * every caller shares the 'unknown' bucket. It stops a naive script; it is not a
 * security boundary until a proxy overwrites the header.
 */
export function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number };

/**
 * Fixed-window counter. INCR, then EXPIRE with NX so the TTL is set once per
 * window -- without NX every request re-extends it, so a client hammering the
 * endpoint pushes the window out forever and locks itself out permanently
 * instead of recovering.
 *
 * Fails open: a dead cache should not lock every user out of logging in.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> {
  try {
    const redis = await getRedis();
    const [hits, , ttl] = await redis
      .multi()
      .incr(key)
      .expire(key, windowSec, 'NX')
      .ttl(key)
      .exec();

    const count = Number(hits);
    return {
      ok: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfter: Number(ttl) > 0 ? Number(ttl) : windowSec,
    };
  } catch (error) {
    console.error('rate limit unavailable, allowing request:', error);
    return { ok: true, remaining: limit, retryAfter: 0 };
  }
}
