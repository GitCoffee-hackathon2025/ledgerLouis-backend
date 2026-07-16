import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import fastifyRateLimit from "@fastify/rate-limit";
import { AppError } from "../../shared/errors/domain/errors.js";
import { createRateLimitService } from "../../infrastructure/rate-limit/service.js";

export default fp(
  async function (app: FastifyInstance) {
    // await app.register(fastifyRateLimit, {
    //   global: true,

    //   max: 100,
    //   timeWindow: "1 minute",

    //   redis: app.redis.raw,

    //   addHeaders: {
    //     "x-ratelimit-limit": true,
    //     "x-ratelimit-remaining": true,
    //     "x-ratelimit-reset": true,
    //     "retry-after": true,
    //   },

    //   errorResponseBuilder(request, context) {
    //     const { statusCode, code, message, ...payload } = new AppError(
    //       "RATE_LIMIT_EXCEEDED",
    //       {
    //         retryAfter: Number(context.after),
    //       },
    //     );

    //     return { error: code, message, ...payload };
    //   },
    // });

    app.addHook("onRequest", async (req) => {
      await app.limiter.assert({
        scope: "ip",
        id: req.ip,
        max: 100,
        window: 60,
      });
    });

    app.decorate("limiter", createRateLimitService(app.redis.raw));
  },
  {
    name: "rateLimit",
    dependencies: ["redis"],
  },
);
