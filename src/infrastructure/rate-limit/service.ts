import type { RedisClientType } from "redis";

export interface RateLimitOptions {
  by: string;
  id: string;

  max: number;
  window: number;

  penalty?: {
    initial: number;
    remember: number;
    max: number;
  };
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter: number;
}

interface Penalty {
  level: number;
  blockedUntil?: number;
}

export function createRateLimitService(redis: RedisClientType) {
  return {
    async consume({
      by,
      id,
      max,
      window,
      penalty,
    }: RateLimitOptions): Promise<RateLimitResult> {
      // Declara os nomes das entidades redis
      const limitKey = `rate-limit:${by}:${id}`;
      const penaltyKey = `penalty:${by}:${id}`;

      const now = Date.now(); // tempo atuais (milissegundos)

      let penaltyState: Penalty | undefined;

      // Se Penalidade está ativado
      if (penalty) {
        // Procura entidade
        penaltyState = await redis
          .get(penaltyKey)
          .then((state) =>
            state ? (JSON.parse(state) as Penalty) : undefined,
          );

        // Verifica se tempo de bloqueio já passou caso exista a entidade
        if (penaltyState?.blockedUntil && penaltyState.blockedUntil > now) {
          return {
            allowed: false,
            limit: max,
            remaining: 0,
            retryAfter: Math.ceil((penaltyState.blockedUntil - now) / 1000), // (segundos)
          };
        }
      }

      // Incrementa o contador de requisições da janela atual.
      const requests = await redis.incr(limitKey);

      // Verifica se foi o primeiro request e cria uma entidade
      if (requests === 1) await redis.expire(limitKey, window);

      // Ultrapassou o limite de requisições
      if (requests <= max)
        return {
          allowed: true,
          limit: max,
          remaining: Math.max(0, max - requests),
          retryAfter: await redis.ttl(limitKey),
        };

      // Penalidade desativada
      if (!penalty)
        return {
          allowed: false,
          limit: max,
          remaining: 0,
          retryAfter: await redis.ttl(limitKey),
        };

      // Calculando level de penalidade:
      /// se existir levelExistente + 1 se não começa com level 1
      const level = (penaltyState?.level ?? 0) + 1;

      // Calcula a duração da penalidade (segundos)
      const duration = Math.min(
        penalty.initial * 2 ** (level - 1),
        penalty.max,
      );

      // Exclui entidade de limite para resetar
      /// Penalidade está cuidando do tempo de bloqueio
      await redis.del(limitKey);

      // Declara entidade de penalidade
      await redis.set(
        penaltyKey,
        JSON.stringify({
          level,
          blockedUntil: now + duration * 1000, // (milissegundos)
        } satisfies Penalty),
        { EX: penalty.remember }, // expiração
      );

      return {
        allowed: false,
        limit: max,
        remaining: 0,
        retryAfter: duration,
      };
    },
  };
}
