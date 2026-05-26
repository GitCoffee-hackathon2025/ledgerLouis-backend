import fastify from "fastify";
import Autoload from "@fastify/autoload";

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
const root = new URL(".", import.meta.url);

async function buildApp() {
  const app = fastify({ logger: true });

  await app.register(Autoload, {
    dir: new URL("./plugins", root).pathname,
  });

  return app;
}

export default buildApp;
