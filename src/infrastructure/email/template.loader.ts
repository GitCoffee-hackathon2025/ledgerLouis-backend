import { readFile } from "node:fs/promises";
import { fromHere, fromSource } from "../../config/paths.js";

export function createTemplateLoader() {
  return {
    async loadLayout(name: string): Promise<string> {
      return readFile(
        fromHere(import.meta.url, "layouts", `${name}.hbs`),
        "utf8",
      );
    },

    async loadTemplate(module: string, template: string): Promise<string> {
      return readFile(
        fromSource("modules", module, "templates", `${template}.hbs`),
        "utf8",
      );
    },
  };
}
