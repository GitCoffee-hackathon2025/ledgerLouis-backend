import { providers, type StorageDriver } from "./providers/index.js";
import type { StorageProvider } from "./types/contracts.js";

type ProviderConfig<T extends StorageDriver> = Parameters<
  (typeof providers)[T]
>[0];

export function createStorage<T extends StorageDriver>(
  provider: T,
  config: ProviderConfig<T>,
): StorageProvider {
  const factory = providers[provider] as (
    config: ProviderConfig<T>,
  ) => StorageProvider;

  return factory(config);
}
