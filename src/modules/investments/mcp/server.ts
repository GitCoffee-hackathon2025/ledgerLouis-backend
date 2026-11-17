// Servidor MCP de investimentos (stdio), preso a um usuário. O Claude lê os dados e só grava
// rascunhos, teses avulsas e sugestões: aplicar, aprovar ou recusar é sempre do usuário, na interface.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { AppError } from "../../../shared/errors/domain/errors.js";
import type { ULID } from "../../../domain/shared/id.js";
import type { buildInvestmentsModule } from "../module.js";

const INSTRUCTIONS = `Você é o analista do LedgerLouis, a plataforma de investimentos do usuário.
Regras:
1. Use só números vindos destas ferramentas. Não calcule indicadores por conta própria: P/L, EV/EBITDA,
   margens e medianas já vêm calculados pelo motor do LedgerLouis.
2. Cite a fonte e a data (campos source e fetched_at/date) de todo número que usar.
3. Separe fato (dado da ferramenta), estimativa (projeção com premissas explícitas) e interpretação (sua leitura).
4. Projeção não é promessa: mostre premissas, riscos, contrapontos e o grau de incerteza.
5. Fale em "hipóteses para investigar" e "proposta"; a decisão final é sempre do usuário. Nenhuma ordem é executada.
6. Para perguntas sobre "esta tela", comece por get_screen_context.
7. Indicador null significa dado ausente ou sem sentido (ex.: lucro negativo); diga isso em vez de estimar.
8. Você só grava rascunhos (save_proposal_draft), teses avulsas (record_thesis) e sugestões de mudança na
   carteira ou no perfil (propose_holding_change, propose_profile_change). Aplicar, aprovar, recusar ou ajustar
   é sempre do usuário, na interface. Diga que a sugestão está esperando a confirmação dele.
9. Use show_on_screen para abrir no dashboard a tela de que você está falando (uma ação, a carteira, uma proposta).`;

const proposalItem = z.object({
  ticker: z.string(),
  action: z.string().describe("entrar, sair, aumentar, reduzir ou manter"),
  target_weight: z.number().describe("peso alvo como fração da carteira: 0.15 = 15%"),
  thesis: z.string().describe("tese em até 3 linhas"),
  risks: z.string(),
  invalidation: z.string().describe("o que invalidaria a tese"),
  sources: z
    .array(z.string())
    .describe("fonte e data de cada número usado, ex.: 'brapi, cotação de 29/10/2026'"),
});

