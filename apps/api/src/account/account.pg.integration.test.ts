/**
 * Live PostgreSQL account deletion. Skips when DATABASE_URL is unset.
 * Uses dedicated throwaway users — never the owner account.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuthService } from "../auth/auth.service.js";
import { RefreshSessionService } from "../auth/refresh-session.service.js";
import { RegistrationInviteService } from "../auth/registration-invite.service.js";
import { JwtStrategy } from "../auth/jwt.strategy.js";
import { ConfigService } from "@nestjs/config";
import { createId } from "../auth/create-id.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
} from "../auth/invite-token.crypto.js";

const PASSWORD = "delete-me-pass-1";

async function withLiveDb(
  run: (ctx: {
    prisma: PrismaClient;
    service: AuthService;
    users: UsersService;
    refresh: RefreshSessionService;
    strategy: JwtStrategy;
  }) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";
  const prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "tokenHash" FROM "RegistrationInvite" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  const users = new UsersService(prisma as unknown as PrismaService);
  const refresh = new RefreshSessionService(prisma as unknown as PrismaService);
  const jwt = {
    sign: (payload: unknown) => `pg-token:${JSON.stringify(payload)}`,
  };
  const service = new AuthService(
    users,
    jwt as unknown as JwtService,
    refresh,
    prisma as unknown as PrismaService,
    new RegistrationInviteService(),
  );
  const strategy = new JwtStrategy(
    {
      get: (key: string) =>
        key === "JWT_SECRET" ? "pg-delete-account-secret" : undefined,
    } as unknown as ConfigService,
    users,
  );

  try {
    await run({ prisma, service, users, refresh, strategy });
    return "ran";
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
}

async function createTestUser(
  prisma: PrismaClient,
  label: string,
): Promise<{ id: string; email: string }> {
  const id = createId();
  const email = `del-acct-${label}-${id}@example.test`;
  await prisma.user.create({
    data: {
      id,
      email,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Delete Test",
      biologicalSex: "male",
      birthYear: 1990,
    },
  });
  return { id, email };
}

async function attachPersonalData(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  const substance = await prisma.substance.findFirst();
  if (substance) {
    await prisma.substanceUsage.create({
      data: {
        userId,
        substanceId: substance.id,
        yearStarted: 2020,
        frequency: "daily",
      },
    });
  }
  const achievement = await prisma.achievement.findFirst();
  if (achievement) {
    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        unlockedAt: new Date(),
      },
    });
  }
  await prisma.passwordResetToken.create({
    data: {
      userId,
      tokenHash: `hash-${userId}`,
      expiresAt: new Date(Date.now() + 3_600_000),
    },
  });
  const plaintext = generateRegistrationInvitePlaintext();
  await prisma.registrationInvite.create({
    data: {
      id: createId(),
      tokenHash: hashRegistrationInviteToken(plaintext),
      expiresAt: new Date(Date.now() + 86_400_000),
      usedAt: new Date(),
      usedByUserId: userId,
    },
  });
}

test("pg: deleteOwnAccount removes personal rows and the used invite", async (t) => {
  const result = await withLiveDb(async ({ prisma, service, strategy, refresh }) => {
    const catalogBefore = {
      substances: await prisma.substance.count(),
      organs: await prisma.organ.count(),
      achievements: await prisma.achievement.count(),
    };
    const { id, email } = await createTestUser(prisma, "main");
    await attachPersonalData(prisma, id);
    const session = await refresh.issueSession(id);

    const other = await createTestUser(prisma, "other");
    const otherInvitePlain = generateRegistrationInvitePlaintext();
    await prisma.registrationInvite.create({
      data: {
        id: createId(),
        tokenHash: hashRegistrationInviteToken(otherInvitePlain),
        expiresAt: new Date(Date.now() + 86_400_000),
        usedAt: new Date(),
        usedByUserId: other.id,
      },
    });

    await service.deleteOwnAccount(id, PASSWORD);

    assert.equal(await prisma.user.count({ where: { id } }), 0);
    assert.equal(await prisma.substanceUsage.count({ where: { userId: id } }), 0);
    assert.equal(await prisma.userAchievement.count({ where: { userId: id } }), 0);
    assert.equal(await prisma.refreshToken.count({ where: { userId: id } }), 0);
    assert.equal(
      await prisma.passwordResetToken.count({ where: { userId: id } }),
      0,
    );
    assert.equal(
      await prisma.registrationInvite.count({ where: { usedByUserId: id } }),
      0,
    );
    assert.equal(
      await prisma.registrationInvite.count({ where: { usedByUserId: other.id } }),
      1,
    );
    assert.equal(await prisma.substance.count(), catalogBefore.substances);
    assert.equal(await prisma.organ.count(), catalogBefore.organs);
    assert.equal(await prisma.achievement.count(), catalogBefore.achievements);

    await assert.rejects(
      () => strategy.validate({ sub: id, email }),
      UnauthorizedException,
    );
    await assert.rejects(
      () => refresh.rotateSession(session.plaintext),
      UnauthorizedException,
    );
    await assert.rejects(
      () =>
        service.login({
          email,
          password: PASSWORD,
        }),
      UnauthorizedException,
    );

    await prisma.registrationInvite.deleteMany({
      where: { usedByUserId: other.id },
    });
    await prisma.user.delete({ where: { id: other.id } }).catch(() => undefined);
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: concurrent deleteOwnAccount — one winner, no leftover user", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const { id } = await createTestUser(prisma, "race");
    await attachPersonalData(prisma, id);

    const results = await Promise.allSettled([
      service.deleteOwnAccount(id, PASSWORD),
      service.deleteOwnAccount(id, PASSWORD),
    ]);
    const fulfilled = results.filter((r) => r.status === "fulfilled").length;
    const rejected = results.filter((r) => r.status === "rejected");
    assert.equal(fulfilled + rejected.length, 2);
    assert.ok(fulfilled >= 1);
    for (const r of rejected) {
      assert.ok(r.status === "rejected");
      assert.ok(r.reason instanceof UnauthorizedException);
    }
    assert.equal(await prisma.user.count({ where: { id } }), 0);
    assert.equal(
      await prisma.registrationInvite.count({ where: { usedByUserId: id } }),
      0,
    );
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});
