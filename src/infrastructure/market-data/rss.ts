import { httpGet, isHttpUrl, ok, type FeedItem } from "./types.js";

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function text(raw: string | undefined) {
  return (raw ?? "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, e: string) =>
      e[0] === "#"
        ? String.fromCodePoint(e[1]?.toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)))
        : (ENTITIES[e.toLowerCase()] ?? whole),
    )
    .trim();
}

const tag = (block: string, name: string) =>
  block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"))?.[1];

/**
 * Itens de um feed RSS ou Atom. Guarda só título, link e data, nunca o texto.
 * shortcut: leitura por regex cobre os feeds cadastrados; trocar por um parser de XML se um feed fugir do padrão.
 */
export function parseFeed(xml: string, now: Date): FeedItem[] {
  const items: FeedItem[] = [];

  for (const [, block = ""] of xml.matchAll(/<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi)) {
    const title = text(tag(block, "title"));
    const atom =
      block.match(/<link\b(?![^>]*\brel=["'](?!alternate))[^>]*\bhref=["']([^"']+)["']/i)?.[1];
    const url = text(tag(block, "link")) || text(atom);
    if (!title || !isHttpUrl(url)) continue;

    const when = new Date(
      text(tag(block, "pubDate") ?? tag(block, "published") ?? tag(block, "updated") ?? tag(block, "dc:date")),
    );

    items.push({
      title: title.slice(0, 500),
      url,
      publishedAt: Number.isNaN(when.getTime()) ? now : when,
    });
  }
  return items;
}

export async function fetchFeed(url: string, now: Date): Promise<FeedItem[]> {
  return parseFeed(await (await ok(await httpGet(url))).text(), now);
}
