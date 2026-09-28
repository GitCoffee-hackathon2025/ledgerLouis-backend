import { buildEmailVerificationWorker } from "./email-verification/index.js";

export const authWorkers = {
  emailVerification: buildEmailVerificationWorker,
};
