// Liga o servidor MCP de investimentos a um cliente no mesmo processo (sem subprocesso), preso a um usuário.

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

import type { ULID } from "../../../domain/shared/id.js";
import type { ChatTools } from "../services/chat.service.js";
import { buildMcpServer, type McpServices } from "./server.js";

export async function connectInProcessTools(
  module: McpServices,
  userId: ULID,
): Promise<ChatTools> {
  const server = buildMcpServer(module, userId);
  const client = new Client({ name: "ledgerlouis-chat", version: "1.0.0" });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(a), client.connect(b)]);

  const { tools } = await client.listTools();
  return {
    instructions: client.getInstructions(),
    declarations: tools.map((t) => ({ name: t.name, ...(t.description && { description: t.description }), parametersJsonSchema: t.inputSchema })),
    async call(name, args) {
      const r = await client.callTool({ name, arguments: args });
      const text = ((r.content ?? []) as { type: string; text?: string }[]).map((c) => c.text ?? "").join("\n");
      if (r.isError) return { error: text };
      try {
        return { result: JSON.parse(text) };
      } catch {
        return { result: text };
      }
    },
    close: () => client.close(),
  };
}
