export type Num = number | null;

/** Número vindo de JSON ou CSV (número ou texto com vírgula) -> number; vazio ou inválido vira null. */
export function dec(x: unknown): Num {
  if (x === null || x === undefined || x === "") return null;

  const n = typeof x === "number" ? x : Number(String(x).trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** Só links http(s) entram no banco: o frontend usa a URL direto no href. */
export const isHttpUrl = (url: string) => /^https?:\/\//i.test(url);

export interface ListedStock {
  ticker: string;
  name: string;
  kind: string;
  sector: string;
  subsector: string;
  logoUrl: string;
  price: Num;
  changePct: Num;
  volume: Num;
  marketCap: Num;
}

export interface FundamentalsData {
  revenue: Num;
  ebitda: Num;
  totalDebt: Num;
  totalCash: Num;
  eps: Num;
  roe: Num;
}

export interface MacroData {
  date: string; // AAAA-MM-DD
  value: number;
}

export interface Bar {
  date: string; // AAAA-MM-DD
  open: Num;
  high: Num;
  low: Num;
  close: Num;
  volume: Num;
}

export interface FeedItem {
  title: string;
  url: string;
  publishedAt: Date;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    url: string,
  ) {
    super(`HTTP ${status} em ${url}`);
  }
}

/** GET com tempo limite. Não lança em status de erro: quem chama decide (alguns 403/404 são esperados). */
export function httpGet(url: string, headers: Record<string, string> = {}, timeoutMs = 20_000) {
  return fetch(url, { headers, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
}

export async function ok(r: Response) {
  if (!r.ok) throw new HttpError(r.status, r.url);
  return r;
}
