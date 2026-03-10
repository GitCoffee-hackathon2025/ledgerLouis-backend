import fastify from "fastify";
import Autoload from "@fastify/autoload";

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
