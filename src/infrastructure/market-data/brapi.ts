import { dec, httpGet, ok, type Bar, type FundamentalsData, type ListedStock } from "./types.js";

const BRAPI_URL = "https://brapi.dev/api";
export const BRAPI_SOURCE = "brapi";

export function createBrapiClient(token: string) {
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const get = (path: string, params: Record<string, string>) =>
    httpGet(`${BRAPI_URL}${path}?${new URLSearchParams(params)}`, headers);

  return {
    async listStocks(limit: number): Promise<ListedStock[]> {
      const r = await ok(
        await get("/quote/list", {
          type: "stock",
          sortBy: "volume",
          sortOrder: "desc",
          limit: String(limit),
        }),
      );
      const body = (await r.json()) as { stocks?: Record<string, unknown>[] };

      return (body.stocks ?? []).map((s) => ({
        ticker: String(s.stock),
        name: String(s.name || s.stock),
        kind: String(s.type || "stock"),
        sector: String(s.sector || ""),
        subsector: String(s.subsector || ""),
        logoUrl: String(s.logo || ""),
        price: dec(s.close),
        changePct: dec(s.change),
        volume: dec(s.volume),
        marketCap: dec(s.market_cap),
      }));
    },

    /** null quando o ticker não existe ou o módulo não está no plano (403/404). */
    async fundamentals(ticker: string): Promise<FundamentalsData | null> {
      const r = await get(`/quote/${ticker}`, { modules: "financialData" });
      if ([400, 401, 403, 404].includes(r.status)) return null;
      await ok(r);

      const q = ((await r.json()) as { results?: Record<string, any>[] }).results?.[0];
      if (!q) return null;
      const fd = q.financialData ?? {};

      return {
        revenue: dec(fd.totalRevenue),
        ebitda: dec(fd.ebitda),
        totalDebt: dec(fd.totalDebt),
        totalCash: dec(fd.totalCash),
        eps: dec(q.earningsPerShare),
        roe: dec(fd.returnOnEquity),
      };
    },

    /** Candles diários. Tenta o maior intervalo e recua se o plano não permitir; null se nenhum serve. */
    async history(ticker: string, ranges = ["3mo", "1mo"]): Promise<Bar[] | null> {
      for (const range of ranges) {
        const r = await get(`/quote/${ticker}`, { range, interval: "1d" });
        if ([400, 401, 403].includes(r.status)) continue;
        if (r.status === 404) return null;
        await ok(r);

        const q = ((await r.json()) as { results?: Record<string, any>[] }).results?.[0];
        const rows: Record<string, unknown>[] = q?.historicalDataPrice ?? [];

        return rows
          .filter((b) => b.date && b.close !== null && b.close !== undefined)
          .map((b) => ({
            date: new Date(Number(b.date) * 1000).toISOString().slice(0, 10),
            open: dec(b.open),
            high: dec(b.high),
            low: dec(b.low),
            close: dec(b.close),
            volume: dec(b.volume),
          }));
      }
      return null;
    },
  };
}
