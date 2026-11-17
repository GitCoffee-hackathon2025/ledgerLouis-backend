// Indicadores fundamentalistas. Sem banco, sem rede, sem IA.
//
// Convenção: qualquer entrada ausente, ou um denominador que torna o número
// enganoso (lucro, EBITDA ou receita <= 0), devolve null, exibido como "—".

export type Num = number | null | undefined;

export interface Snapshot {
  price?: Num;
  marketCap?: Num;
  eps?: Num;
  revenue?: Num;
  ebitda?: Num;
  totalDebt?: Num;
  totalCash?: Num;
  roeReported?: Num;
}

export interface Indicators {
  pe: number | null;
  ev_ebitda: number | null;
  net_debt_ebitda: number | null;
  net_margin: number | null;
  roe: number | null;
}

const has = (x: Num): x is number => x !== null && x !== undefined;
const positive = (x: Num): x is number => has(x) && x > 0;

export function priceToEarnings(price: Num, eps: Num) {
  return has(price) && positive(eps) ? price / eps : null;
}

export function enterpriseValue(marketCap: Num, totalDebt: Num, totalCash: Num) {
  return has(marketCap) && has(totalDebt) && has(totalCash)
    ? marketCap + totalDebt - totalCash
    : null;
}

export function evToEbitda(ev: Num, ebitda: Num) {
  return has(ev) && positive(ebitda) ? ev / ebitda : null;
}

export function netDebtToEbitda(totalDebt: Num, totalCash: Num, ebitda: Num) {
  return has(totalDebt) && has(totalCash) && positive(ebitda)
    ? (totalDebt - totalCash) / ebitda
    : null;
}

/** Lucro = LPA × número de ações, com ações = valor de mercado / preço. */
export function netIncomeFromEps(eps: Num, marketCap: Num, price: Num) {
  return has(eps) && has(marketCap) && positive(price)
    ? (eps * marketCap) / price
    : null;
}

export function netMargin(netIncome: Num, revenue: Num) {
  return has(netIncome) && positive(revenue) ? netIncome / revenue : null;
}

export function computeIndicators(s: Snapshot): Indicators {
  const ev = enterpriseValue(s.marketCap, s.totalDebt, s.totalCash);
  const netIncome = netIncomeFromEps(s.eps, s.marketCap, s.price);

  return {
    pe: priceToEarnings(s.price, s.eps),
    ev_ebitda: evToEbitda(ev, s.ebitda),
    net_debt_ebitda: netDebtToEbitda(s.totalDebt, s.totalCash, s.ebitda),
    net_margin: netMargin(netIncome, s.revenue),
    // ROE vem pronto do provedor (sem patrimônio no plano grátis); a fonte fica registrada.
    roe: s.roeReported ?? null,
  };
}
