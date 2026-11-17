import type { FastifyReply, FastifyRequest } from "fastify";
import { toId } from "../../../domain/shared/id.js";
import type { buildInvestmentsModule } from "../module.js";
import type {
  ChangeRoute,
  DecisionRoute,
  HoldingRoute,
  IdRoute,
  ProfileRoute,
  TickerRoute,
} from "../schemas/investments.schema.js";

export const createPortfolioController = (
  portfolio: ReturnType<typeof buildInvestmentsModule>["portfolioService"],
) => ({
  async getProfile(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.profile(req.authUser.sub));
  },

  async updateProfile(req: FastifyRequest<ProfileRoute>, res: FastifyReply) {
    return res.status(200).send(await portfolio.updateProfile(req.authUser.sub, req.body));
  },

  async portfolio(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.portfolio(req.authUser.sub));
  },

  async saveHolding(req: FastifyRequest<HoldingRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await portfolio.saveHolding(
          req.authUser.sub,
          req.params.ticker,
          req.body.quantity,
          req.body.avg_price,
        ),
      );
  },

  async deleteHolding(req: FastifyRequest<TickerRoute>, res: FastifyReply) {
    await portfolio.deleteHolding(req.authUser.sub, req.params.ticker);
    return res.status(204).send();
  },

  async proposals(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.proposals(req.authUser.sub));
  },

  async proposal(req: FastifyRequest<IdRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(await portfolio.proposal(req.authUser.sub, toId(req.params.id)));
  },

  async decide(req: FastifyRequest<DecisionRoute>, res: FastifyReply) {
    return res
      .status(200)
      .send(
        await portfolio.decide(
          req.authUser.sub,
          toId(req.params.id),
          req.body.decision,
          req.body.adjusted_weight,
          req.body.comment,
        ),
      );
  },

  async alerts(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.alerts(req.authUser.sub));
  },

  async markAlertSeen(req: FastifyRequest<IdRoute>, res: FastifyReply) {
    await portfolio.markAlertSeen(req.authUser.sub, toId(req.params.id));
    return res.status(204).send();
  },

  async scoreboard(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.scoreboard(req.authUser.sub));
  },

  async pendingChanges(req: FastifyRequest, res: FastifyReply) {
    return res.status(200).send(await portfolio.pendingChanges(req.authUser.sub));
  },

  async decideChange(req: FastifyRequest<ChangeRoute>, res: FastifyReply) {
    const { id, verb } = req.params;
    const decide = verb === "apply" ? portfolio.applyChange : portfolio.rejectChange;

    return res.status(200).send(await decide(req.authUser.sub, toId(id)));
  },
});
