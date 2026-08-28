import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildAnalyticsModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import type {
  GetExpenseStatsRoute,
  GetExpenseStatsByTagRoute,
} from "../schemas/analytics.schema.js";

export const createAnalyticsController = (
  analytics: ReturnType<typeof buildAnalyticsModule>["analyticsService"],
) => ({
  async getExpenseStats(req: FastifyRequest<GetExpenseStatsRoute>, res: FastifyReply) {
    const { companyId } = req.params;
    const { tagId } = req.query;

    return res
      .status(200)
      .send(
        await analytics.getExpenseStats(
          toId(companyId),
          req.authUser.sub,
          tagId ? toId(tagId) : undefined,
        ),
      );
  },

  async getExpenseStatsByTag(
    req: FastifyRequest<GetExpenseStatsByTagRoute>,
    res: FastifyReply,
  ) {
    const { companyId } = req.params;

    return res
      .status(200)
      .send(await analytics.getExpenseStatsByTag(toId(companyId), req.authUser.sub));
  },
});
