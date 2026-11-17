import type { FastifyPluginAsync } from "fastify";
import type { buildInvestmentsModule } from "../module.js";
import { createPortfolioController } from "../controllers/portfolio.controller.js";
import {
  ChangeParam,
  DecisionBody,
  HoldingBody,
  IdParam,
  ProfileBody,
  TickerParam,
  type ChangeRoute,
  type DecisionRoute,
  type HoldingRoute,
  type IdRoute,
  type ProfileRoute,
  type TickerRoute,
} from "../schemas/investments.schema.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { secured } from "./options.js";

export const portfolioRoutes =
  (module: ReturnType<typeof buildInvestmentsModule>["portfolioService"]): FastifyPluginAsync =>
  async (app) => {
    const controller = createPortfolioController(module);

    // Perfil de investidor do usuário
    app.get("/profile", secured(app, "Get investor profile"), controller.getProfile);

    app.put<ProfileRoute>(
      "/profile",
      secured(app, "Update investor profile", { body: ProfileBody }, [...routeGroups.investment]),
      controller.updateProfile,
    );

    // Carteira: posições, pesos e exposição por setor
    app.get("/portfolio", secured(app, "Get portfolio"), controller.portfolio);

    // Registrar ou corrigir uma posição
    app.put<HoldingRoute>(
      "/holdings/:ticker",
      secured(app, "Save holding", { params: TickerParam, body: HoldingBody }, [
        ...routeGroups.investment,
        "ASSET_NOT_FOUND",
      ]),
      controller.saveHolding,
    );

    // Remover uma posição
    app.delete<TickerRoute>(
      "/holdings/:ticker",
      secured(app, "Delete holding", { params: TickerParam }, ["ASSET_NOT_FOUND"]),
      controller.deleteHolding,
    );

    // Propostas de carteira gravadas pelo Claude
    app.get("/proposals", secured(app, "List proposals"), controller.proposals);

    app.get<IdRoute>(
      "/proposals/:id",
      secured(app, "Proposal detail", { params: IdParam }, ["PROPOSAL_NOT_FOUND"]),
      controller.proposal,
    );

    // Aprovar, recusar ou ajustar um item da proposta
    app.post<DecisionRoute>(
      "/proposal-items/:id/decision",
      secured(app, "Decide a proposal item", { params: IdParam, body: DecisionBody }, [
        ...routeGroups.investment,
        "PROPOSAL_ITEM_NOT_FOUND",
      ]),
      controller.decide,
    );

    // Alertas da carteira
    app.get("/alerts", secured(app, "List alerts"), controller.alerts);

    app.post<IdRoute>(
      "/alerts/:id/seen",
      secured(app, "Mark alert as seen", { params: IdParam }),
      controller.markAlertSeen,
    );

    // Placar das teses
    app.get("/scoreboard", secured(app, "Thesis scoreboard"), controller.scoreboard);

    // Sugestões do Claude esperando decisão
    app.get("/pending-changes", secured(app, "List pending changes"), controller.pendingChanges);

    app.post<ChangeRoute>(
      "/pending-changes/:id/:verb",
      secured(app, "Apply or reject a pending change", { params: ChangeParam }, [
        ...routeGroups.investment,
        "PENDING_CHANGE_NOT_FOUND",
      ]),
      controller.decideChange,
    );
  };
