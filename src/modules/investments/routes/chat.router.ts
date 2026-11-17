import type { FastifyPluginAsync } from "fastify";
import type { buildInvestmentsModule } from "../module.js";
import { createChatController } from "../controllers/chat.controller.js";
import { ChatBody, type ChatRoute } from "../schemas/investments.schema.js";
import { secured } from "./options.js";

export const chatRoutes =
  (module: ReturnType<typeof buildInvestmentsModule>["chatService"]): FastifyPluginAsync =>
  async (app) => {
    const controller = createChatController(module);

    // Conversa com o Claude sobre os dados de investimentos (resposta em SSE)
    app.post<ChatRoute>(
      "/chat",
      {
        ...secured(app, "Chat with Claude (SSE stream)", { body: ChatBody }),
        // cada mensagem abre um processo do Claude no servidor: bem menos que o limite geral
        config: { auth: true, rateLimit: { by: "user", max: 10, window: 60 } },
      },
      controller.chat,
    );
  };
