import type { WorkerDeps } from "../../../infrastructure/queue/runtime.js";
import { buildInviteWorker } from "./invite/index.js";

export function buildCompanyWorkers({ adapter }: WorkerDeps) {
  return {
    invite: buildInviteWorker(adapter),
  };
}
