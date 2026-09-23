import { authWorkers } from "../modules/auth/queue/workers.js";
import { fileWorkers } from "../modules/files/queue/workers.js";
import { companyWorkers } from "../modules/companies/queues/workers.js";

import { fileSchedulers } from "../modules/files/queue/schedulers.js";

// Workers
export const builds = {
  auth: authWorkers,
  files: fileWorkers,
  companies: companyWorkers,
};

// Queues periodicas, funcionam de forma automatica quando o servidor está ativo
export const schedulers = {
  files: fileSchedulers,
};
