import fastify from "fastify";
import Autoload from "@fastify/autoload";

// Função que cria a instância que permite maior validação com o Ajv
import { createValidator } from "./infrastructure/validation/ajv/createValidator.js";

// Erros
import { handleError } from "./shared/errors/http/handler.js";

// Adaptador pro Fastify com TypeBox
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

// Plugin de inicialização das variaveis de ambiente
import env from "./plugins/core/env.js";

// Cria o path global para utilização do Autoload
import { fileURLToPath } from "url";
import path, { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = __dirname;

// Função
async function buildApp() {
  // Criando ajv próprio
  const ajv = createValidator();

  // Criando instância fastify
  const app = fastify({
    logger: {
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
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
    dir: join(root, "plugins/core"),
    ignorePattern: /env\./,
  });

  // Instalando manualmente o multipart (modularizar como plugin futuramente)
  await app.register(import("@fastify/multipart"));

  await app.register(import("@fastify/static"), {
    root: path.join(process.cwd(), "uploads"),
    prefix: "/uploads/",
  });

  // Plugins mais isolados
  await app.register(Autoload, {
    dir: join(root, "plugins/infra"),
  });

  // Carregamento das rotas
  await app.register(Autoload, {
    dir: join(root, "modules"),
    dirNameRoutePrefix: false,
  });

  return app;
}

export default buildApp;
