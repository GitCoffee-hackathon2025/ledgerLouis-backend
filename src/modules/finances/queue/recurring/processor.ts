import type { Job } from "bullmq";
import type { DB } from "../../../../types/db.js";
import { buildTransactionModule } from "../../module.js";

export function createRecurringProcessor({ db }: { db: DB }) {
  const { recurringTransactionService } = buildTransactionModule(db);

  return async (_job: Job) => {
    const results = await recurringTransactionService.materializeDue();
    const created = results.reduce((sum, r) => sum + r.created, 0);

    return { processed: results.length, created };
  };
}
