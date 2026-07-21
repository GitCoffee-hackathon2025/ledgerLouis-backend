import type { EmailDefaults, EmailTransporter } from "./types/contracts.js";
import { providers, type EmailProvider } from "./providers/index.js";

type ProviderConfig<T extends EmailProvider> = Parameters<
  (typeof providers)[T]
>[0];

export function createTransporter<T extends EmailProvider>(
  provider: T,
  config: ProviderConfig<T>,
  defaults: EmailDefaults,
): EmailTransporter {
  return providers[provider](config, defaults);
}
