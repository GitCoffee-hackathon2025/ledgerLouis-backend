// Chat do dashboard: roda o Claude Code (`claude -p`) no servidor e repassa a resposta em streaming (SSE).
// O Claude deste chat só tem as ferramentas MCP de investimentos: sem terminal, sem arquivos.

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";

import { ROOT, fromSource } from "../../../config/paths.js";
import type { ULID } from "../../../domain/shared/id.js";

const TIMEOUT_MS = 300_000;
const TOOL_PREFIX = "mcp__ledgerlouis__";
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

export interface ChatConfig {
  /** Caminho do Claude Code. Vazio = chat desligado neste servidor. */
  claudeBin?: string | undefined;
  model?: string | undefined;
}

/** O servidor MCP roda com o mesmo runtime deste processo (tsx em dev, node em produção), preso ao usuário logado. */
function mcpConfig(userId: ULID) {
  const entry = fromSource(`mcp${extname(fileURLToPath(import.meta.url))}`);

  return JSON.stringify({
    mcpServers: {
      ledgerlouis: {
        command: process.execPath,
        args: [...process.execArgv, entry],
        env: { INVESTMENTS_MCP_USER_ID: userId },
      },
    },
  });
}

// A mensagem NÃO entra nos argumentos: vai pelo stdin, senão "--alguma-flag" no chat viraria opção do CLI.
export function buildCommand(cfg: ChatConfig, userId: ULID, sessionId: string, resume: boolean) {
  return [
    cfg.claudeBin ?? "claude",
    "-p",
    "--output-format", "stream-json", "--verbose", "--include-partial-messages",
    "--tools", "", // nenhuma ferramenta interna (Bash, Edit, Read...): só as de investimentos
    "--strict-mcp-config", "--mcp-config", mcpConfig(userId),
    "--allowedTools", "mcp__ledgerlouis",
    "--permission-mode", "dontAsk", // o que não estiver liberado acima é negado, sem perguntar
    "--append-system-prompt", CHAT_RULES,
    resume ? "--resume" : "--session-id", sessionId,
    ...(cfg.model ? ["--model", cfg.model] : []),
  ];
}

/** Uma linha do stream-json -> eventos simples para o frontend. */
export function parseLine(line: string): ChatEvent[] {
  let ev: Record<string, any>;
  try {
    ev = JSON.parse(line);
  } catch {
    return [];
  }
  if (!ev || typeof ev !== "object") return [];

  if (ev.type === "stream_event") {
    const delta = ev.event?.delta;
    return delta?.type === "text_delta" ? [{ type: "text", text: delta.text }] : [];
  }

  // o texto já veio pelos deltas; daqui só as chamadas de ferramenta
  if (ev.type === "assistant")
    return ((ev.message?.content ?? []) as Record<string, any>[])
      .filter((b) => b.type === "tool_use")
      .map((b) => ({ type: "tool", name: String(b.name ?? "").replace(TOOL_PREFIX, "") }));

  if (ev.type === "system" && ev.subtype === "init") {
    const server = ((ev.mcp_servers ?? []) as Record<string, any>[]).find(
      (s) => s.name === "ledgerlouis",
    );
    return ["connected", "pending"].includes(server?.status)
      ? []
      : [
          {
            type: "warning",
            text: "As ferramentas do LedgerLouis não conectaram; o Claude responde sem os seus dados.",
          },
        ];
  }

  if (ev.type === "result")
    return [
      { type: "done", is_error: Boolean(ev.is_error), error: ev.is_error ? (ev.result ?? null) : null },
    ];

  return [];
}

const sse = (event: ChatEvent) => `data: ${JSON.stringify(event)}\n\n`;
const failed = (error: string) => sse({ type: "done", is_error: true, error });

export const createChatService = (cfg: ChatConfig) => {
  // shortcut: dono de cada conversa fica na memória; reiniciar a API (ou ter várias instâncias) só faz
  // a próxima mensagem abrir conversa nova. Mover para Redis/banco se o histórico precisar sobreviver.
  const owners = new Map<string, ULID>();

  return {
    /** Continua a conversa só se o id foi criado aqui para este mesmo usuário; senão começa outra. */
    session(userId: ULID, sessionId: unknown) {
      const id = typeof sessionId === "string" && UUID_RE.test(sessionId) ? sessionId.toLowerCase() : null;
      if (id && owners.get(id) === userId) return { sessionId: id, resume: true };

      const fresh = randomUUID();
      owners.set(fresh, userId);
      return { sessionId: fresh, resume: false };
    },

    run: (userId: ULID, message: string, sessionId: string, resume: boolean) =>
      runChat(cfg, userId, message, sessionId, resume),
  };
};

async function* runChat(cfg: ChatConfig, userId: ULID, message: string, sessionId: string, resume: boolean) {
    yield sse({ type: "session", session_id: sessionId });

    if (!cfg.claudeBin) {
      yield failed("O chat com o Claude está desligado neste servidor (defina CLAUDE_BIN para ligar).");
      return;
    }

    const [bin, ...args] = buildCommand(cfg, userId, sessionId, resume);
    const proc = spawn(bin!, args, { cwd: ROOT, stdio: ["pipe", "pipe", "pipe"] });
    proc.stdin.on("error", () => {}); // processo que morre cedo (ENOENT) não pode derrubar a API
    proc.stdin.end(message);

    let notFound = false;
    let stderr = "";
    proc.stderr.on("data", (chunk) => (stderr = (stderr + chunk).slice(-500)));
    const closed = new Promise<void>((resolve) => {
      proc.once("close", () => resolve());
      proc.once("error", (e: NodeJS.ErrnoException) => {
        notFound = e.code === "ENOENT";
        resolve();
      });
    });

    const watchdog = setTimeout(() => proc.kill("SIGKILL"), TIMEOUT_MS);
    let finished = false;

    try {
      for await (const line of createInterface({ input: proc.stdout }))
        for (const ev of parseLine(line)) {
          finished ||= ev.type === "done";
          yield sse(ev);
        }
      await closed;

      if (!finished)
        yield failed(
          notFound
            ? "Claude Code não encontrado. Instale e faça login com `claude` no terminal do servidor."
            : stderr.trim() || `o Claude Code saiu com código ${proc.exitCode}`,
        );
    } finally {
      clearTimeout(watchdog);
      // o navegador fechou a conexão no meio: não deixar o processo órfão
      if (proc.exitCode === null) proc.kill();
    }
}
