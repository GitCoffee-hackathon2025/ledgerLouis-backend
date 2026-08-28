import { buildFileCleanupWorker } from "./cleanup/index.js";

export const fileWorkers = {
  cleanup: buildFileCleanupWorker,
};
