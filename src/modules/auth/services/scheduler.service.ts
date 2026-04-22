import { authPolicy } from "../auth.policy.js";
import { createKeyService } from "./key.service.js";

/**
 * Inicia o rotacionamento de chaves usadas na autenticação
 */
export function startKeyRotation(service: ReturnType<typeof createKeyService>) {
  async function run() {
    await service.rotateKey();
    // await repo.deleteOldKeys(new Date());
    setTimeout(run, authPolicy.rotationInternal);
  }

  return {
    async start() {
      await service.getPrivateKey();
      setTimeout(run, authPolicy.rotationInternal);
    },
  };
}
