import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import type {
  StorageProvider,
  SaveFileParams,
  SavedFile,
} from "./storageProvider.js";

export class LocalStorageProvider implements StorageProvider {
  readonly provider = "local";

  async save({ filename, folder, file }: SaveFileParams): Promise<SavedFile> {
    const uploadFolder = path.join("uploads", folder);

    if (!fs.existsSync(uploadFolder)) {
      fs.mkdirSync(uploadFolder, {
        recursive: true,
      });
    }

    const filepath = path.join(uploadFolder, filename);

    await pipeline(file, fs.createWriteStream(filepath));

    return {
      storageName: filename,
      location: filepath,
    };
  }

  async delete(storageName: string): Promise<void> {
    if (fs.existsSync(storageName)) {
      await fs.promises.unlink(storageName);
    }
  }
}
