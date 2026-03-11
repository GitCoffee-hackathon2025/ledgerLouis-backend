import fp from "fastify-plugin";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

async function swaggerPlugin(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: "LegderLouis API",
        description: "Backend API", // Rascunho
        version: "1.0.0",
      },
    },
  });

  if (app.config.NODE_ENV !== "production") {
    await app.register(swaggerUI, {
      routePrefix: "/docs",
    });
  }
}

export default fp(swaggerPlugin);
