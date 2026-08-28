import { fileWorkers } from "../modules/files/queue/workers.js";

import { fileSchedulers } from "../modules/files/queue/schedulers.js";
import { companyWorkers } from "../modules/companies/queues/workers.js";
import { financeWorkers } from "../modules/finances/queue/workers.js";
import { financeSchedulers } from "../modules/finances/queue/schedulers.js";

// Workers
export const builds = {
  files: fileWorkers,
  companies: companyWorkers,
  finances: financeWorkers,
};

// Queues periodicas, funcionam de forma automatica quando o servidor está ativo
export const schedulers = {
  files: fileSchedulers,
  finances: financeSchedulers,
};
