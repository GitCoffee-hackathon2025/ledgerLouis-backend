import "fastify";
import type { Env } from "../schemas/env.schema";

// Declaração de variáveis que podem ser chamadas por meio da Instância
declare module "fastify" {
  interface FastifyInstance {
    config: Env;
  }
}
