import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import type {
  SaveFileParams,
  SavedFile,
  StorageResource,
  StorageProvider,
} from "../types/contracts.js";

interface LocalStorageConfig {
  root: string;
}

export function createLocalStorage(
  config: LocalStorageConfig,
): StorageProvider {
  return {
    provider: "local",

    async save({ filename, folder, file }: SaveFileParams): Promise<SavedFile> {
      const uploadFolder = path.join(config.root, folder);

      await fs.promises.mkdir(uploadFolder, { recursive: true });

      const filepath = path.join(uploadFolder, filename);

      await pipeline(file, fs.createWriteStream(filepath));

      return {
        storageName: filename,
        location: filepath,
      };
    },

    async open(storageName: string): Promise<StorageResource> {
      return {
        type: "stream",
        stream: fs.createReadStream(path.join(config.root, storageName)),
      };
    },

    async delete(storageName: string) {
      await fs.promises.rm(storageName, {
        force: true,
      });
    },
  };
}
