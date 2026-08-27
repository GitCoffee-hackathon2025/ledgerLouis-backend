// import type { Job } from "bullmq";
import type { DB } from "../../../../types/db.js";
import type { StorageProvider } from "../../../../types/storage.js";
import { createFileRepository } from "../../repository.js";

const FILE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getRetentionDate() {
  return new Date(Date.now() - FILE_RETENTION_MS);
}

export function createFileCleanupProcessor({
  db,
  storages,
}: {
  db: DB;
  storages: Record<string, StorageProvider>;
}) {
  const repo = createFileRepository(db);

  return async (/* job: Job */) => {
    const deletedFiles = await repo.findAllDeletedBefore(getRetentionDate());

    for (const file of deletedFiles) {
      const storage = storages[file.provider];

      if (!storage) {
        console.log(`CLEANUP FILE: provedor '${file.provider}' necessário`);
        continue;
      }

      try {
        await storage.delete(file.storageName);
        await repo.hardDelete(file.id);
      } catch (error) {
        console.log("CLEANUP FILE:", error);
      }
    }
  };
}
