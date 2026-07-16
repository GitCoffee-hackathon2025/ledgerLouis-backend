import "fastify";

import type { Env } from "../schemas/env.schema.js";
import type { DB } from "./db.ts";

import type { RedisClientType } from "redis";
import type { IRedisClient } from "bullmq";

import type { StorageProvider } from "../modules/uploader/storageProvider.ts";
import { v2 as Cloudinary } from "cloudinary";

import type { buildAuthModule } from "../modules/auth/module.js";
import { type ULID } from "../domain/shared/id.ts";

import type { RateLimitOptions } from "../infrastructure/rate-limit/service.ts";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: NodePgDatabase<typeof schema>;

    // Cliente Redis, o "adapter" usa o "raw" como cerebro
    redis: {
      raw: RedisClientType; // Cliente redis simples, usado em outros serviços
      adapter: IRedisClient; // Cliente redis bullmq, usado nos producers queue
    };
    
    // Arquivos
    storage: StorageProvider;
    cloudinary: typeof Cloudinary;

    // Função para declarar uma rota antenticada e configura automatimente
    verifyAccess: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;

    // Função para uso do rateLimit (somente consumido pelo plugin.auth)
    limiter: {
      assert(res: FastifyReply, options: RateLimitOptions): Promise<void>;
    };
  }

  // Possibilita configurar o rateLimit de uma rota especifica (atraves do config)
  interface FastifyContextConfig {
    rateLimit?: {
      by?: Lowercase<string>;
      max: number;
      window: number;
    };
  }

  interface FastifyRequest {
    authUser: {
      sub: ULID;
      sid: ULID;
    };
  }
}
