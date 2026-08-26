import type { Job } from "bullmq";
import type { createRecurringTransactionService } from "../../services/recurringTransaction.service.js";

export function createRecurringProcessor(
  recurringTransactionService: ReturnType<typeof createRecurringTransactionService>,
) {
  return async (_job: Job) => {
    const results = await recurringTransactionService.materializeDue();
    const created = results.reduce((sum, r) => sum + r.created, 0);

    return { processed: results.length, created };
  };
}
