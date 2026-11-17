import type { FastifyPluginAsync } from "fastify";
import type { buildInvestmentsModule } from "../module.js";
import { createMarketController } from "../controllers/market.controller.js";
import {
  AfterQuery,
  CategoryParam,
  GroupParam,
  ScreenContextBody,
  TickerParam,
  type CategoryRoute,
  type GroupRoute,
  type ScreenCommandsRoute,
  type ScreenContextRoute,
  type TickerRoute,
} from "../schemas/investments.schema.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { secured } from "./options.js";

export const marketRoutes =
  (module: ReturnType<typeof buildInvestmentsModule>): FastifyPluginAsync =>
  async (app) => {
    const controller = createMarketController(module);

    // Ações da B3 com cotação e indicadores
    app.get("/assets", secured(app, "List B3 assets with quote and indicators"), controller.assets);

    // Página da ação: histórico, técnicos, saúde contra o setor, nichos e notícias
    app.get<TickerRoute>(
      "/assets/:ticker",
      secured(app, "Asset detail", { params: TickerParam }, ["ASSET_NOT_FOUND"]),
      controller.asset,
    );

    // Última leitura de cada série macro
    app.get("/macro", secured(app, "Latest macro readings"), controller.macro);

    // Setores e nichos resumidos
    app.get("/groups", secured(app, "List sectors and niches"), controller.groups);

    // Detalhe de um setor ou nicho
    app.get<GroupRoute>(
      "/groups/:kind/:slug",
      secured(app, "Sector or niche detail", { params: GroupParam }, ["INVESTMENT_GROUP_NOT_FOUND"]),
      controller.group,
    );

    // Notícias de uma categoria de feed (geopolitica, ia_bolha)
    app.get<CategoryRoute>(
      "/news/:category",
      secured(app, "News by feed category", { params: CategoryParam }),
      controller.categoryNews,
    );

    // Últimos fechamentos para os minigráficos
    app.get("/sparklines", secured(app, "Recent closes per asset"), controller.sparklines);

    // Tela aberta no dashboard do usuário (lida pelo Claude via MCP)
    app.get("/screen-context", secured(app, "Get current screen context"), controller.getScreenContext);

    app.post<ScreenContextRoute>(
      "/screen-context",
      secured(app, "Publish current screen context", { body: ScreenContextBody }, [
        ...routeGroups.investment,
      ]),
      controller.setScreenContext,
    );

    // Pedidos do Claude para o dashboard (ex.: abrir uma tela)
    app.get<ScreenCommandsRoute>(
      "/screen-commands",
      secured(app, "Poll screen commands", { querystring: AfterQuery }),
      controller.screenCommands,
    );

    // Dispara a coleta dos provedores em segundo plano
    app.post("/sync-trigger", secured(app, "Start market data sync"), controller.triggerSync);
  };
