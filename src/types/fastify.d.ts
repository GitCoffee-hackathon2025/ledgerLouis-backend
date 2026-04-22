import "fastify";
import type { Env } from "../schemas/env.schema";

import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schemas";

import type { buildAuthModule } from "../modules/auth/module";
import { buildUserModule } from "../modules/users/module";
import { type ULID } from "../lib/id";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: MySql2Database<typeof schema>;

    auth: ReturnType<typeof buildAuthModule>;
    user: ReturnType<typeof buildUserModule>;

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
