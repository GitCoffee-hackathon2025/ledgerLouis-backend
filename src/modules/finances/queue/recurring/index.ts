import { buildTransactionModule } from "../../module.js";
import type { WorkerDeps } from "../../../../infrastructure/queue/runtime.js";

import { createRecurringQueue, RECURRING_QUEUE_NAME } from "./queue.js";
import { createRecurringProducer } from "./producer.js";
import { createRecurringWorker } from "./worker.js";
import { createRecurringProcessor } from "./processor.js";

export async function buildRecurringWorker({ adapter, db }: WorkerDeps) {
  const { recurringTransactionService } = buildTransactionModule(db);

  const queue = createRecurringQueue(RECURRING_QUEUE_NAME, adapter);
  await createRecurringProducer(queue).scheduleDaily();

  return createRecurringWorker(
    RECURRING_QUEUE_NAME,
    adapter,
    createRecurringProcessor(recurringTransactionService),
  );
}