export function buildMcpServer(
  { marketService: market, portfolioService: portfolio }: ReturnType<typeof buildInvestmentsModule>,
  userId: ULID,
) {
  const server = new McpServer(
    { name: "LedgerLouis", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  /** Registra uma ferramenta: o retorno vira JSON e erro de regra vira mensagem para o Claude corrigir. */
  function tool<S extends z.ZodRawShape>(
    name: string,
    description: string,
    inputSchema: S,
    run: (args: z.infer<z.ZodObject<S>>) => Promise<unknown>,
  ) {
    server.registerTool(name, { description, inputSchema }, (async (args: z.infer<z.ZodObject<S>>) => {
      try {
        return { content: [{ type: "text", text: JSON.stringify(await run(args)) }] };
      } catch (error) {
        if (!(error instanceof AppError)) throw error;

        const detail = (error as { detail?: string }).detail ?? error.message;
        return { isError: true, content: [{ type: "text", text: detail }] };
      }
    }) as never);
  }

  tool(
    "get_screen_context",
    "O que o usuário está vendo agora no dashboard: rota, título, grupo ou ação e tickers visíveis.",
    {},
    async () => {
      const ctx = await market.getScreenContext(userId);
      return ctx.payload
        ? { screen: ctx.payload, updated_at: ctx.updated_at }
        : { screen: null, note: "Nenhuma tela aberta ainda no dashboard." };
    },
  );

  tool(
    "list_groups",
    "Setores e nichos com variação do dia ponderada, valor de mercado e medianas dos indicadores.",
    {},
    () => market.groups(),
  );

  tool(
    "get_group",
    "Detalhe de um setor (kind='sector') ou nicho (kind='niche'): membros, medianas, macro e notícias. Use list_groups para ver os disponíveis.",
    { kind: z.string(), slug: z.string() },
    ({ kind, slug }) => market.group(kind, slug),
  );

  tool(
    "list_assets",
    "Ações da base com cotação, indicadores calculados, fonte e data. Filtro opcional por nome exato do setor. market: 'B3' (padrão) ou 'US' para as empresas de tecnologia dos EUA.",
    { sector: z.string().optional(), market: z.enum(["B3", "US"]).default("B3") },
    ({ sector, market: m }) => market.listAssets({ market: m, ...(sector && { sector }) }),
  );

  tool(
    "get_asset",
    "Uma ação: cotação, indicadores, técnicos (RSI 14, volatilidade anualizada, retornos), saúde de cada indicador contra a mediana do setor ('melhor', 'na_media', 'pior'), nichos e últimas notícias. Use list_assets para ver os tickers disponíveis.",
    { ticker: z.string() },
    ({ ticker }) => market.assetFull(ticker, false),
  );

  tool(
    "get_macro",
    "Última leitura de cada série macro (Selic meta, IPCA 12 meses, dólar PTAX), com data de referência e fonte.",
    {},
    () => market.latestMacro(),
  );

  tool(
    "get_news",
    "Notícias e fatos relevantes mais recentes. kind: 'fato_relevante', 'comunicado' ou 'noticia'.",
    { ticker: z.string().optional(), kind: z.string().optional(), limit: z.number().int().default(20) },
    (args) => market.news(args),
  );

  tool(
    "get_profile",
    "Perfil do usuário: horizonte, tolerância a risco, aporte mensal, setores a evitar, limiares de alerta e o que falta preencher.",
    {},
    () => portfolio.profile(userId),
  );

  tool(
    "get_portfolio",
    "Carteira atual: posições, valor, pesos, ganho sobre o preço médio, exposição por setor e o perfil.",
    {},
    () => portfolio.portfolio(userId),
  );

  tool(
    "get_latest_proposal",
    "A proposta mais recente com as decisões do usuário em cada item (para comparar com a próxima).",
    {},
    async () =>
      (await portfolio.latestProposal(userId)) ?? { proposal: null, note: "Ainda não há propostas." },
  );

  tool(
    "save_proposal_draft",
    "Grava uma proposta de carteira como RASCUNHO para o usuário revisar item a item. Não executa nada. Rejeita a proposta inteira se houver ticker fora da base, peso fora de 0-100%, soma acima de 100%, ação inválida ou item sem tese, riscos, invalidação ou fontes.",
    { period: z.string(), summary: z.string(), items: z.array(proposalItem) },
    ({ period, summary, items }) => portfolio.saveProposal(userId, period, summary, items),
  );

  tool(
    "record_thesis",
    "Registra uma tese avulsa no placar (expectation: alta, baixa ou neutra), com o preço atual como entrada.",
    {
      ticker: z.string(),
      summary: z.string(),
      expectation: z.string(),
      sources: z.array(z.string()),
      horizon_days: z.number().int().positive().optional(),
    },
    (a) =>
      portfolio.recordThesis(userId, a.ticker, a.summary, a.expectation, a.horizon_days ?? null, a.sources),
  );

  tool(
    "get_alerts",
    "Alertas disparados pelas regras (queda forte, concentração, fato relevante), com os dados do gatilho.",
    { unseen_only: z.boolean().default(true) },
    ({ unseen_only }) => portfolio.alerts(userId, unseen_only, 50),
  );

  tool(
    "get_scoreboard",
    "Placar: cada tese com preço de entrada, preço atual, retorno, se acertou a direção e a decisão do usuário.",
    {},
    () => portfolio.scoreboard(userId),
  );

  tool(
    "show_on_screen",
    "Abre uma tela no dashboard do usuário. Caminhos: /, /grupos, /grupos/sector/<slug>, /grupos/niche/<slug>, /mercado-eua, /acoes/<TICKER>, /carteira, /carteira/propostas/<id>, /alertas, /placar.",
    { path: z.string(), reason: z.string().default("") },
    async ({ path, reason }) => {
      const command = await market.requestNavigation(userId, path, reason);
      return {
        ok: true,
        path: command.payload.path,
        note: "O dashboard abre a tela em alguns segundos, se estiver aberto.",
      };
    },
  );

  tool(
    "propose_holding_change",
    "Sugere registrar, corrigir ou remover (quantity=0) uma posição da carteira. NÃO altera nada: vira um cartão com Aplicar/Recusar para o usuário decidir.",
    {
      ticker: z.string(),
      quantity: z.number(),
      reason: z.string(),
      avg_price: z.number().optional(),
    },
    async (a) => {
      const c = await portfolio.proposeHoldingChange(userId, a.ticker, a.quantity, a.avg_price, a.reason);
      return { id: c.id, status: c.status };
    },
  );

  tool(
    "propose_profile_change",
    "Sugere mudar campos do perfil (horizon_years, risk_tolerance, monthly_contribution, avoid_sectors, notes, alert_daily_drop_pct, alert_max_asset_weight, alert_max_sector_weight). NÃO altera nada até o usuário aplicar.",
    { changes: z.record(z.string(), z.unknown()), reason: z.string() },
    async ({ changes, reason }) => {
      const c = await portfolio.proposeProfileChange(userId, changes, reason);
      return { id: c.id, status: c.status };
    },
  );

  tool(
    "get_pending_changes",
    "Sugestões suas ainda esperando o usuário aplicar ou recusar.",
    {},
    () => portfolio.pendingChanges(userId),
  );

  const prompt = (text: string) => ({
    messages: [{ role: "user" as const, content: { type: "text" as const, text } }],
  });

  server.registerPrompt(
    "proposta_mensal",
    {
      description: "Monta a proposta de carteira do mês para o usuário revisar.",
      argsSchema: { periodo: z.string() },
    },
    ({ periodo }) =>
      prompt(`Monte a proposta de carteira de ${periodo} do LedgerLouis.
1. Leia get_profile. Se faltar horizonte, risco ou aporte, diga quais e pergunte antes de seguir.
2. Leia get_portfolio, get_latest_proposal, get_scoreboard, get_macro, list_groups e get_alerts.
3. Para cada ativo que entra, sai ou muda de peso, consulte get_asset e use só números das ferramentas, com fonte e data.
4. Explique em poucas linhas: concentração por setor, o que mudou desde a proposta anterior e como foram as teses dela.
5. Grave com save_proposal_draft (pesos como fração; soma até 1). Cada item: tese em até 3 linhas, riscos,
   o que invalidaria a tese e fontes.
6. Termine dizendo que a proposta está em rascunho e que a decisão é do usuário na tela de revisão.`),
  );

  server.registerPrompt(
    "explicar_alertas",
    { description: "Explica os alertas novos da carteira." },
    () =>
      prompt(`Leia get_alerts. Para cada alerta: resumo em uma linha, por que importa para a carteira (get_portfolio),
os dados que o sustentam com fonte e data (get_asset, get_news), riscos, contrapontos e o que investigar.
Não sugira ordens; no máximo, se vale antecipar a revisão da carteira.`),
  );

  return server;
}
