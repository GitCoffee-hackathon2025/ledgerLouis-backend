// Chat do dashboard: conversa com o Gemini (API do Google) e repassa a resposta em streaming (SSE).
// O Gemini só enxerga as ferramentas MCP de investimentos (chamadas dentro deste processo): sem terminal, sem arquivos.

import { randomUUID } from "node:crypto";
import { GoogleGenAI, type Content, type FunctionDeclaration, type Part } from "@google/genai";

import type { ULID } from "../../../domain/shared/id.js";

const MAX_ROUNDS = 8; // idas e voltas modelo <-> ferramentas por mensagem
const MAX_HISTORY = 200; // conversas guardadas em memória
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CHAT_RULES = `Você está no painel de chat do LedgerLouis, ao lado do dashboard do usuário. Responda em português,
de forma curta e direta, em texto simples (sem tabelas). Siga as instruções do servidor MCP do LedgerLouis.
Quando falar de uma ação, grupo, proposta ou da carteira, use show_on_screen para abri-la no dashboard.
Para mudar carteira ou perfil, use propose_holding_change / propose_profile_change e diga que a sugestão
aparece como cartão para ele aplicar ou recusar: você nunca altera nada sozinho.`;

export type ChatEvent =
  | { type: "session"; session_id: string }
  | { type: "text"; text: string }
  | { type: "tool"; name: string }
  | { type: "warning"; text: string }
  | { type: "done"; is_error: boolean; error: string | null };

/** As ferramentas MCP de um usuário, já conectadas. */
export interface ChatTools {
  instructions?: string | undefined;
  declarations: FunctionDeclaration[];
  call(name: string, args: Record<string, unknown>): Promise<{ error: string } | { result: unknown }>;
  close(): Promise<void>;
}

export interface ChatConfig {
  /** Chave da API do Gemini. Vazio = chat desligado neste servidor. */
  geminiApiKey?: string | undefined;
  model?: string | undefined;
  /** Onde fica o dono de cada conversa (o Redis da API). Sem ele, toda mensagem abre conversa nova. */
  sessions?: SessionStore | undefined;
  /** Abre as ferramentas MCP presas ao usuário logado. */
  connectTools?: ((userId: ULID) => Promise<ChatTools>) | undefined;
}

/** O pedaço do cliente Redis que o chat usa. */
export interface SessionStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options: { EX: number }): Promise<unknown>;
}

const SESSION_TTL_S = 30 * 24 * 3600; // conversa parada há 30 dias não é mais retomada
const ownerKey = (sessionId: string) => `investments:chat:${sessionId}`;

// shortcut: histórico só em memória (some ao reiniciar a API); guardar no Redis se isso incomodar.
const histories = new Map<string, Content[]>();

const sse = (event: ChatEvent) => `data: ${JSON.stringify(event)}\n\n`;
const failed = (error: string) => sse({ type: "done", is_error: true, error });

export const createChatService = (cfg: ChatConfig) => ({
  /** Continua a conversa só se o id foi criado pelo servidor para este mesmo usuário; senão começa outra. */
  async session(userId: ULID, sessionId: unknown) {
    const id = typeof sessionId === "string" && UUID_RE.test(sessionId) ? sessionId.toLowerCase() : null;
    if (id && cfg.sessions && (await cfg.sessions.get(ownerKey(id))) === userId)
      return { sessionId: id, resume: true };

    const fresh = randomUUID();
    await cfg.sessions?.set(ownerKey(fresh), userId, { EX: SESSION_TTL_S });
    return { sessionId: fresh, resume: false };
  },

  run: (userId: ULID, message: string, sessionId: string, resume: boolean) =>
    runChat(cfg, userId, message, sessionId, resume),
});

async function* runChat(cfg: ChatConfig, userId: ULID, message: string, sessionId: string, resume: boolean) {
  yield sse({ type: "session", session_id: sessionId });

  if (!cfg.geminiApiKey || !cfg.connectTools) {
    yield failed("O chat com o Gemini está desligado neste servidor (defina GEMINI_API_KEY para ligar).");
    return;
  }

  if (!resume) histories.delete(sessionId);
  const history = histories.get(sessionId) ?? [];
  histories.delete(sessionId); // reinsere no fim: o mais antigo sai primeiro
  histories.set(sessionId, history);
  if (histories.size > MAX_HISTORY) histories.delete(histories.keys().next().value!);

  const before = history.length;
  history.push({ role: "user", parts: [{ text: message }] });
  let tools: ChatTools | undefined;

  try {
    tools = await cfg.connectTools(userId);
    const ai = new GoogleGenAI({ apiKey: cfg.geminiApiKey });
    const config = {
      systemInstruction: `${tools.instructions ?? ""}\n\n${CHAT_RULES}`,
      tools: [{ functionDeclarations: tools.declarations }],
      automaticFunctionCalling: { disable: true },
    };

    let settled = false;
    for (let round = 0; round < MAX_ROUNDS && !settled; round++) {
      const parts: Part[] = [];
      const stream = await ai.models.generateContentStream({
        model: cfg.model || "gemini-3.5-flash",
        contents: history,
        config,
      });
      for await (const chunk of stream)
        for (const part of chunk.candidates?.[0]?.content?.parts ?? []) {
          parts.push(part);
          if (part.text && !part.thought) yield sse({ type: "text", text: part.text });
        }
      if (!parts.length) break;

      history.push({ role: "model", parts });
      const calls = parts.flatMap((p) => (p.functionCall ? [p.functionCall] : []));
      if (!calls.length) {
        settled = true;
        break;
      }

      const answers: Part[] = [];
      for (const call of calls) {
        yield sse({ type: "tool", name: call.name ?? "" });
        const response = await tools.call(call.name ?? "", call.args ?? {});
        answers.push({ functionResponse: { name: call.name ?? "", response } });
      }
      history.push({ role: "user", parts: answers });
    }

    if (!settled && history.at(-1)?.role === "user")
      yield sse({ type: "warning", text: "Parei depois de muitas chamadas de ferramenta; peça de novo se faltou algo." });
    yield sse({ type: "done", is_error: false, error: null });
  } catch (error) {
    history.length = before; // a próxima mensagem não herda uma volta quebrada
    yield failed(`Gemini: ${(error instanceof Error ? error.message : String(error)).slice(0, 300)}`);
  } finally {
    await tools?.close().catch(() => {});
  }
}
