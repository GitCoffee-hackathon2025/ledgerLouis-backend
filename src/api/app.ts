import fastify from "fastify";
import Autoload from "@fastify/autoload";
import fastifyMultipart from "@fastify/multipart";

// Função que cria a instância que permite maior validação com o Ajv
import { createValidator } from "../infrastructure/validation/ajv/createValidator.js";

// Erros
import { handleError } from "../shared/errors/http/handler.js";

// Adaptador pro Fastify com TypeBox
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

// Plugin de inicialização das variaveis de ambiente
import env from "./plugins/core/env.js";

// Path global para utilização do Autoload
import { fromHere, fromSource } from "../config/paths.js";

// Função
async function buildApp() {
  // Criando ajv próprio
  const ajv = createValidator();
  fastifyMultipart.ajvFilePlugin(ajv);

  // Criando instância fastify
  const app = fastify({
    logger: {
      transport: { target: "pino-pretty", options: { colorize: true } },
    },
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Declarando AJV e tratamento de erro
  app.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

  // Gerenciador de erros
  app.setErrorHandler(handleError);

  // Plugins fundamentais para o carregamento
  await app.register(env, { ajv });

  await app.register(Autoload, {
    dir: fromHere(import.meta.url, "plugins", "core"),
    ignorePattern: /env\./,
  });

  // Plugins mais isolados
  await app.register(Autoload, {
    dir: fromHere(import.meta.url, "plugins", "infra"),
  });

  // Carregamento das rotas
  await app.register(Autoload, {
    dir: fromSource("modules"),
    dirNameRoutePrefix: false,
  });

  return app;
}

export default buildApp;
