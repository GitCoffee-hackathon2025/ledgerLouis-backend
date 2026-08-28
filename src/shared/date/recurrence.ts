export type Frequency = "weekly" | "monthly" | "yearly";

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return { year: year!, month: month!, day: day! };
}

function daysInMonth(year: number, month: number) {
  // month é 1-12; dia 0 do mês seguinte = último dia do mês atual
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function formatISODate(year: number, month: number, day: number) {
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

/** "Hoje" no fuso da aplicação, como YYYY-MM-DD. */
export function todayISO(timeZone = "America/Sao_Paulo"): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Calcula a n-ésima ocorrência de uma regra recorrente, ancorada sempre no
 * dia/mês original de startDate — nunca incrementando a partir da última
 * data calculada. Isso evita o erro clássico de recorrência mensal: uma
 * regra começando em 31/jan vai para 28/fev (mês mais curto) e, se o próximo
 * passo partisse do dia 28, cairia em 28/mar em vez do correto 31/mar.
 */
export function addOccurrences(
  startDate: string,
  frequency: Frequency,
  intervalValue: number,
  n: number,
): string {
  const { year, month, day } = parseISODate(startDate);

  if (frequency === "weekly") {
    const base = new Date(Date.UTC(year, month - 1, day));
    base.setUTCDate(base.getUTCDate() + n * intervalValue * 7);
    return formatISODate(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate());
  }

  if (frequency === "monthly") {
    const totalMonths = n * intervalValue;
    const targetIndex = month - 1 + totalMonths;
    const targetYear = year + Math.floor(targetIndex / 12);
    const targetMonth = (((targetIndex % 12) + 12) % 12) + 1;
    const clampedDay = Math.min(day, daysInMonth(targetYear, targetMonth));
    return formatISODate(targetYear, targetMonth, clampedDay);
  }

  // yearly
  const targetYear = year + n * intervalValue;
  const clampedDay = Math.min(day, daysInMonth(targetYear, month));
  return formatISODate(targetYear, month, clampedDay);
}

/**
 * Primeira ocorrência da regra que cai em `reference` ou depois. Usada ao
 * criar uma regra nova: o primeiro lançamento nunca fica no passado, mesmo
 * que startDate seja anterior a hoje (decisão D5 do plano — sem backfill).
 */
export function firstOccurrenceOnOrAfter(
  startDate: string,
  frequency: Frequency,
  intervalValue: number,
  reference: string,
): string {
  let n = 0;
  let candidate = startDate;
  while (candidate < reference) {
    n += 1;
    candidate = addOccurrences(startDate, frequency, intervalValue, n);
  }
  return candidate;
}

/** Primeira ocorrência estritamente depois de `current` — usada pelo worker para avançar `nextRunDate`. */
export function nextOccurrenceAfter(
  startDate: string,
  frequency: Frequency,
  intervalValue: number,
  current: string,
): string {
  let n = 0;
  let candidate = startDate;
  while (candidate <= current) {
    n += 1;
    candidate = addOccurrences(startDate, frequency, intervalValue, n);
  }
  return candidate;
}
