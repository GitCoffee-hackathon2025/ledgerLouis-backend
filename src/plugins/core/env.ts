import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";

import { EnvSchema } from "../../schemas/env.schema";

// Função que integra as variáveis de ambiente no fastify

export default fp(
  async function (app: FastifyInstance) {
    await app.register(fastifyEnv, {
      schema: EnvSchema,
      dotenv: true,
      confKey: "config",
      ajv: {
        customOptions: (ajv) => {
          ajv.opts.coerceTypes = true;
          return ajv;
        },
      },
    });
  },
  {
    name: "env",
  },
);

// É importante usar o fp (fastify-plugin) para permitir que outros serviços o acessem (usem)
// Não é para usar o fp em todos os plugins, somente nos que são usados por outros componentes do fastify
