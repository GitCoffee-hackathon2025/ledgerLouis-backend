import { authPolicy } from "../auth.policy";
import { createKeyService } from "./key.service";

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
