// Agregação de setores e nichos, e o semáforo de saúde contra a mediana do grupo.

import type { Indicators } from "./fundamentals.js";

type Num = number | null;

export interface GroupMember {
  marketCap: Num;
  changePct: Num;
  indicators: Indicators;
}

export function median(values: Num[]): Num {
  const xs = values.filter((v): v is number => v !== null).sort((a, b) => a - b);
  if (!xs.length) return null;

  const mid = Math.floor(xs.length / 2);
  return xs.length % 2 ? xs[mid]! : (xs[mid - 1]! + xs[mid]!) / 2;
}

export function summarize(members: GroupMember[]) {
  const caps = members.flatMap((m) => (m.marketCap === null ? [] : [m.marketCap]));
  const weighted = members.filter((m) => m.marketCap && m.changePct !== null);
  const weight = weighted.reduce((sum, m) => sum + m.marketCap!, 0);
  const keys = Object.keys(members[0]?.indicators ?? {}) as (keyof Indicators)[];

  return {
    count: members.length,
    market_cap: caps.length ? caps.reduce((a, b) => a + b, 0) : null,
    change_pct: weight
      ? weighted.reduce((sum, m) => sum + m.marketCap! * m.changePct!, 0) / weight
      : null,
    medians: Object.fromEntries(
      keys.map((k) => [k, median(members.map((m) => m.indicators[k]))]),
    ) as Partial<Indicators>,
  };
}

// Semáforo relativo: cada indicador contra a mediana do grupo. Sem limites absolutos inventados.
const LOWER_IS_BETTER = new Set(["pe", "ev_ebitda", "net_debt_ebitda"]);
const TOLERANCE = 0.1; // dentro de 10% da mediana conta como "na média"

export type Health = "melhor" | "na_media" | "pior" | null;

export function compareToMedian(
  indicators: Indicators,
  medians: Partial<Indicators>,
) {
  const out: Record<string, Health> = {};

  for (const [k, v] of Object.entries(indicators) as [keyof Indicators, Num][]) {
    const m = medians[k] ?? null;
    if (v === null || m === null) {
      out[k] = null;
      continue;
    }

    // positivo = melhor que a mediana
    const diff = LOWER_IS_BETTER.has(k) ? m - v : v - m;
    out[k] =
      Math.abs(diff) <= Math.abs(m) * TOLERANCE
        ? "na_media"
        : diff > 0
          ? "melhor"
          : "pior";
  }

  return out;
}

/** "Bancos e financeiro" -> "bancos-e-financeiro" (sem acentos, só letras, números e hífen). */
export const slugify = (s: string) =>
  s
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[-\s]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");
