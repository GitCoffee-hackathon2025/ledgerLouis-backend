import { type InferInsertModel, isNull } from "drizzle-orm";

import type { DB } from "../../../types/db.js";
import { jwtKeys } from "../../../database/schemas/index.js";

type JwtKeysInsert = InferInsertModel<typeof jwtKeys>;

export const createKeyRepository = (db: DB) => ({
  /**
   * salva novo par de chaves
   */
  async saveKeyPair(data: JwtKeysInsert) {
    return db.insert(jwtKeys).values(data);
  },
  /**
   * procura pelas chaves de acordo com o kid
   */
  async findKeyPairByKid(kid: NonNullable<JwtKeysInsert["kid"]>) {
    return db.query.jwtKeys.findFirst({
      where: (table, { eq }) => eq(table.kid, kid),
    });
  },
  /**
   * procurar por todas as chaves válidas
   */
  async findValidKeys() {
    return db.query.jwtKeys.findMany({
      where: (table, { gt }) => gt(table.expiresAt, new Date()),
    });
  },
  /**
   * procura pela chave válida mais recente
   */
  async findLatestValidKey() {
    return db.query.jwtKeys.findFirst({
      where: (table, { gt, isNull, and }) =>
        and(gt(table.expiresAt, new Date()), isNull(table.revokedAt)),
      orderBy: (table, { desc }) => [desc(table.expiresAt)],
    });
  },
  /**
   * excluí todas as chaves expiradas
   */
  async revokeAllKeys() {
    return db
      .update(jwtKeys)
      .set({ revokedAt: new Date() })
      .where(isNull(jwtKeys.revokedAt));
  },
});
