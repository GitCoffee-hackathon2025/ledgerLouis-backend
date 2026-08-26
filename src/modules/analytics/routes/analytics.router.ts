import type { FastifyPluginAsync } from "fastify";
import type { buildAnalyticsModule } from "../module.js";
import { createAnalyticsController } from "../controllers/analytics.controller.js";
import {
  CompanyIdParam,
  ExpenseStatsQuery,
  ExpenseStatsResponse,
  ExpenseStatsByTagResponse,
  type GetExpenseStatsRoute,
  type GetExpenseStatsByTagRoute,
} from "../schemas/analytics.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const analyticsRoutes =
  (
    module: ReturnType<typeof buildAnalyticsModule>["analyticsService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createAnalyticsController(module);

    // Estatísticas de gastos gerais da empresa, ou de uma tag específica (?tagId=)
    app.get<GetExpenseStatsRoute>(
      "/:companyId/analytics/expenses",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["analytics"],
          summary: "Get expense statistics (mean, variance, standard deviation, forecast)",
          params: CompanyIdParam,
          querystring: ExpenseStatsQuery,
          response: {
            200: ExpenseStatsResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.tag,
            ]),
          },
        },
      },
      controller.getExpenseStats,
    );

    // Estatísticas de gastos agrupadas por cada tag da empresa
    app.get<GetExpenseStatsByTagRoute>(
      "/:companyId/analytics/expenses/by-tag",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["analytics"],
          summary: "Get expense statistics grouped by tag",
          params: CompanyIdParam,
          response: {
            200: ExpenseStatsByTagResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
            ]),
          },
        },
      },
      controller.getExpenseStatsByTag,
    );
  };
