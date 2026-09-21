import { buildEmailVerificationQueue } from "./email-verification/index.js";

export const authQueues = {
  emailVerification: buildEmailVerificationQueue,
};
