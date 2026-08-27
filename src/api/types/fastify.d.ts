import "fastify";

import type { Env } from "../schemas/env.schema.ts";
import type { DB } from "../../types/db.ts";
import type { Redis } from "../../types/redis.ts";
import type { StorageProvider } from "../../types/storage.ts";

import type { buildAuthModule } from "../../modules/auth/module.ts";
import { type ULID } from "../../domain/shared/id.ts";

import type { RateLimitOptions } from "../../infrastructure/rate-limit/service.ts";

declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: DB;
    redis: Redis;

    // Gerenciador de arquivos
    storage: StorageProvider;

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

  // Possibilita configurar rotas personalidas (atraves do config)
  interface FastifyContextConfig {
    // Swagger
    /// Autenticação
    auth?: true;

    // Rate Limit
    /// Desativa rate limit
    disableRateLimit?: true;

    /// Personaliza rate limit
    rateLimit?: {
      by?: Lowercase<string>;
      max: number;
      window: number;
    };
  }

  interface FastifyRequest {
    // Declara que existe um token na requisição e possibilita uso
    authUser: {
      sub: ULID;
      sid: ULID;
    };
  }
}
