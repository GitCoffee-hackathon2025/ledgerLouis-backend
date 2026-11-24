// import type { Job } from "bullmq";
import type { DB } from "../../../../types/db.js";
import { createKeyRepository } from "../../repositories/key.repository.js";
import { createKeyService } from "../../services/key.service.js";

export function createKeyRotationProcessor({ db }: { db: DB }) {
  const repo = createKeyRepository(db);
  const service = createKeyService(repo);
  return async (/* job: Job */) => {
    try {
      await service.rotateKey();
    } catch (error) {
      console.log("KEY ROTATION:", error);
    }
  };
}
