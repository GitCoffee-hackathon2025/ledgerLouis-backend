import type { IRedisClient } from "bullmq";
import { buildInviteProducer } from "./invite/index.js";

export function buildCompanyProducers(connection: IRedisClient) {
  return {
    invite: buildInviteProducer(connection),
  };
}
