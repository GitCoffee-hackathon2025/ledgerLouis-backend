import { fileWorkers } from "../modules/files/queue/workers.js";

import { fileSchedulers } from "../modules/files/queue/schedulers.js";

// Workers
export const builds = {
  files: fileWorkers,
};

// Queues periodicas, funcionam de forma automatica quando o servidor está ativo
export const schedulers = {
  files: fileSchedulers,
};
