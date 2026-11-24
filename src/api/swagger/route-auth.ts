import type { FastifyInstance } from "fastify";

import { createErrorResponses } from "../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../shared/errors/domain/groups.js";

export function registerRouteAuthentication(app: FastifyInstance) {
  app.addHook("onRoute", (route) => {
    const handlers = Array.isArray(route.preHandler)
      ? route.preHandler
      : route.preHandler
        ? [route.preHandler]
        : [];

    if (handlers.some((handler) => handler === app.verifyAccess)) {
      route.schema ??= {};
      route.config ??= {};

      route.config.auth = true;

      Object.assign(
        (route.schema.response ??= {}),
        createErrorResponses([...routeGroups.auth]),
      );
    }
  });
}
