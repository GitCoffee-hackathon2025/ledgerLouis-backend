// Carteira: valor, pesos, exposição, validação de proposta e gatilhos de alerta.

export const ACTIONS = ["aumentar", "entrar", "manter", "reduzir", "sair"];
export const EXPECTATION: Record<string, "alta" | "baixa" | "neutra"> = {
  entrar: "alta",
  aumentar: "alta",
  sair: "baixa",
  reduzir: "baixa",
  manter: "neutra",
};

const MISSING_TEXT = {
  thesis: "tese vazia",
  risks: "riscos vazios",
  invalidation: "falta dizer o que invalida a tese",
} as const;

// Pesos têm 6 casas no banco; arredondar evita que 0.1 + 0.2 + 0.7 passe de 1 por ruído de float.
const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** 0.372 -> '37,2%' (vírgula decimal, como no resto da interface). */
export const pct = (fraction: number) =>
  `${(fraction * 100).toFixed(1).replace(".", ",")}%`;

export interface PositionInput {
  ticker: string;
  sector: string;
  quantity: number;
  price: number | null;
  change_pct: number | null;
}

/** Sem cotação fica fora dos pesos. */
export function valuate<P extends PositionInput>(positions: P[]) {
  const valued = positions.map((p) => ({
    ...p,
    value: p.price === null ? null : p.quantity * p.price,
  }));
  const total = valued.reduce((sum, p) => sum + (p.value ?? 0), 0);
  const out = valued.map((p) => ({
    ...p,
    weight: p.value !== null && total ? p.value / total : null,
  }));

  return {
    positions: out,
    total: total || null,
    unpriced: out.filter((p) => p.value === null).map((p) => p.ticker),
  };
}

export function exposureBySector(
  positions: { sector: string; weight: number | null }[],
) {
  const out: Record<string, number> = {};
  for (const p of positions) {
    if (p.weight === null) continue;
    const key = p.sector || "Sem classificação";
    out[key] = (out[key] ?? 0) + p.weight;
  }
  return out;
}

export interface ProposalItemInput {
  ticker: string;
  action?: unknown;
  target_weight: number | null;
  thesis?: unknown;
  risks?: unknown;
  invalidation?: unknown;
  sources?: unknown;
}

/** Devolve todos os problemas de uma vez; lista vazia = proposta válida. */
export function validateProposal(
  items: ProposalItemInput[],
  knownTickers: Set<string>,
): string[] {
  if (!items.length) return ["a proposta não tem itens"];

  const problems: string[] = [];
  const seen = new Set<string>();

  for (const it of items) {
    const t = it.ticker || "?";
    if (seen.has(t)) problems.push(`${t}: ticker repetido`);
    seen.add(t);

    if (!knownTickers.has(t)) problems.push(`${t}: ticker fora da base`);
    if (!ACTIONS.includes(it.action as string))
      problems.push(`${t}: ação inválida (${it.action}); use ${ACTIONS.join(", ")}`);

    const w = it.target_weight;
    if (w === null || !(w >= 0 && w <= 1))
      problems.push(`${t}: peso fora de 0 a 100%`);

    for (const [field, message] of Object.entries(MISSING_TEXT))
      if (!String(it[field as keyof typeof MISSING_TEXT] ?? "").trim())
        problems.push(`${t}: ${message}`);

    if (!Array.isArray(it.sources) || !it.sources.length)
      problems.push(`${t}: sem fontes`);
  }

  const total = round6(
    items.reduce((sum, it) => sum + Math.max(it.target_weight ?? 0, 0), 0),
  );
  if (total > 1)
    problems.push(`soma dos pesos é ${(total * 100).toFixed(2)}%, acima de 100%`);

  return problems;
}

// ---- Gatilhos baratos de alerta, sem IA. O Claude só explica o que já disparou. ----

export interface Thresholds {
  dailyDropPct: number; // pontos percentuais (5 = queda de 5% no dia)
  maxAssetWeight: number; // fração
  maxSectorWeight: number; // fração
}

export interface Trigger {
  kind: string;
  key: string; // identifica o mesmo gatilho para não repetir no mesmo dia
  title: string;
  ticker: string | null;
  detail: Record<string, unknown>;
}

export function triggers(
  positions: { ticker: string; change_pct: number | null; weight: number | null }[],
  sectors: Record<string, number>,
  t: Thresholds,
  newFilings: { ticker: string; title: string; url: string }[],
): Trigger[] {
  const out: Trigger[] = [];

  for (const p of positions) {
    if (p.change_pct !== null && p.change_pct <= -t.dailyDropPct)
      out.push({
        kind: "queda_forte",
        key: `queda_forte:${p.ticker}`,
        title: `${p.ticker} caiu ${pct(-p.change_pct / 100)} hoje`,
        ticker: p.ticker,
        detail: { change_pct: p.change_pct },
      });

    if (p.weight !== null && p.weight > t.maxAssetWeight)
      out.push({
        kind: "concentracao_ativo",
        key: `concentracao_ativo:${p.ticker}`,
        title: `${p.ticker} ocupa ${pct(p.weight)} da carteira`,
        ticker: p.ticker,
        detail: { weight: p.weight, limit: t.maxAssetWeight },
      });
  }

  for (const [sector, w] of Object.entries(sectors))
    if (w > t.maxSectorWeight)
      out.push({
        kind: "concentracao_setor",
        key: `concentracao_setor:${sector}`,
        title: `${sector} ocupa ${pct(w)} da carteira`,
        ticker: null,
        detail: { sector, weight: w, limit: t.maxSectorWeight },
      });

  for (const f of newFilings)
    out.push({
      kind: "fato_relevante",
      key: `fato_relevante:${f.url}`,
      title: `${f.ticker}: ${f.title}`,
      ticker: f.ticker,
      detail: { url: f.url },
    });

  return out;
}
