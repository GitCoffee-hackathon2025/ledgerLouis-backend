// Os cálculos e leitores abaixo foram traduzidos do backend Python original do site de ações.
// fixtures/python-reference.json guarda as entradas e as respostas que aquele código dava:
// se um destes testes falhar, a tradução deixou de se comportar como o original.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { computeIndicators } from "../../src/domain/investments/fundamentals.js";
import { compareToMedian, slugify, summarize } from "../../src/domain/investments/groups.js";
import {
  exposureBySector,
  triggers,
  validateProposal,
  valuate,
} from "../../src/domain/investments/portfolio.js";
import { annualizedVolatility, periodReturn, rsi, sma } from "../../src/domain/investments/technical.js";
import { readCsvFromZip, onlyDigits } from "../../src/infrastructure/market-data/cvm.js";
import { parseFeed } from "../../src/infrastructure/market-data/rss.js";
import { parseLine } from "../../src/modules/investments/services/chat.service.js";

const ref = JSON.parse(
  readFileSync(new URL("./fixtures/python-reference.json", import.meta.url), "utf8"),
);

/** Igualdade profunda, com folga de arredondamento nos números (o original usava Decimal). */
function same(actual: unknown, expected: unknown, path = "") {
  if (typeof expected === "number" && typeof actual === "number") {
    const tolerance = 1e-9 * Math.max(1, Math.abs(expected));
    assert.ok(Math.abs(actual - expected) <= tolerance, `${path}: ${actual} != ${expected}`);
  } else if (expected && typeof expected === "object") {
    assert.ok(actual && typeof actual === "object", `${path}: esperado objeto, veio ${actual}`);
    for (const [k, v] of Object.entries(expected))
      same((actual as Record<string, unknown>)[k], v, `${path}.${k}`);
  } else assert.equal(actual ?? null, expected, path);
}

const indicators = (s: Record<string, number | null>) =>
  computeIndicators({
    price: s.price,
    marketCap: s.market_cap,
    eps: s.eps,
    revenue: s.revenue,
    ebitda: s.ebitda,
    totalDebt: s.total_debt,
    totalCash: s.total_cash,
    roeReported: s.roe_reported,
  });

test("indicadores técnicos (média móvel, RSI, volatilidade, retorno)", () => {
  for (const [i, t] of ref.technical.entries()) {
    const c: number[] = t.closes;
    same(
      {
        sma20: sma(c, 20),
        sma3: sma(c, 3),
        rsi: rsi(c, 14),
        vol: annualizedVolatility(c),
        r21: periodReturn(c, 21),
        rp: c.length > 1 ? periodReturn(c, c.length - 1) : null,
      },
      { sma20: t.sma20, sma3: t.sma3, rsi: t.rsi, vol: t.vol, r21: t.r21, rp: t.rp },
      `technical[${i}]`,
    );
  }
});

test("indicadores fundamentalistas", () => {
  for (const [i, f] of ref.fundamentals.entries()) same(indicators(f.snap), f.ind, `fundamentals[${i}]`);
});

test("resumo de grupo e semáforo contra a mediana", () => {
  for (const [i, g] of ref.groups.entries()) {
    const members = g.members.map((m: any) => ({
      marketCap: m.market_cap,
      changePct: m.change_pct,
      indicators: m.indicators,
    }));
    const summary = summarize(members);

    same(summary, g.summary, `groups[${i}]`);
    same(
      members.map((m: any) => compareToMedian(m.indicators, summary.medians)),
      g.health,
      `groups[${i}].health`,
    );
  }
});

test("slug de setores e nichos", () => {
  for (const [name, slug] of ref.slugs) assert.equal(slugify(name), slug);
});

test("carteira: valor, pesos, exposição e gatilhos de alerta", () => {
  const p = ref.portfolio;
  const valued = valuate(p.positions);
  const exposure = exposureBySector(valued.positions);

  same(valued, p.valued, "valued");
  same(exposure, p.exposure, "exposure");
  same(
    triggers(
      valued.positions,
      exposure,
      { dailyDropPct: 5, maxAssetWeight: 0.2, maxSectorWeight: 0.35 },
      [{ ticker: "T1", title: "Fato relevante: x", url: "https://x/y" }],
    ),
    p.triggers,
    "triggers",
  );
});

test("validação de proposta devolve os mesmos problemas", () => {
  const known = new Set(["AAA1", "BBB2", "CCC3"]);
  for (const p of ref.proposals) assert.deepEqual(validateProposal(p.items, known), p.problems);
});

test("soma de pesos que dá 1 com ruído de ponto flutuante não é rejeitada", () => {
  const item = (ticker: string, target_weight: number) => ({
    ticker,
    target_weight,
    action: "manter",
    thesis: "t",
    risks: "r",
    invalidation: "i",
    sources: ["s"],
  });
  // 0.33 + 0.56 + 0.11 = 1.0000000000000002 em float
  assert.equal(0.33 + 0.56 + 0.11 > 1, true);
  assert.deepEqual(
    validateProposal([item("AAA1", 0.33), item("BBB2", 0.56), item("CCC3", 0.11)], new Set(["AAA1", "BBB2", "CCC3"])),
    [],
  );
});

test("chat: linhas do Claude Code viram os mesmos eventos", () => {
  for (const [line, events] of ref.chat) assert.deepEqual(parseLine(line), events);
});

test("CVM: ZIP com CSV em latin-1, aspas e ';' dentro do campo", () => {
  const ipe = readCsvFromZip(Buffer.from(ref.cvm.ipe_zip, "base64"), "ipe_cia_aberta", ["Assunto"]);
  const kinds: Record<string, string> = {
    "Fato Relevante": "fato_relevante",
    "Comunicado ao Mercado": "comunicado",
  };
  const filings = ipe
    .filter((r) => kinds[r.Categoria!] && r.Link_Download)
    .map((r) => ({
      cnpj: onlyDigits(r.CNPJ_Companhia!),
      company: r.Nome_Companhia,
      kind: kinds[r.Categoria!],
      title: `${r.Categoria![0]}${r.Categoria!.slice(1).toLowerCase()}: ${r.Assunto}`,
      delivered: r.Data_Entrega!.slice(0, 10),
      url: r.Link_Download,
    }));
  assert.deepEqual(filings, ref.cvm.filings);

  const fca = readCsvFromZip(Buffer.from(ref.cvm.fca_zip, "base64"), "valor_mobiliario", ["Codigo_Negociacao"]);
  assert.equal(fca.length, 3);
  assert.throws(() => readCsvFromZip(Buffer.from(ref.cvm.fca_zip, "base64"), "valor_mobiliario", ["Nao_Existe"]));
  assert.throws(() => readCsvFromZip(Buffer.from(ref.cvm.fca_zip, "base64"), "outro_arquivo", []));
});

test("RSS e Atom: título, link e data iguais aos do leitor original", () => {
  const now = new Date("2026-11-01T00:00:00Z");
  for (const feed of ref.rss)
    assert.deepEqual(
      parseFeed(feed.xml, now).map((i) => ({
        title: i.title,
        url: i.url,
        published_at: i.publishedAt.toISOString(),
      })),
      feed.items.map((i: any) => ({ ...i, published_at: new Date(i.published_at).toISOString() })),
    );
});

test("RSS: link que não é http(s) fica de fora", () => {
  const xml = `<rss><channel><item><title>x</title><link>javascript:alert(1)</link></item></channel></rss>`;
  assert.deepEqual(parseFeed(xml, new Date()), []);
});
