import { Readable } from "node:stream";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { buildInvestmentsModule } from "../module.js";
import type { ChatRoute } from "../schemas/investments.schema.js";

export const createChatController = (
  chat: ReturnType<typeof buildInvestmentsModule>["chatService"],
) => ({
  /** Resposta em streaming (SSE). Se o navegador fechar a conexão, o processo do Claude é encerrado. */
  async chat(req: FastifyRequest<ChatRoute>, res: FastifyReply) {
    const { sessionId, resume } = chat.session(req.body.session_id);
    const events = chat.run(req.authUser.sub, req.body.message.trim(), sessionId, resume);

    return res
      .header("Content-Type", "text/event-stream")
      .header("Cache-Control", "no-cache")
      .header("X-Accel-Buffering", "no")
      .send(Readable.from(events));
  },
});
