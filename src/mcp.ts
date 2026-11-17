// Servidor MCP de investimentos (stdio). Lê o banco direto: não precisa da API de pé, só do mesmo .env.
//
// Rodar: INVESTMENTS_MCP_USER_ID=<id ou e-mail do usuário> npx tsx src/mcp.ts

import dotenv from "dotenv";
dotenv.config({ quiet: true }); // stdout é o canal do protocolo: nada além dele pode escrever ali

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { toId } from "./domain/shared/id.js";
import { createDatabaseService } from "./infrastructure/database/index.js";
import { buildMcpServer } from "./modules/investments/mcp/server.js";
import { buildInvestmentsModule, investmentsConfigFromEnv } from "./modules/investments/module.js";

async function start() {
  const { DATABASE_URL, INVESTMENTS_MCP_USER_ID: who } = process.env;
  if (!DATABASE_URL || !who)
    throw new Error("defina DATABASE_URL e INVESTMENTS_MCP_USER_ID (id ou e-mail do usuário)");

  const { db, close } = await createDatabaseService(DATABASE_URL);
  const user = await db.query.users.findFirst({
    columns: { id: true },
    where: (t, { eq, or }) => or(eq(t.id, toId(who)), eq(t.email, who)),
  });
  if (!user) throw new Error(`usuário não encontrado: ${who}`);

  const server = buildMcpServer(buildInvestmentsModule(db, investmentsConfigFromEnv()), user.id);
  server.server.onclose = () => void close();

  await server.connect(new StdioServerTransport());
}

start().catch((error) => {
  console.error("Falha ao iniciar o servidor MCP:", error);
  process.exit(1);
});
