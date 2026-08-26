import type { WorkerDeps } from "../../../infrastructure/queue/runtime.js";
import { buildRecurringWorker } from "./recurring/index.js";

export async function buildFinanceWorkers(deps: WorkerDeps) {
  return {
    recurring: await buildRecurringWorker(deps),
  };
}
