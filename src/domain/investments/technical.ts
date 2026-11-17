// Indicadores técnicos sobre fechamentos diários.

const TRADING_DAYS = 252;

/** Média móvel simples alinhada à entrada: as n-1 primeiras posições ficam null. */
export function sma(closes: number[], n: number): (number | null)[] {
  return closes.map((_, i) =>
    i + 1 < n
      ? null
      : closes.slice(i + 1 - n, i + 1).reduce((a, b) => a + b, 0) / n,
  );
}

/** RSI de Wilder do último dia; null sem n+1 fechamentos. */
export function rsi(closes: number[], n = 14): number | null {
  if (closes.length < n + 1) return null;

  const changes = closes.slice(1).map((c, i) => c - closes[i]!);
  let gain = 0;
  let loss = 0;

  for (const c of changes.slice(0, n)) {
    gain += Math.max(c, 0) / n;
    loss += Math.max(-c, 0) / n;
  }
  for (const c of changes.slice(n)) {
    gain = (gain * (n - 1) + Math.max(c, 0)) / n;
    loss = (loss * (n - 1) + Math.max(-c, 0)) / n;
  }

  return loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
}

/** Desvio padrão amostral dos retornos log diários, anualizado. Precisa de 2 retornos. */
export function annualizedVolatility(closes: number[]): number | null {
  const rets: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const a = closes[i - 1]!;
    const b = closes[i]!;
    if (a > 0 && b > 0) rets.push(Math.log(b / a));
  }
  if (rets.length < 2) return null;

  const avg = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance =
    rets.reduce((sum, r) => sum + (r - avg) ** 2, 0) / (rets.length - 1);

  return Math.sqrt(variance) * Math.sqrt(TRADING_DAYS);
}

export function periodReturn(closes: number[], days: number): number | null {
  const base = closes[closes.length - 1 - days];
  if (closes.length <= days || base === undefined || base <= 0) return null;

  return closes[closes.length - 1]! / base - 1;
}
