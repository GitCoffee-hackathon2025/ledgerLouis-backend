import type { DB } from "../../types/db.js";
import type { StorageProvider } from "./storageProvider.js";
import { createUploadService } from "./service.js";
import { createFileRepository } from "./repository.js";

export const buildUploaderModule = (db: DB, storage: StorageProvider) => {
  const fileRepository = createFileRepository(db);

  return createUploadService(storage, fileRepository);
};
