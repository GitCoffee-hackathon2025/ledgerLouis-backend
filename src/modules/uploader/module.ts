import type { DB }
  from "../../types/db.js";

import { LocalStorageProvider }
  from "./localStorage.js";

import { createUploadService }
  from "./service.js";

import { createFileRepository }
  from "./repository.js";

export const buildUploaderModule = (
  db: DB
) => {
  const storage =
    new LocalStorageProvider();

  const fileRepository =
    createFileRepository(db);

  const uploadService =
    createUploadService(
      storage,
      fileRepository
    );

  return {
    uploadService,
  };
};