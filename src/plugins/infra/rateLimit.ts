import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { AppError } from "../../shared/errors/domain/errors.js";
import { createRateLimitService } from "../../infrastructure/rate-limit/service.js";

export default fp(
  async function (app: FastifyInstance) {
    await app.register(fastifyRateLimit, {
      global: true,

      max: 100,
      timeWindow: "1 minute",

      redis: app.redis.raw,

      addHeaders: {
        "x-ratelimit-limit": true,
        "x-ratelimit-remaining": true,
        "x-ratelimit-reset": true,
        "retry-after": true,
      },

      errorResponseBuilder(request, context) {
        throw new AppError("RATE_LIMIT_EXCEEDED");
      },
    });

    app.decorate("limiter", createRateLimitService(app.redis.raw));
  },
  {
    name: "rateLimit",
    dependencies: ["redis"],
  },
);
