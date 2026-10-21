import type { RefreshToken } from "@prisma/client";
import { createId } from "./create-id.js";

/**
 * Minimal in-memory Prisma stand-in for RefreshSessionService tests.
 * Supports the exact operations used by rotate/issue/revoke, including
 * concurrent $transaction calls serialized via a promise chain so
 * updateMany remains atomic relative to other transactions.
 */
export class MemoryRefreshPrisma {
  private rows = new Map<string, RefreshToken>();
  private byHash = new Map<string, string>();
  private queue: Promise<unknown> = Promise.resolve();

  refreshToken = {
    create: async ({ data }: { data: Partial<RefreshToken> & Pick<RefreshToken, "id" | "userId" | "tokenHash" | "familyId" | "expiresAt"> }) => {
      const row: RefreshToken = {
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        familyId: data.familyId,
        createdAt: data.createdAt ?? new Date(),
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt ?? null,
        replacedById: data.replacedById ?? null,
        userAgent: data.userAgent ?? null,
        ipHash: data.ipHash ?? null,
      };
      this.rows.set(row.id, row);
      this.byHash.set(row.tokenHash, row.id);
      return row;
    },
    findUnique: async ({
      where,
    }: {
      where: { tokenHash?: string; id?: string };
    }) => {
      if (where.tokenHash) {
        const id = this.byHash.get(where.tokenHash);
        return id ? (this.rows.get(id) ?? null) : null;
      }
      if (where.id) return this.rows.get(where.id) ?? null;
      return null;
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: {
        id?: string;
        familyId?: string;
        revokedAt?: null;
      };
      data: { revokedAt: Date };
    }) => {
      let count = 0;
      for (const row of this.rows.values()) {
        if (where.id && row.id !== where.id) continue;
        if (where.familyId && row.familyId !== where.familyId) continue;
        if (
          where.revokedAt === null &&
          row.revokedAt != null
        ) {
          continue;
        }
        row.revokedAt = data.revokedAt;
        count += 1;
      }
      return { count };
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { replacedById: string };
    }) => {
      const row = this.rows.get(where.id);
      if (!row) throw new Error("missing");
      row.replacedById = data.replacedById;
      return row;
    },
    count: async ({
      where,
    }: {
      where: { userId: string; revokedAt: null; expiresAt: { gt: Date } };
    }) => {
      let n = 0;
      for (const row of this.rows.values()) {
        if (row.userId !== where.userId) continue;
        if (row.revokedAt !== null) continue;
        if (!(row.expiresAt > where.expiresAt.gt)) continue;
        n += 1;
      }
      return n;
    },
  };

  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    const run = this.queue.then(() => fn(this));
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  seed(partial: Partial<RefreshToken> & Pick<RefreshToken, "tokenHash" | "userId" | "familyId">) {
    const row: RefreshToken = {
      id: partial.id ?? createId(),
      userId: partial.userId,
      tokenHash: partial.tokenHash,
      familyId: partial.familyId,
      createdAt: partial.createdAt ?? new Date(),
      expiresAt: partial.expiresAt ?? new Date(Date.now() + 86_400_000),
      revokedAt: partial.revokedAt ?? null,
      replacedById: partial.replacedById ?? null,
      userAgent: partial.userAgent ?? null,
      ipHash: partial.ipHash ?? null,
    };
    this.rows.set(row.id, row);
    this.byHash.set(row.tokenHash, row.id);
    return row;
  }

  all() {
    return [...this.rows.values()];
  }
}
