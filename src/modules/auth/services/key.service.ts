import { type createKeyRepository } from "../repositories/key.repository.js";

import { computeKeyExpiration } from "../auth.policy.js";

import { AppError } from "../../../shared/errors/basicErrors.js";
import { type ULID } from "../../../domain/shared/id.js";

async function generateKeyPair() {
  const keys = await crypto.subtle.generateKey({ name: "Ed25519" }, true, [
    "sign",
    "verify",
  ]);

  return {
    publicKey: JSON.stringify(
      await crypto.subtle.exportKey("jwk", keys.publicKey),
    ),
    privateKey: JSON.stringify(
      await crypto.subtle.exportKey("jwk", keys.privateKey),
    ),
  };
}

export const createKeyService = (
  repo: ReturnType<typeof createKeyRepository>,
) => ({
  /**
   * Cria novas chaves e as registra no banco
   */
  async rotateKey() {
    const keys = {
      ...(await generateKeyPair()),
      expiresAt: computeKeyExpiration(),
    };

    await repo.revokeAllKeys(); 
    await repo.saveKeyPair(keys);
  },
  /**
   * Importa a chave pública que estava em formato string
   */
  async importPublicKey(key: string) {
    return crypto.subtle.importKey(
      "jwk",
      JSON.parse(key),
      { name: "Ed25519" },
      false,
      ["verify"],
    );
  },
  /**
   * Importa a chave privada que estava em formato string
   */
  async importPrivateKey(key: string) {
    return crypto.subtle.importKey(
      "jwk",
      JSON.parse(key),
      { name: "Ed25519" },
      false,
      ["sign"],
    );
  },
  /**
   * Pega a chave publica de acordo com o kid
   */
  async getPublicKeyByKid(kid: ULID) {
    const key = await repo.findKeyPairByKid(kid);

    if (!key) throw new AppError("INTERNAL_ERROR");

    return this.importPublicKey(key.publicKey);
  },
  /**
   * Pega a chave privada mais recente
   */
  async getPrivateKey() {
    let key = await repo.findLatestValidKey();

    if (!key) {
      await this.rotateKey();
      key = await repo.findLatestValidKey();
    }

    if (!key) throw new AppError("INTERNAL_ERROR");

    return {
      kid: key.kid,
      privateKey: await this.importPrivateKey(key.privateKey),
    };
  },
});
