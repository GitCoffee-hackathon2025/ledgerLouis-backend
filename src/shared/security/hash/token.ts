import argon2 from "argon2";

export function hashToken(token: string) {
  return argon2.hash(token, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export function verifyToken(hash: string, token: string) {
  return argon2.verify(hash, token);
}
