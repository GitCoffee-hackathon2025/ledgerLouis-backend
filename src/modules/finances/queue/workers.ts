import { buildRecurringWorker } from "./recurring/index.js";

export const financeWorkers = {
  recurring: buildRecurringWorker,
};
