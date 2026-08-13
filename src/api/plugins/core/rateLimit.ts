import fp from "fastify-plugin";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../../../shared/errors/domain/errors.js";
import {
  createRateLimitService,
  type RateLimitOptions,
} from "../../../infrastructure/rate-limit/service.js";

export default fp(
  async function (app: FastifyInstance) {
    const rateLimit = createRateLimitService(app.redis.raw);

    async function assert(res: FastifyReply, options: RateLimitOptions) {
      const result = await rateLimit.consume(options);

      res
        .header("X-RateLimit-Limit", result.limit)
        .header("X-RateLimit-Remaining", result.remaining)
        .header("X-RateLimit-Reset", result.retryAfter);

      if (!result.allowed) {
        res.header("Retry-After", result.retryAfter);

        throw new AppError("RATE_LIMIT_EXCEEDED", {
          retryAfter: result.retryAfter,
        });
      }
    }

    app.addHook("onRoute", (route) => {
      if (
        app.config.NODE_ENV === "development" &&
        ["/docs", "/queues"].find((patch) => route.url.startsWith(patch))
      )
        route.config = {
          ...route.config,
          disableRateLimit: true,
        };
    });

    app.addHook("onRequest", async (req: FastifyRequest, res: FastifyReply) => {
      if (req.routeOptions.config.disableRateLimit) return;

      const config = req.routeOptions.config?.rateLimit;

      // Rota com rateLimit customizado
      if (config)
        await assert(res, {
          by: config.by ?? "ip",
          id: req.ip,
          max: config.max,
          window: config.window,
        });

      // RateLimit padrão
      await assert(res, {
        by: "ip",
        id: req.ip,
        max: 100,
        window: 60,
        penalty: { initial: 60, max: 3600, remember: 86400 },
      });
    });

    app.decorate("limiter", { assert });
  },
  {
    name: "rateLimit",
    dependencies: ["redis"],
  },
);
