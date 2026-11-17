import type { DB } from "../../types/db.js";

import { createBcbClient } from "../../infrastructure/market-data/bcb.js";
import { createBrapiClient } from "../../infrastructure/market-data/brapi.js";
import { createCvmClient } from "../../infrastructure/market-data/cvm.js";
import { fetchFeed } from "../../infrastructure/market-data/rss.js";
import { createYahooClient } from "../../infrastructure/market-data/yahoo.js";

import { createMarketRepository } from "./repositories/market.repository.js";
import { createPortfolioRepository } from "./repositories/portfolio.repository.js";
import { createChatService, type ChatConfig } from "./services/chat.service.js";
import { createMarketService } from "./services/market.service.js";
import { createPortfolioService } from "./services/portfolio.service.js";
import { createSyncService, type SyncJob } from "./services/sync.service.js";

export interface InvestmentsConfig extends ChatConfig {
  brapiToken?: string | undefined;
}

/** Lê do ambiente as opções do módulo (usado pelos processos fora da API: MCP e scripts). */
export const investmentsConfigFromEnv = (env = process.env): InvestmentsConfig => ({
  brapiToken: env.BRAPI_TOKEN,
  claudeBin: env.CLAUDE_BIN,
  model: env.CLAUDE_CHAT_MODEL,
});

export function buildInvestmentsModule(db: DB, config: InvestmentsConfig = {}) {
  const marketRepo = createMarketRepository(db);
  const portfolioRepo = createPortfolioRepository(db);

  const marketService = createMarketService(marketRepo);
  const portfolioService = createPortfolioService(portfolioRepo, marketRepo);
  const chatService = createChatService(config);
  const syncService = createSyncService(marketRepo, {
    brapi: createBrapiClient(config.brapiToken ?? ""),
    yahoo: createYahooClient(),
    bcb: createBcbClient(),
    cvm: createCvmClient(),
    fetchFeed,
  });

  let syncing: Promise<unknown> | null = null;

  return {
    marketService,
    portfolioService,
    chatService,
    syncService,

    /** Coleta tudo e reavalia os alertas. Cada job respeita o próprio TTL. */
    async syncAll(only?: SyncJob, limit?: number) {
      const reports = await syncService.run(only, limit);
      // gatilhos baratos, sem IA, sobre os dados que acabaram de chegar
      return { reports, alerts: await portfolioService.runAllAlerts() };
    },

    /** Dispara a coleta sem esperar terminar. Uma por vez: chamadas durante a coleta não abrem outra. */
    triggerSync(onError: (error: unknown) => void) {
      syncing ??= this.syncAll()
        .catch(onError)
        .finally(() => (syncing = null));
    },
  };
}
