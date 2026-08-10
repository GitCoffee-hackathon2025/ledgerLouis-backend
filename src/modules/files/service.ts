import { AppError } from "../../shared/errors/domain/errors.js";
import { generateId, type ULID } from "../../domain/shared/id.js";

import type {
  SaveFileParams,
  StorageProvider,
} from "../../infrastructure/storage/index.js";

import type { createFileRepository } from "./repository.js";

interface FileDescriptor {
  originalName: string;
  mimeType: string;
  size: number;
}

/* 
create()
open()
delete()
restore()
link()
unlink()
*/

const generateStorageName = (originalName: string) =>
  `${generateId()}-${originalName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

export function createFileService(
  storage: StorageProvider,
  repo: ReturnType<typeof createFileRepository>,
) {
  return {
    async create(
      { originalName, mimeType, size }: FileDescriptor,
      storageFile: SaveFileParams,
    ) {
      storageFile.filename = generateStorageName(originalName);

      const saved = await storage.save(storageFile).catch(() => {
        throw new AppError("UPLOAD_FAILED");
      });

      const [file] = await repo.create({
        id: generateId(),
        originalName,
        storageName: saved.storageName,
        mimeType,
        provider: storage.provider,
        path: saved.location,
        size,
      });

      return file;
    },

    async open(id: ULID) {
      const file = await repo.findById(id);
      if (!file) throw new AppError("FILE_NOT_FOUND");

      if (file.provider != storage.provider)
        throw new AppError("INTERNAL_ERROR");

      return storage.open(file.storageName);
    },

    async findDeleted(id: ULID) {
      const file = await repo.findDeletedById(id);
      if (!file) throw new AppError("FILE_NOT_FOUND");

      if (file.provider != storage.provider)
        throw new AppError("INTERNAL_ERROR");

      return file;
    },

    async delete(id: ULID) {
      const [deleted] = await repo.delete(id);
      if (!deleted) throw new AppError("FILE_NOT_FOUND");

      if (deleted.provider != storage.provider)
        throw new AppError("INTERNAL_ERROR");

      // aplicar um service worker na hora de deletar (permite recuperação)
      await storage.delete(deleted.storageName);
    },
  };
}
