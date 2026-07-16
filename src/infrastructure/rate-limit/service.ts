import type { RedisClientType } from "redis";

import { AppError } from "../../shared/errors/domain/errors.js";

export interface RateLimitOptions {
  scope: string;
  id: string;
  max: number;
  window: number;
}

export function createRateLimitService(redis: RedisClientType) {
  return {
    async assert({ scope, id, max, window }: RateLimitOptions) {
      const key = `rate-limit:${scope}:${id}`;

      const requests = await redis.incr(key);

      if (requests === 1) await redis.multi().expire(key, window).exec();

      if (requests > max)
        throw new AppError("RATE_LIMIT_EXCEEDED", {
          retryAfter: await redis.ttl(key),
        });
    },
  };
}
