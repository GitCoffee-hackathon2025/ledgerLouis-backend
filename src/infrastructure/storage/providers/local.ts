import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";

import type { SaveFileParams, StorageProvider } from "../types/contracts.js";

interface LocalStorageConfig {
  root: string;
}

export function createLocalStorage(
  config: LocalStorageConfig,
): StorageProvider {
  return {
    provider: "local",

    async save({ filename, folder, file }: SaveFileParams) {
      // Identificador interno do arquivo
      const storageName = path.join(folder, filename);

      // Caminho absoluto no disco
      const location = path.join(config.root, storageName);

      await fs.promises.mkdir(path.dirname(location), {
        recursive: true,
      });

      await pipeline(file, fs.createWriteStream(location));

      return {
        storageName,
        location,
      };
    },

    async open(storageName: string) {
      return {
        type: "stream",
        stream: fs.createReadStream(path.join(config.root, storageName)),
      };
    },

    async delete(storageName: string) {
      await fs.promises.rm(path.join(config.root, storageName), {
        force: true,
      });
    },
  };
}
