import { fileWorkers } from "../modules/files/queue/workers.js";

import { fileSchedulers } from "../modules/files/queue/schedulers.js";
import { companyWorkers } from "../modules/companies/queues/workers.js";

// Workers
export const builds = {
  files: fileWorkers,
  companies: companyWorkers,
};

// Queues periodicas, funcionam de forma automatica quando o servidor está ativo
export const schedulers = {
  files: fileSchedulers,
};
