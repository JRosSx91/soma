/**
 * Real PostgreSQL integration for password-reset atomicity.
 * Skips when DATABASE_URL is unset or unreachable.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { compare } from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { PasswordResetService } from "./password-reset.service.js";
import { MemoryPasswordResetMailer } from "./password-reset.mailer.js";
import { createId } from "./create-id.js";
import { hashPasswordResetToken } from "./password-reset.crypto.js";
import { RefreshSessionService } from "./refresh-session.service.js";

async function withLiveDb(
  run: (ctx: {
    prisma: PrismaClient;
    service: PasswordResetService;
    mailer: MemoryPasswordResetMailer;
    refresh: RefreshSessionService;
    userId: string;
    email: string;
  }) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";
  const prisma = new PrismaClient();
  const userId = createId();
  const email = `pwreset-it-${userId}@example.test`;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  process.env.AUTH_PASSWORD_RESET_MIN_MS = "0";
  process.env.APP_PUBLIC_URL = "http://localhost:5173";
  process.env.NODE_ENV = "test";

  const mailer = new MemoryPasswordResetMailer();
  const users = new UsersService(prisma as never);
  const service = new PasswordResetService(prisma as never, users, mailer);
  const refresh = new RefreshSessionService(prisma as never);

  try {
    await prisma.user.create({
      data: {
        id: userId,
        email,
        hashedPassword: await hash("old-password-1", 4),
        displayName: "PW Reset IT",
        biologicalSex: "male",
        birthYear: 1990,
      },
    });
    await run({ prisma, service, mailer, refresh, userId, email });
    return "ran";
  } finally {
    await prisma.passwordResetToken
      .deleteMany({ where: { userId } })
      .catch(() => undefined);
    await prisma.refreshToken
      .deleteMany({ where: { userId } })
      .catch(() => undefined);
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
}

test("pg: PasswordResetToken table exists", async (t) => {
  const result = await withLiveDb(async (prismaCtx) => {
    const rows = await prismaCtx.prisma.$queryRaw<{ t: string | null }[]>`
      SELECT to_regclass('public."PasswordResetToken"')::text AS t
    `;
    assert.ok(
      rows[0]?.t === "PasswordResetToken" ||
        rows[0]?.t === '"PasswordResetToken"',
    );
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: full reset revokes refresh and accepts only the new password", async (t) => {
  const result = await withLiveDb(async ({ prisma, service, mailer, refresh, email, userId }) => {
    const issued = await refresh.issueSession(userId);
    await service.requestReset({ email });
    const token = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;
    const stored = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashPasswordResetToken(token) },
    });
    assert.ok(stored);
    assert.notEqual(stored!.tokenHash, token);

    await service.resetPassword({ token, newPassword: "brand-new-pass" });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    assert.equal(await compare("brand-new-pass", user.hashedPassword), true);
    assert.equal(await compare("old-password-1", user.hashedPassword), false);

    await assert.rejects(
      () => refresh.rotateSession(issued.plaintext),
      (err: unknown) => {
        assert.ok(err instanceof Error);
        return true;
      },
    );

    const active = await prisma.refreshToken.count({
      where: { userId, revokedAt: null },
    });
    assert.equal(active, 0);
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: concurrent resets with the same token — one winner", async (t) => {
  const result = await withLiveDb(async ({ service, mailer, email, prisma, userId }) => {
    await service.requestReset({ email });
    const token = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;

    const [a, b] = await Promise.allSettled([
      service.resetPassword({ token, newPassword: "concurrent-win1" }),
      service.resetPassword({ token, newPassword: "concurrent-lose" }),
    ]);

    const fulfilled = [a, b].filter((r) => r.status === "fulfilled");
    const rejected = [a, b].filter((r) => r.status === "rejected");
    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(
      rejected[0]!.status === "rejected" &&
        rejected[0]!.reason instanceof BadRequestException,
    );

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const winOk = await compare("concurrent-win1", user.hashedPassword);
    const loseOk = await compare("concurrent-lose", user.hashedPassword);
    assert.equal(winOk || loseOk, true);
    assert.notEqual(winOk, loseOk);
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});
