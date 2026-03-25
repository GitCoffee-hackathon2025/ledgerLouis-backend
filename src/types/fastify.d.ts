import "fastify";
import type { Env } from "../schemas/env.schema";

import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schemas";

// Declaração de variáveis que podem ser chamadas por meio da Instância
declare module "fastify" {
  interface FastifyInstance {
    config: Env;
    db: MySql2Database<typeof schema>;
  }
}
