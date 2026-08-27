import type { IRedisClient } from "bullmq";
import type { RedisClientType } from "redis";

export interface Redis {
  raw: RedisClientType; // Cliente redis simples, usado em outros serviços
  adapter: IRedisClient; // Cliente redis bullmq, usado nos producers queue
}
