import fp from "fastify-plugin";
import fastifyCors from "@fastify/cors";
import type { FastifyInstance } from "fastify";

export default fp(
  async function (app: FastifyInstance) {
    const allowedOrigins = app.config.ALLOWED_ORIGINS
      ?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean);

    await app.register(fastifyCors, {
      methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
      credentials: true,
      maxAge: 300,

      origin: allowedOrigins?.length
        ? (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) {
              return cb(null, true);
            }

            cb(new Error("Not allowed"), false);
          }
        : true,
    });
  },
  {
    name: "cors",
    dependencies: ["env"],
  },
);