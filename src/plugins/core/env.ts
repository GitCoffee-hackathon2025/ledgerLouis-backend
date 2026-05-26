import fp from "fastify-plugin";
import fastifyEnv from "@fastify/env";
import type { FastifyInstance } from "fastify";
import type { Ajv } from "ajv";

import { EnvSchema } from "../../schemas/env.schema.js";

// Função que integra as variáveis de ambiente no fastify

export default fp(
  async function (app: FastifyInstance, opts: { ajv: Ajv }) {
    await app.register(fastifyEnv, {
      schema: EnvSchema,
      dotenv: true,
      confKey: "config",
      ajv: opts.ajv,
    });
  },
  {
    name: "env",
  },
);

// É importante usar o fp (fastify-plugin) para permitir que outros serviços o acessem (usem)
// Não é para usar o fp em todos os plugins, somente nos que são usados por outros componentes do fastify
