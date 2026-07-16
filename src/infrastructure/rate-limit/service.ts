import type { RedisClientType } from "redis";

export interface RateLimitOptions {
  by: string;
  id: string;
  max: number;
  window: number;
}

interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

export function createRateLimitService(redis: RedisClientType) {
  return {
    async consume({
      by,
      id,
      max,
      window,
    }: RateLimitOptions): Promise<RateLimitResult> {
      const key = `rate-limit:${by}:${id}`;

      const requests = await redis.incr(key);

      if (requests === 1) await redis.multi().expire(key, window).exec();

      return {
        allowed: requests > max,
        limit: max,
        remaining: Math.max(0, max - requests),
        retryAfter: await redis.ttl(key),
      };
    },
  };
}
