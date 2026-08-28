import { and, count, desc, eq, isNull, type InferInsertModel } from "drizzle-orm";

import { invites } from "../../../database/schemas/index.js";
import { type DB } from "../../../types/db.js";

type InviteInsert = InferInsertModel<typeof invites>;

export const createInviteRepository = (db: DB) => ({
  async create(data: InviteInsert) {
    const [invite] = await db.insert(invites).values(data).returning();

    return invite;
  },

  async findById(id: NonNullable<InviteInsert["id"]>) {
    return db.query.invites.findFirst({
      where: (invites, { eq }) => eq(invites.id, id),
    });
  },

  async findByTokenHash(tokenHash: string) {
    return db.query.invites.findFirst({
      where: (invites, { eq }) => eq(invites.tokenHash, tokenHash),
    });
  },

  async findAllPendingByEmail(email: string) {
    return db.query.invites.findMany({
      where: (invites, { and, eq, isNull, gt }) =>
        and(
          eq(invites.email, email),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
          gt(invites.expiresAt, new Date()),
        ),
      columns: {
        id: true,
        companyId: true,
        email: true,
        role: true,
        expiresAt: true,
      },
      orderBy: (invites, { desc }) => desc(invites.createdAt),
    });
  },

  async findPendingByCompanyAndEmail(
    companyId: InviteInsert["companyId"],
    email: string,
  ) {
    return db.query.invites.findFirst({
      where: (invites, { and, eq, isNull }) =>
        and(
          eq(invites.companyId, companyId),
          eq(invites.email, email),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
        ),
    });
  },

  async findAllByCompanyId(
    companyId: InviteInsert["companyId"],
    limit = 20,
    offset = 0,
  ) {
    return db
      .select({
        id: invites.id,
        email: invites.email,
        role: invites.role,
        invitedBy: invites.invitedBy,
        expiresAt: invites.expiresAt,
        revokedAt: invites.revokedAt,
        acceptedAt: invites.acceptedAt,
        createdAt: invites.createdAt,
      })
      .from(invites)
      .where(eq(invites.companyId, companyId))
      .orderBy(desc(invites.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async countByCompanyId(companyId: InviteInsert["companyId"]) {
    const result = await db
      .select({ count: count() })
      .from(invites)
      .where(eq(invites.companyId, companyId));

    return result[0]?.count ?? 0;
  },

  async markAsAccepted(
    id: NonNullable<InviteInsert["id"]>,
    acceptedAt: Date = new Date(),
  ) {
    const [invite] = await db
      .update(invites)
      .set({ acceptedAt })
      .where(
        and(
          eq(invites.id, id),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
        ),
      )
      .returning();

    return invite;
  },

  async revoke(
    id: NonNullable<InviteInsert["id"]>,
    revokedAt: Date = new Date(),
  ) {
    const [invite] = await db
      .update(invites)
      .set({ revokedAt })
      .where(
        and(
          eq(invites.id, id),
          isNull(invites.acceptedAt),
          isNull(invites.revokedAt),
        ),
      )
      .returning();

    return invite;
  },
});
