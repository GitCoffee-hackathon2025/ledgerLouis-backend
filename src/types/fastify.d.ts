import "fastify";
import type { Env } from "../schemas/env.schema.js";
import type { DB } from "./db.ts";

import type { StorageProvider } from "../modules/uploader/storageProvider.ts";
import { v2 as Cloudinary } from "cloudinary";

import type { buildAuthModule } from "../modules/auth/module.js";
import { type ULID } from "../domain/shared/id.ts";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: NodePgDatabase<typeof schema>;

    storage: StorageProvider;
    cloudinary: typeof Cloudinary;

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
