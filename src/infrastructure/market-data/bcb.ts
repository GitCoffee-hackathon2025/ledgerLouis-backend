import { dec, httpGet, ok, type MacroData } from "./types.js";

export const BCB_SOURCE = "bcb-sgs";

// código SGS -> [nome, unidade]
export const BCB_SERIES: Record<string, [name: string, unit: string]> = {
  432: ["Selic meta", "% a.a."],
  13522: ["IPCA 12 meses", "%"],
  1: ["Dólar PTAX (venda)", "R$"],
};

export const createBcbClient = () => ({
  async series(code: string, last: number): Promise<MacroData[]> {
    const r = await ok(
      await httpGet(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${code}/dados/ultimos/${last}?formato=json`,
      ),
    );
    const rows = (await r.json()) as { data: string; valor: string }[];

    return rows.flatMap((p) => {
      const value = dec(p.valor);
      const [day, month, year] = p.data.split("/"); // dd/mm/aaaa
      return value === null ? [] : [{ date: `${year}-${month}-${day}`, value }];
    });
  },
});
