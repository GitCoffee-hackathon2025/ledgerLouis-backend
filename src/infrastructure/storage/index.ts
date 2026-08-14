import { createStorage } from "./factory.js";
import {
  providers as buildProviders,
  type StorageDriver,
} from "./providers/index.js";

export const createStorageService = createStorage;

export const providers = Object.keys(buildProviders) as StorageDriver[];

export type {
  StorageProvider,
  SaveFileParams,
  SavedFile,
  StorageResource,
} from "./types/contracts.js";

export type { StorageDriver };
