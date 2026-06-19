import "fastify";
import type { Env } from "../schemas/env.schema.js";

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/schemas/index.js";

import type { buildAuthModule } from "../modules/auth/module.js";
import { type ULID } from "../lib/id.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: NodePgDatabase<typeof schema>;

    auth: ReturnType<typeof buildAuthModule>;

    verifyAccessToken: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
  interface FastifyRequest {
    authUser: {
      sub: ULID;
      sid: ULID;
    };
  }
}
