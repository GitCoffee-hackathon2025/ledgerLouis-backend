import { createTransporter } from "./factory.js";
import { createRenderer } from "./renderer.js";

import type { EmailDefaults, EmailMessage } from "./types/contracts.js";
import type { EmailProvider, providers } from "./providers/index.js";

type ProviderConfig<T extends EmailProvider> = Parameters<
  (typeof providers)[T]
>[0];

export async function createEmailService<T extends EmailProvider>(
  provider: T,
  config: ProviderConfig<T>,
  defaults: EmailDefaults,
) {
  const transporter = createTransporter(provider, config, defaults);
  await transporter.verify();

  const renderer = createRenderer();

  return {
    async send(message: EmailMessage) {
      return transporter.send(message);
    },

    async sendTemplate({
      module,
      template,
      layout,
      data,
      message,
    }: {
      module: string;
      template: string;
      layout?: string;
      data: Record<string, any>;
      message: Omit<EmailMessage, "html">;
    }) {
      const { html } = await renderer.render({
        module,
        template,
        ...(layout && { layout }),
        data,
      });

      return transporter.send({ ...message, html });
    },

    close() {
      return transporter.close();
    },
  };
}
