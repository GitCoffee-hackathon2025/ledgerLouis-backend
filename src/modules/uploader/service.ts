import type { MultipartFile } from "@fastify/multipart";
import { generateId } from "../../lib/id.js";
import type { StorageProvider } from "./storageProvider.js";
import type { createFileRepository } from "./repository.js";

export const createUploadService = (
  storage: StorageProvider,
  fileRepository: ReturnType<typeof createFileRepository>,
) => ({
  async uploadImage(file: MultipartFile) {
    if (!file.mimetype.startsWith("image/"))
      throw new Error("Invalid file type"); /// ALERTA

    const safeFilename = file.filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${generateId()}-${safeFilename}`;

    const saved = await storage.save({
      filename,
      folder: "images",
      file: file.file,
    });

    return fileRepository.create({
      id: generateId(),
      originalName: file.filename,
      storageName: saved.storageName,
      mimeType: file.mimetype,
      provider: "local",
      path: saved.path,
      size: file.file.bytesRead,
    });
  },
});
