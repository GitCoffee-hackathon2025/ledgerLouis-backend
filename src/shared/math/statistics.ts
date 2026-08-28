export interface MonthlyPoint {
  period: string;
  total: number;
}

export interface AmountRecord {
  amount: string;
  date: string;
}

// Somar numeric(15,2) como float acumula erro de ponto flutuante
// (ex: 4020.4700000000003). Arredondar pra centavos em cada etapa evita
// esse ruído se propagar pro mean/variância/previsão e vazar pra UI.
function round2(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function groupByMonth(records: AmountRecord[]): MonthlyPoint[] {
  const totals = new Map<string, number>();

  for (const record of records) {
    const period = record.date.slice(0, 7);
    totals.set(period, (totals.get(period) ?? 0) + Number(record.amount));
  }

  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, total]) => ({ period, total: round2(total) }));
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function variance(values: number[]): number {
  if (values.length < 2) return 0;

  const avg = mean(values);
  const squaredDiffs = values.reduce((sum, value) => sum + (value - avg) ** 2, 0);

  return round2(squaredDiffs / (values.length - 1));
}

export function standardDeviation(values: number[]): number {
  return round2(Math.sqrt(variance(values)));
}

/**
 * Previsão do próximo ponto via regressão linear simples (mínimos quadrados)
 * sobre a série de totais mensais. Com menos de 2 pontos, não há tendência
 * a extrapolar.
 */
export function linearForecast(values: number[]): number | null {
  const n = values.length;
  if (n === 0) return null;
  if (n === 1) return values[0] ?? null;

  const xs = values.map((_, index) => index);
  const sumX = xs.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * (values[i] ?? 0), 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return mean(values);

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return round2(intercept + slope * n);
}

export interface ExpenseStats {
  months: MonthlyPoint[];
  count: number;
  mean: number;
  variance: number;
  standardDeviation: number;
  forecastNextMonth: number | null;
}

export function computeExpenseStats(records: AmountRecord[]): ExpenseStats {
  const months = groupByMonth(records);
  const totals = months.map((point) => point.total);

  return {
    months,
    count: records.length,
    mean: mean(totals),
    variance: variance(totals),
    standardDeviation: standardDeviation(totals),
    forecastNextMonth: linearForecast(totals),
  };
}
