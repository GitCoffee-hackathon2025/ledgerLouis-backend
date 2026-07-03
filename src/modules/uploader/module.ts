import type { DB } from "../../types/db.js";
import { LocalStorageProvider } from "./localStorage.js";
import { createUploadService } from "./service.js";
import { createFileRepository } from "./repository.js";
import { storageProvider } from "../../plugins/core/index.js";

export const buildUploaderModule = (db: DB) => {
  const storage = storageProvider;
  const fileRepository = createFileRepository(db);
  const uploadService = createUploadService(storage, fileRepository);

  return uploadService;
};
