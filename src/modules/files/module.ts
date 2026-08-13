import type { StorageProvider } from "../../infrastructure/storage/index.js";
import type { DB } from "../../types/db.js";
import { createFileRepository } from "./repository.js";
import { createFileService } from "./service.js";

export function buildFileModule(db: DB, storage: StorageProvider) {
  const repo = createFileRepository(db);
  return createFileService(storage, repo);
}

export interface CreateFileInput {
  originalName: string;
  mimeType: string;
  size: number;

  file: NodeJS.ReadableStream;
}
