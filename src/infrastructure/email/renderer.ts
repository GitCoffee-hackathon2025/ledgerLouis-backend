import Handlebars, { type TemplateDelegate } from "handlebars";
import { createTemplateLoader } from "./template.loader.js";

export interface RenderOptions {
  module: string;
  template: string;
  layout?: string;
  data: {
    title: string;
    body: Record<string, any>;
  };
}

const loader = createTemplateLoader();

export function createRenderer() {
  // Armazena os htmls já convertidos em funções JS
  const layoutCache = new Map<string, TemplateDelegate>();
  const templateCache = new Map<string, TemplateDelegate>();

  return {
    async render({
      module, // Nome do modulo que possui o template
      template,
      layout = "base",
      data,
    }: RenderOptions): Promise<{ html: string }> {
      const templateKey = `${module}/${template}`; // Monta a chave para o Map

      // Verifica se os html's já foram compilados
      let layoutCompiled = layoutCache.get(layout);
      let templateCompiled = templateCache.get(templateKey);

      // Caso não exista, é compilado e armazenado no cache
      if (!layoutCompiled) {
        layoutCompiled = Handlebars.compile(await loader.loadLayout(layout));
        layoutCache.set(layout, layoutCompiled);
      }
      if (!templateCompiled) {
        templateCompiled = Handlebars.compile(
          await loader.loadTemplate(module, template),
        );
        templateCache.set(templateKey, templateCompiled);
      }

      // Finalizando a compilação passando os dados
      return {
        html: layoutCompiled({
          title: data.title,
          body: templateCompiled(data.body),
        }),
      };
    },
  };
}
