import fastify from "fastify";
import Autoload from "@fastify/autoload";

import path from "path";

// Função que cria a instância que permite maior validação com o Ajv
import { createValidator } from "./lib/validator";

// Core Plugins, só podem ser importados nesse arquivo e precisam ser carregados primeiro
// Para maior organização importe-os na ordem correta de registro
import env from "./plugins/core/env";
import cors from "./plugins/core/cors";
import db from "./plugins/core/db";
import auth from "./plugins/core/auth";

// Erros
import { transformAjvErrors } from "./lib/validation/transformAjvErrors";
import { isAjvError } from "./lib/validation/isAjvError";
import { AppError, ValidationError } from "./shared/errors";

// Adaptador pro Fastify com TypeBox
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

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
const root = __dirname;

async function buildApp() {
  // Criando ajv próprio
  const ajv = createValidator();

  // Criando instância fastify
  const app = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

  // Declarando AJV e tratamento de erro
  app.setValidatorCompiler(({ schema }) => {
    return ajv.compile(schema);
  });

  app.setErrorHandler((error, request, reply) => {
    // AJV
    if (isAjvError(error)) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Invalid input",
        fields: transformAjvErrors(error.validation),
      });
    }

    // ValidationError
    if (error instanceof ValidationError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
        fields: error.fields,
      });
    }

    // AppError
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: error.code,
        message: error.message,
      });
    }

    // fallback
    request.log.error(error);

    return reply.status(500).send({
      error: "INTERNAL_ERROR",
      message: "Something went wrong",
    });
  });

  // Plugins fundamentais para o carregamento
  await app.register(env, { ajv });
  await app.register(cors);
  await app.register(db);
  await app.register(auth);

  // Plugins mais isolados
  await app.register(Autoload, {
    dir: path.join(root, "plugins/infra"),
  });

  // Carregamento das rotas
  await app.register(Autoload, {
    dir: path.join(root, "modules"),
    indexPattern: /^index\.(ts|js)$/,
  });

  return app;
}

export default buildApp;
