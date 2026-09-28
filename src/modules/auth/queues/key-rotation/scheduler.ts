import type { Queue } from "bullmq";
import { authPolicy } from "../../auth.policy.js";

export async function registerKeyRotationScheduler(
  { idName, jobName }: { idName: string; jobName: string },
  queue: Queue,
) {
  await queue.upsertJobScheduler(
    idName,
    { every: authPolicy.rotationInternal },
    { name: jobName },
  );
}
