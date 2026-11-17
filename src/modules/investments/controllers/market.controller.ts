import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildInvestmentsModule } from "../module.js";
import type {
  CategoryRoute,
  GroupRoute,
  ScreenCommandsRoute,
  ScreenContextRoute,
  TickerRoute,
} from "../schemas/investments.schema.js";

export const createMarketController = (
  module: ReturnType<typeof buildInvestmentsModule>,
) => {
  const market = module.marketService;

  return {
    async assets(_req: FastifyRequest, res: FastifyReply) {
      return res.status(200).send(await market.listAssets());
    },

    async asset(req: FastifyRequest<TickerRoute>, res: FastifyReply) {
      return res.status(200).send(await market.assetFull(req.params.ticker));
    },

    async macro(_req: FastifyRequest, res: FastifyReply) {
      return res.status(200).send(await market.latestMacro());
    },

    async groups(_req: FastifyRequest, res: FastifyReply) {
      return res.status(200).send(await market.groups());
    },

    async group(req: FastifyRequest<GroupRoute>, res: FastifyReply) {
      return res.status(200).send(await market.group(req.params.kind, req.params.slug));
    },

    async categoryNews(req: FastifyRequest<CategoryRoute>, res: FastifyReply) {
      return res.status(200).send(await market.categoryNews(req.params.category));
    },

    async sparklines(_req: FastifyRequest, res: FastifyReply) {
      return res.status(200).send(await market.sparklines());
    },

    async getScreenContext(req: FastifyRequest, res: FastifyReply) {
      return res.status(200).send(await market.getScreenContext(req.authUser.sub));
    },

    async setScreenContext(req: FastifyRequest<ScreenContextRoute>, res: FastifyReply) {
      await market.setScreenContext(req.authUser.sub, req.body);
      return res.status(204).send();
    },

    async screenCommands(req: FastifyRequest<ScreenCommandsRoute>, res: FastifyReply) {
      return res
        .status(200)
        .send(await market.screenCommands(req.authUser.sub, req.query.after));
    },

    /** Responde na hora; a coleta segue em segundo plano. */
    async triggerSync(req: FastifyRequest, res: FastifyReply) {
      module.triggerSync((error) => req.log.error(error, "sincronização de investimentos falhou"));
      return res.status(202).send({ started: true });
    },
  };
};
