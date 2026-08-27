import { buildFileCleanupScheduler } from "./cleanup/index.js";

export const fileSchedulers = {
  cleanup: buildFileCleanupScheduler,
};
