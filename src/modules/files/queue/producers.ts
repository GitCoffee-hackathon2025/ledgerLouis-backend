import { buildFileCleanupProducer } from "./cleanup/index.js";

export const fileProducers = {
  cleanup: buildFileCleanupProducer,
};
