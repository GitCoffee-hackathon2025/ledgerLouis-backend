import { createStorage } from "./factory.js";
export const createStorageService = createStorage;

export type {
  StorageProvider,
  SaveFileParams,
  SavedFile,
  StorageResource,
} from "./types/contracts.js";
