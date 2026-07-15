import "fastify";

import type { Env } from "../schemas/env.schema.js";
import type { DB } from "./db.ts";

import type { RedisClientType } from "redis";
import type { IRedisClient } from "bullmq";

import type { buildAuthModule } from "../modules/auth/module.js";
import { type ULID } from "../domain/shared/id.ts";

import type { createRateLimitService } from "../infrastructure/rate-limit/service.ts";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: NodePgDatabase<typeof schema>;

    redis: {
      raw: RedisClientType;
      adapter: IRedisClient;
    };

    auth: ReturnType<typeof buildAuthModule>;

    verifyAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    limiter: ReturnType<typeof createRateLimitService>;
  }
  interface FastifyRequest {
    authUser: {
      sub: ULID;
      sid: ULID;
    };
  }
}
