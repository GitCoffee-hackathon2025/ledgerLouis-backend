import { type IRedisClient } from "bullmq";

type SchedulerBuilder = (connection: IRedisClient) => Promise<void>;

type SchedulerBuilds = Record<string, Record<string, SchedulerBuilder>>;

export async function registerSchedulers(
  connection: IRedisClient,
  schedulers: SchedulerBuilds,
) {
  for (const [moduleName, moduleSchedulers] of Object.entries(schedulers)) {
    for (const [schedulerName, scheduler] of Object.entries(moduleSchedulers)) {
      await scheduler(connection);

      console.log(`[Scheduler:${moduleName}.${schedulerName}] Registered`);
    }
  }
}
