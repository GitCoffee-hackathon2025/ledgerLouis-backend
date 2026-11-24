import { buildEmailVerificationWorker } from "./email-verification/index.js";
import { buildKeyRotationWorker } from "./key-rotation/index.js";

export const authWorkers = {
  emailVerification: buildEmailVerificationWorker,
  keyRotation: buildKeyRotationWorker
};
