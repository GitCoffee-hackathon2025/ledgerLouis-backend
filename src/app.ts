import fastify from "fastify";
import Autoload from "@fastify/autoload";

import path from "path";

// Core Plugins, só podem ser importados nesse arquivo e precisam ser carregados primeiro
// Para maior organização importe-os na ordem correta de registro
import env from "./plugins/core/env";
import cors from "./plugins/core/cors";

/* 
Para serviços pesados como emails e criação de pdf's será necessário instalar o BullMQ junto com o Redis e configura-los.
Fluxo:
Fastify API → AuthService → AuthService → EmailQueue.add() → Redis → BullMQ Worker → SMTP provider

Aproveitaremos a instalação do Redis para criar o "rate-limit" com o @fastify/rate-limit
Funcionamento dessa arquitetura:
request → verifica IP limit → se autenticado → verifica user limit
O limite por IP não é para limitar usuários, é para limitar origens de tráfego.

E para validação de headers das requisições: @fastify/helmet
*/

// Cria o path global para utilização do Autoload
const root = __dirname;

async function buildApp() {
  const app = fastify({ logger: true });

  // Plugins fundamentais para o carregamento
  await app.register(env);
  await app.register(cors);

  // Plugins mais isolados
  await app.register(Autoload, {
    dir: path.join(root, "plugins/infra"),
  });

  // Carregamento das rotas
  /* await app.register(Autoload, {
    dir: // Rotas
  });
  */

  return app;
}

export default buildApp;
