import { createClient } from "redis";
import { createNodeRedisClient } from "bullmq";

// Função que faz a configuração padrão de todos os usuários redis
function createRedisClient(
  name: string,
  socket: {
    connectTimeout: number;
    reconnectStrategy: (retries: number) => number | false;
  },
) {
  const raw = createClient({
    url: process.env.REDIS_URL!,
    name,
    pingInterval: 30_000,
    socket,
  });

  raw.on("error", (err) => {
    console.error(`[Redis:${name}]`, err);
  });

  raw.on("ready", () => {
    console.log(`[Redis:${name}] Connected`);
  });

  raw.on("connect", () => {
    console.log(`[Redis:${name}] Connecting`);
  });

  raw.on("reconnecting", () => {
    console.log(`[Redis:${name}] Reconnecting`);
  });

  raw.on("end", () => {
    console.log(`[Redis:${name}] Connection closed`);
  });

  return raw;
}

export async function createProducerConnection() {
  const client = createRedisClient("ledger-api", {
    connectTimeout: 3_000,
    reconnectStrategy: (retries: number) =>
      retries >= 5 ? false : Math.min(retries * 250, 1_000),
  });

  await client.connect();

  return {
    raw: client,
    connection: createNodeRedisClient(client),
  };
}

export async function createWorkerConnection() {
  const client = createRedisClient("ledger-worker", {
    connectTimeout: 10_000,
    reconnectStrategy: (retries: number) => Math.min(retries * 500, 10_000),
  });

  await client.connect();

  return {
    raw: client,
    connection: createNodeRedisClient(client),
  };
}
