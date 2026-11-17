// Dados abertos da CVM: fatos relevantes (IPE) e mapa CNPJ -> tickers (FCA valor_mobiliario).

import { inflateRawSync } from "node:zlib";
import { httpGet, isHttpUrl, ok } from "./types.js";

export const CVM_SOURCE = "CVM";
export const CVM_BASE = "https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC";
const KINDS: Record<string, string> = {
  "Fato Relevante": "fato_relevante",
  "Comunicado ao Mercado": "comunicado",
};

export class CvmFormatError extends Error {}

export const ipeUrl = (year: number) => `${CVM_BASE}/IPE/DADOS/ipe_cia_aberta_${year}.zip`;
const fcaUrl = (year: number) => `${CVM_BASE}/FCA/DADOS/fca_cia_aberta_${year}.zip`;
export const onlyDigits = (cnpj: string) => cnpj.replace(/\D/g, "");

export interface Filing {
  cnpj: string;
  kind: string;
  title: string;
  delivered: string; // AAAA-MM-DD
  url: string;
}

/**
 * Arquivos de um ZIP, lidos pelo diretório central.
 * shortcut: sem ZIP64 nem criptografia, que a CVM não usa; trocar por uma biblioteca se isso mudar.
 */
export function unzip(zip: Buffer): Map<string, () => Buffer> {
  const end = zip.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (end < 0) throw new CvmFormatError("ZIP da CVM inválido");

  const files = new Map<string, () => Buffer>();
  let at = zip.readUInt32LE(end + 16);

  for (let i = zip.readUInt16LE(end + 10); i > 0; i--) {
    const method = zip.readUInt16LE(at + 10);
    const size = zip.readUInt32LE(at + 20);
    const nameLen = zip.readUInt16LE(at + 28);
    const local = zip.readUInt32LE(at + 42);
    const name = zip.toString("utf8", at + 46, at + 46 + nameLen);

    files.set(name, () => {
      const start = local + 30 + zip.readUInt16LE(local + 26) + zip.readUInt16LE(local + 28);
      const data = zip.subarray(start, start + size);
      return method === 0 ? data : inflateRawSync(data);
    });

    at += 46 + nameLen + zip.readUInt16LE(at + 30) + zip.readUInt16LE(at + 32);
  }
  return files;
}

/** CSV separado por ";" com aspas duplas opcionais (campo pode conter ";" e quebra de linha). */
export function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i]!;
    if (quoted) {
      if (c !== '"') field += c;
      else if (text[i + 1] === '"') field += text[++i];
      else quoted = false;
    } else if (c === '"') quoted = true;
    else if (c === ";") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) rows.push([...row, field]);

  const header = rows.shift() ?? [];
  return rows
    .filter((r) => r.length > 1 || r[0])
    .map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

export function readCsvFromZip(content: Buffer, nameContains: string, required: string[]) {
  const files = unzip(content);
  const name = [...files.keys()].find((n) => n.includes(nameContains) && n.endsWith(".csv"));
  if (!name) throw new CvmFormatError(`arquivo com '${nameContains}' não encontrado no ZIP da CVM`);

  const raw = files.get(name)!();
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  } catch {
    text = new TextDecoder("latin1").decode(raw); // a CVM costuma publicar em latin-1
  }

  const rows = parseCsv(text.replace(/^﻿/, ""));
  const columns = Object.keys(rows[0] ?? {});
  const missing = required.filter((c) => rows.length && !columns.includes(c));
  if (missing.length)
    throw new CvmFormatError(`coluna ausente no CSV da CVM (${name}): ${missing.join(", ")}`);

  return rows;
}

export function createCvmClient() {
  const download = async (url: string) =>
    Buffer.from(await (await ok(await httpGet(url, {}, 120_000))).arrayBuffer());

  return {
    async filings(year: number): Promise<Filing[]> {
      const rows = readCsvFromZip(await download(ipeUrl(year)), "ipe_cia_aberta", [
        "CNPJ_Companhia",
        "Categoria",
        "Assunto",
        "Data_Entrega",
        "Link_Download",
      ]);

      return rows
        .filter((r) => KINDS[r.Categoria!] && isHttpUrl(r.Link_Download!))
        .map((r) => {
          const category = r.Categoria!;
          return {
            cnpj: onlyDigits(r.CNPJ_Companhia!),
            kind: KINDS[category]!,
            title: `${category[0]}${category.slice(1).toLowerCase()}: ${r.Assunto}`.slice(0, 500),
            delivered: r.Data_Entrega!.slice(0, 10),
            url: r.Link_Download!,
          };
        });
    },

    async tickersByCnpj(year: number): Promise<Map<string, Set<string>>> {
      const rows = readCsvFromZip(await download(fcaUrl(year)), "valor_mobiliario", [
        "CNPJ_Companhia",
        "Codigo_Negociacao",
      ]);

      const out = new Map<string, Set<string>>();
      for (const r of rows) {
        const ticker = (r.Codigo_Negociacao ?? "").trim().toUpperCase();
        if (!ticker) continue;

        const cnpj = onlyDigits(r.CNPJ_Companhia!);
        out.set(cnpj, (out.get(cnpj) ?? new Set()).add(ticker));
      }
      return out;
    },
  };
}
