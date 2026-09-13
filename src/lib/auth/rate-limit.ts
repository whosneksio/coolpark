import { getRedis } from '@/lib/redis';

export function clientIp(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export type RateLimitResult = { ok: boolean; remaining: number; retryAfter: number };

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
