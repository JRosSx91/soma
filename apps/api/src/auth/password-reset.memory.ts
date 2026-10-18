import type { PasswordResetToken, RefreshToken, User } from "@prisma/client";
import { createId } from "./create-id.js";

/**
 * Minimal in-memory Prisma stand-in for PasswordResetService tests.
 * Serializes $transaction like MemoryRefreshPrisma.
 */
export class MemoryPasswordResetPrisma {
  users = new Map<string, User>();
  resetTokens = new Map<string, PasswordResetToken>();
  refreshTokens = new Map<string, RefreshToken>();
  private queue: Promise<unknown> = Promise.resolve();

  user = {
    findMany: async ({
      where,
      take,
    }: {
      where: { email: { equals: string; mode: string } };
      take: number;
    }) => {
      const needle = where.email.equals.toLowerCase();
      const matches = [...this.users.values()].filter(
        (u) => u.email.toLowerCase() === needle,
      );
      return matches.slice(0, take);
    },
    update: async ({
      where,
      data,
    }: {
      where: { id: string };
      data: { hashedPassword: string };
    }) => {
      const user = this.users.get(where.id);
      if (!user) throw new Error("missing user");
      user.hashedPassword = data.hashedPassword;
      user.updatedAt = new Date();
      return user;
    },
  };

  passwordResetToken = {
    create: async ({
      data,
    }: {
      data: Pick<
        PasswordResetToken,
        "id" | "userId" | "tokenHash" | "expiresAt"
      > &
        Partial<PasswordResetToken>;
    }) => {
      const row: PasswordResetToken = {
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        createdAt: data.createdAt ?? new Date(),
        expiresAt: data.expiresAt,
        usedAt: data.usedAt ?? null,
      };
      this.resetTokens.set(row.id, row);
      return row;
    },
    findUnique: async ({ where }: { where: { tokenHash: string } }) => {
      for (const row of this.resetTokens.values()) {
        if (row.tokenHash === where.tokenHash) return row;
      }
      return null;
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: {
        id?: string | { not: string };
        userId?: string;
        usedAt?: null;
        expiresAt?: { gt: Date };
      };
      data: { usedAt: Date };
    }) => {
      let count = 0;
      for (const row of this.resetTokens.values()) {
        if (typeof where.id === "string" && row.id !== where.id) continue;
        if (
          where.id &&
          typeof where.id === "object" &&
          "not" in where.id &&
          row.id === where.id.not
        ) {
          continue;
        }
        if (where.userId && row.userId !== where.userId) continue;
        if (where.usedAt === null && row.usedAt != null) continue;
        if (where.expiresAt && !(row.expiresAt > where.expiresAt.gt)) continue;
        row.usedAt = data.usedAt;
        count += 1;
      }
      return { count };
    },
  };

  refreshToken = {
    create: async ({
      data,
    }: {
      data: Pick<
        RefreshToken,
        "id" | "userId" | "tokenHash" | "familyId" | "expiresAt"
      >;
    }) => {
      const row: RefreshToken = {
        id: data.id,
        userId: data.userId,
        tokenHash: data.tokenHash,
        familyId: data.familyId,
        createdAt: new Date(),
        expiresAt: data.expiresAt,
        revokedAt: null,
        replacedById: null,
        userAgent: null,
        ipHash: null,
      };
      this.refreshTokens.set(row.id, row);
      return row;
    },
    updateMany: async ({
      where,
      data,
    }: {
      where: { userId: string; revokedAt: null };
      data: { revokedAt: Date };
    }) => {
      let count = 0;
      for (const row of this.refreshTokens.values()) {
        if (row.userId !== where.userId) continue;
        if (row.revokedAt != null) continue;
        row.revokedAt = data.revokedAt;
        count += 1;
      }
      return { count };
    },
  };

  async $transaction<T>(fn: (tx: this) => Promise<T>): Promise<T> {
    const run = this.queue.then(async () => {
      const snapUsers = new Map(
        [...this.users.entries()].map(([k, v]) => [k, { ...v }]),
      );
      const snapReset = new Map(
        [...this.resetTokens.entries()].map(([k, v]) => [k, { ...v }]),
      );
      const snapRefresh = new Map(
        [...this.refreshTokens.entries()].map(([k, v]) => [k, { ...v }]),
      );
      try {
        return await fn(this);
      } catch (err) {
        this.users = snapUsers;
        this.resetTokens = snapReset;
        this.refreshTokens = snapRefresh;
        throw err;
      }
    });
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  seedUser(partial: Partial<User> & Pick<User, "email" | "hashedPassword">) {
    const user: User = {
      id: partial.id ?? createId(),
      email: partial.email,
      hashedPassword: partial.hashedPassword,
      displayName: partial.displayName ?? "User",
      biologicalSex: partial.biologicalSex ?? "male",
      birthYear: partial.birthYear ?? 1990,
      weightKg: partial.weightKg ?? null,
      createdAt: partial.createdAt ?? new Date(),
      updatedAt: partial.updatedAt ?? new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }
}
