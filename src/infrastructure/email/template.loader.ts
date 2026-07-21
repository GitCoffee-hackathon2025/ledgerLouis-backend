import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ajuste caso a estrutura do projeto mude
const ROOT = join(__dirname, "../..");

export function createTemplateLoader() {
  return {
    async loadLayout(name: string): Promise<string> {
      return readFile(join(__dirname, "layouts", `${name}.hbs`), "utf8");
    },

    async loadTemplate(module: string, template: string): Promise<string> {
      return readFile(
        join(ROOT, "modules", module, "templates", `${template}.hbs`),
        "utf8",
      );
    },
  };
}
