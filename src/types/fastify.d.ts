import "fastify";
import type { Env } from "../schemas/env.schema.js";

import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schemas/index.js";

import type { buildAuthModule } from "../modules/auth/module.js";
import { type ULID } from "../lib/id.js";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: MySql2Database<typeof schema>;

    auth: ReturnType<typeof buildAuthModule>;

    verifyAccess: (
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
