import type { IRedisClient } from "bullmq";
import { buildInviteWorker } from "./invite/index.js";

export function buildCompanyWorkers(connection: IRedisClient) {
  return {
    invite: buildInviteWorker(connection),
  };
}
