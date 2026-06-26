import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export default fp(
  async function (app: FastifyInstance) {
    // Armazendo as origens no formato necessário para validação
    const allowedOrigins = new Set(
      app.config.ALLOWED_ORIGINS.split(",").map((o: string) => o.trim()),
    );

    await app.register(fastifyCors, {
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
      maxAge: 300, // Meia hora
      origin: (origin, cb) => {
        if (!origin) return cb(null, true);

        if (
          app.config.NODE_ENV === "development" &&
          /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        )
          return cb(null, true);

        if (allowedOrigins.has(origin)) return cb(null, true);

        cb(new Error("Not allowed"), false);
      },
    });
  },
  {
    name: "cors",
    dependencies: ["env"],
  },
);
