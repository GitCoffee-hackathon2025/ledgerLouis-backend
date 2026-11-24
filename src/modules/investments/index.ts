import type { FastifyInstance } from "fastify";

import { buildInvestmentsModule } from "./module.js";

import { chatRoutes } from "./routes/chat.router.js";
import { marketRoutes } from "./routes/market.router.js";
import { portfolioRoutes } from "./routes/portfolio.router.js";

export default async function (app: FastifyInstance) {
  const module = buildInvestmentsModule(app.db, {
    brapiToken: app.config.BRAPI_TOKEN,
    geminiApiKey: app.config.GEMINI_API_KEY,
    model: app.config.GEMINI_CHAT_MODEL,
    sessions: app.redis.raw,
  });

  await app.register(marketRoutes(module), { prefix: "/investments" });
  await app.register(portfolioRoutes(module.portfolioService), { prefix: "/investments" });
  await app.register(chatRoutes(module.chatService), { prefix: "/investments" });
}
