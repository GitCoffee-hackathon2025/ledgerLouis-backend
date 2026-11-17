// Ponto de partida dos nichos, feeds e ações dos EUA. Tickers mudam (fusões, trocas de código):
// só os tickers já presentes na base são ligados; os demais são ignorados sem erro.
// Códigos macro: 432 Selic, 13522 IPCA 12m, 1 Dólar PTAX.

export interface NicheSpec {
  name: string;
  description: string;
  macro: string[];
  tickers: string[];
  external?: boolean;
}

// Aliases ajudam a casar notícia: ticker dos EUA raramente aparece literal no título
// (diferente de "PETR4" na B3).
export const US_STOCKS = [
  { ticker: "AAPL", name: "Apple", aliases: ["Apple"] },
  { ticker: "MSFT", name: "Microsoft", aliases: ["Microsoft"] },
  { ticker: "GOOGL", name: "Alphabet", aliases: ["Google", "Alphabet"] },
  { ticker: "AMZN", name: "Amazon", aliases: ["Amazon"] },
  { ticker: "NVDA", name: "Nvidia", aliases: ["Nvidia"] },
  { ticker: "META", name: "Meta", aliases: ["Meta", "Facebook"] },
  { ticker: "TSLA", name: "Tesla", aliases: ["Tesla"] },
  { ticker: "AMD", name: "AMD", aliases: ["AMD"] },
  { ticker: "AVGO", name: "Broadcom", aliases: ["Broadcom"] },
  { ticker: "ORCL", name: "Oracle", aliases: ["Oracle"] },
  { ticker: "CRM", name: "Salesforce", aliases: ["Salesforce"] },
  { ticker: "ADBE", name: "Adobe", aliases: ["Adobe"] },
  { ticker: "PLTR", name: "Palantir", aliases: ["Palantir"] },
  { ticker: "SNOW", name: "Snowflake", aliases: ["Snowflake"] },
  { ticker: "IBM", name: "IBM", aliases: ["IBM"] },
  { ticker: "INTC", name: "Intel", aliases: ["Intel"] },
  { ticker: "NOW", name: "ServiceNow", aliases: ["ServiceNow"] },
  { ticker: "SMCI", name: "Super Micro Computer", aliases: ["Super Micro", "Supermicro"] },
  { ticker: "MU", name: "Micron", aliases: ["Micron"] },
  { ticker: "TSM", name: "TSMC", aliases: ["TSMC", "Taiwan Semiconductor"] },
];

export const DEFAULT_NICHES: NicheSpec[] = [
  {
    name: "Varejo",
    description: "Varejo de moda, supermercados, e-commerce e lojas especializadas.",
    macro: ["432", "13522"],
    tickers: ["MGLU3", "LREN3", "ASAI3", "CRFB3", "PETZ3", "SBFG3", "AZZA3", "GMAT3"],
  },
  {
    name: "IA e tecnologia",
    description: "Software, dados e plataformas digitais na B3, e BDRs de tecnologia quando estiverem na base.",
    macro: ["432", "1"],
    tickers: ["TOTS3", "LWSA3", "POSI3", "INTB3", "BMOB3", "NVDC34", "MSFT34", "GOGL34"],
  },
  {
    name: "Imóveis",
    description: "Construtoras, shoppings e fundos imobiliários.",
    macro: ["432", "13522"],
    tickers: ["CYRE3", "MRVE3", "EZTC3", "DIRR3", "CURY3", "MULT3", "ALOS3", "IGTI11", "HGLG11", "KNRI11", "XPML11"],
  },
  {
    name: "Bancos e financeiro",
    description: "Bancos, seguradoras, holdings financeiras e a bolsa.",
    macro: ["432"],
    tickers: ["ITUB4", "BBDC4", "BBAS3", "SANB11", "BPAC11", "B3SA3", "BBSE3", "ITSA4"],
  },
  {
    name: "Energia e saneamento",
    description: "Geração, transmissão e distribuição de energia, e saneamento.",
    macro: ["432", "13522"],
    tickers: ["AXIA3", "EGIE3", "TAEE11", "CMIG4", "SBSP3", "EQTL3", "ENGI11", "CPFE3"],
  },
  {
    name: "Commodities",
    description: "Petróleo, minério, siderurgia e celulose.",
    macro: ["1"],
    tickers: ["PETR4", "PETR3", "VALE3", "PRIO3", "GGBR4", "CSNA3", "SUZB3", "KLBN11", "CMIN3", "USIM5"],
  },
  {
    name: "Agronegócio",
    description: "Produtores, terras agrícolas, açúcar e etanol, insumos.",
    macro: ["1"],
    tickers: ["SLCE3", "AGRO3", "SMTO3", "TTEN3", "SOJA3"],
  },
  {
    name: "Saúde",
    description: "Hospitais, planos, laboratórios e farmácias.",
    macro: ["13522", "432"],
    tickers: ["RDOR3", "HAPV3", "FLRY3", "RADL3", "HYPE3", "ODPV3"],
  },
  {
    name: "Global Tech & IA (EUA)",
    description: "Grandes empresas de tecnologia e IA dos EUA, direto da bolsa americana (fora da B3).",
    macro: [],
    tickers: US_STOCKS.map((s) => s.ticker),
    external: true, // fora da listagem de "Setores e nichos"; a tela própria busca pelo slug
  },
];

// Feeds iniciais de geopolítica e "bolha da IA".
export const DEFAULT_NEWS_FEEDS = [
  { name: "BBC World News", url: "http://feeds.bbci.co.uk/news/world/rss.xml", category: "geopolitica" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "geopolitica" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "ia_bolha" },
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "ia_bolha" },
];
