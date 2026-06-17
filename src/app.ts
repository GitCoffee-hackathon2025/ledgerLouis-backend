import fastify from "fastify";
import Autoload from "@fastify/autoload";

// Função que cria a instância que permite maior validação com o Ajv
import { createValidator } from "./infrastructure/validation/ajv/createValidator.js";

// Erros
import { handleError } from "./shared/errors/http/handler.js";

// Adaptador pro Fastify com TypeBox
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

// Core Plugins, só podem ser importados nesse arquivo e precisam ser carregados primeiro
// Para maior organização importe-os na ordem correta de registro
import env from "./plugins/core/env.js";
import cors from "./plugins/core/cors.js";
import db from "./plugins/core/db.js";
import auth from "./plugins/core/auth.js";

/* 
Para serviços pesados como emails e criação de pdf's será necessário instalar o BullMQ junto com o Redis e configura-los.
Fluxo:
Fastify API → AuthService → AuthService → EmailQueue.add() → Redis → BullMQ Worker → SMTP provider

Aproveitaremos a instalação do Redis para criar o "rate-limit" com o @fastify/rate-limit
Funcionamento dessa arquitetura:
request → verifica IP limit → se autenticado → verifica user limit
O limite por IP não é para limitar usuários, é para limitar origens de tráfego.
*/

// Cria o path global para utilização do Autoload
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const root = __dirname;

// Função
async function buildApp() {
  // Criando ajv próprio
  const ajv = createValidator();

  // Criando instância fastify
  const app = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  // Declarando AJV e tratamento de erro
  app.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

  // Gerenciador de erros
  app.setErrorHandler(handleError);

  // Plugins fundamentais para o carregamento
  await app.register(env, { ajv });
  await app.register(cors);
  await app.register(db);
  await app.register(auth);

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
