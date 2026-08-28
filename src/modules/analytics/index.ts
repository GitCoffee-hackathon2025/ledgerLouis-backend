import type { FastifyInstance } from "fastify";

import { buildAnalyticsModule } from "./module.js";
import { analyticsRoutes } from "./routes/analytics.router.js";

export default async function (app: FastifyInstance) {
  const module = buildAnalyticsModule(app.db);

  await app.register(analyticsRoutes(module.analyticsService), {
    prefix: "/companies",
  });
}
