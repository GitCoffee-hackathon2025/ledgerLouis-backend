import YahooFinance from "yahoo-finance2";
import { dec, type Bar, type FundamentalsData, type ListedStock } from "./types.js";

export const YAHOO_SOURCE = "yfinance";
const THREE_MONTHS_MS = 92 * 24 * 60 * 60 * 1000;

/** Yahoo Finance é não-oficial e sem SLA: qualquer campo ausente vira null, sem erro. */
export function createYahooClient() {
  const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

  return {
    async snapshot(
      ticker: string,
      name: string,
    ): Promise<[ListedStock, FundamentalsData | null]> {
      const info = await yf.quoteSummary(ticker, {
        modules: ["price", "financialData", "defaultKeyStatistics"],
      });
      const { price, financialData: fd } = info;
      const change = dec(price?.regularMarketChangePercent);

      const stock: ListedStock = {
        ticker,
        name: price?.longName || price?.shortName || name,
        kind: "stock",
        sector: "",
        subsector: "",
        logoUrl: "",
        price: dec(fd?.currentPrice ?? price?.regularMarketPrice),
        // o Yahoo entrega fração (0.015); o resto do sistema usa pontos percentuais (1.5)
        changePct: change === null ? null : change * 100,
        volume: dec(price?.regularMarketVolume),
        marketCap: dec(price?.marketCap),
      };
      if (!fd) return [stock, null];

      return [
        stock,
        {
          revenue: dec(fd.totalRevenue),
          ebitda: dec(fd.ebitda),
          totalDebt: dec(fd.totalDebt),
          totalCash: dec(fd.totalCash),
          eps: dec(info.defaultKeyStatistics?.trailingEps),
          roe: dec(fd.returnOnEquity),
        },
      ];
    },

    async history(ticker: string): Promise<Bar[] | null> {
      const { quotes } = await yf.chart(ticker, {
        period1: new Date(Date.now() - THREE_MONTHS_MS),
        interval: "1d",
      });
      // o pregão em andamento vem sem fechamento
      const rows = quotes.filter((q) => q.close !== null && q.close !== undefined);
      if (!rows.length) return null;

      return rows.map((q) => ({
        date: q.date.toISOString().slice(0, 10),
        open: dec(q.open),
        high: dec(q.high),
        low: dec(q.low),
        close: dec(q.close),
        volume: dec(q.volume),
      }));
    },
  };
}
