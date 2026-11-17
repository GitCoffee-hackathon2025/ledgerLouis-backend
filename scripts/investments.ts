// Tarefas de investimentos pelo terminal (para agendar no cron ou rodar à mão).
//
//   npm run inv:sync                       coleta tudo, respeitando o cache de cada fonte
//   npm run inv:sync -- --only macro       só uma parte (stocks, fundamentals, history, us_stocks, us_history, macro, news)
//   npm run inv:sync -- --limit 20         quantas ações da B3 buscar (padrão 50)
//   npm run inv:seed                       cria os nichos e feeds iniciais e liga os tickers já sincronizados

import dotenv from "dotenv";
dotenv.config();

import { parseArgs } from "node:util";

import { createDatabaseService } from "../src/infrastructure/database/index.js";
import { buildInvestmentsModule, investmentsConfigFromEnv } from "../src/modules/investments/module.js";
import { SYNC_JOBS, type SyncJob } from "../src/modules/investments/services/sync.service.js";

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { only: { type: "string" }, limit: { type: "string", default: "50" } },
});
const [command] = positionals;
const only = values.only as SyncJob | undefined;

if (!["sync", "seed"].includes(command ?? "") || (only && !SYNC_JOBS.includes(only))) {
  console.error(`uso: investments.ts sync [--only ${SYNC_JOBS.join("|")}] [--limit N] | seed`);
  process.exit(1);
}
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL não definida");

const config = investmentsConfigFromEnv();
const { db, close } = await createDatabaseService(process.env.DATABASE_URL);
const module = buildInvestmentsModule(db, config);

try {
  if (command === "seed") {
    const linked = await module.syncService.seedNiches();
    const feeds = await module.syncService.seedNewsFeeds();
    console.log(`nichos prontos, ${linked} ativos ligados, ${feeds} feeds novos`);
  } else {
    if (!config.brapiToken && (!only || ["stocks", "fundamentals", "history"].includes(only)))
      console.error("BRAPI_TOKEN vazio: sem token a brapi só responde alguns tickers de teste.");

    const { reports, alerts } = await module.syncAll(only, Number(values.limit) || 50);
    for (const [name, r] of Object.entries(reports)) {
      console.log(`${name}: ${r.ok} ok, ${r.skipped} pulados, ${r.errors.length} erros`);
      for (const error of r.errors) console.error(`  ${error}`);
    }
    console.log(`alertas novos: ${alerts}`);
  }
} finally {
  await close();
}
