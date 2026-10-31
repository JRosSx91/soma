/**
 * Real PostgreSQL atomicity for closed-beta invites.
 * Skips when DATABASE_URL is unset, unreachable, or the table is missing.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuthService } from "./auth.service.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";
import { createId } from "./create-id.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
} from "./invite-token.crypto.js";
import { REGISTRATION_UNAVAILABLE_CODE } from "./registration-mode.js";
import { currentRegisterClientFields } from "@soma/shared-types";

async function withLiveDb(
  run: (ctx: {
    prisma: PrismaClient;
    service: AuthService;
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

  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "invite";

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

  try {
    await run({ prisma, service });
    return "ran";
  } finally {
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
    await prisma.$disconnect().catch(() => undefined);
  }
}

test("pg: RegistrationInvite table exists", async (t) => {
  const result = await withLiveDb(async ({ prisma }) => {
    const rows = await prisma.$queryRaw<{ t: string | null }[]>`
      SELECT to_regclass('public."RegistrationInvite"')::text AS t
    `;
    assert.ok(
      rows[0]?.t === "RegistrationInvite" ||
        rows[0]?.t === '"RegistrationInvite"',
    );
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});

test("pg: two concurrent registers with the same invite — one winner", async (t) => {
  const result = await withLiveDb(async ({ prisma, service }) => {
    const plaintext = generateRegistrationInvitePlaintext();
    const inviteId = createId();
    await prisma.registrationInvite.create({
      data: {
        id: inviteId,
        tokenHash: hashRegistrationInviteToken(plaintext),
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });

    const dtoA = {
      email: `invite-a-${inviteId}@example.test`,
      password: "password123",
      displayName: "A",
      biologicalSex: "male" as const,
      inviteToken: plaintext,
      ...currentRegisterClientFields(),
    };
    const dtoB = {
      ...dtoA,
      email: `invite-b-${inviteId}@example.test`,
      displayName: "B",
    };

    const settled = await Promise.allSettled([
      service.register(dtoA),
      service.register(dtoB),
    ]);

    const ok = settled.filter((row) => row.status === "fulfilled");
    const failed = settled.filter((row) => row.status === "rejected");
    assert.equal(ok.length, 1);
    assert.equal(failed.length, 1);
    const reason = (failed[0] as PromiseRejectedResult).reason;
    assert.ok(reason instanceof CodedForbiddenException);
    assert.equal(reason.code, REGISTRATION_UNAVAILABLE_CODE);

    const users = await prisma.user.findMany({
      where: {
        email: { in: [dtoA.email, dtoB.email] },
      },
    });
    assert.equal(users.length, 1);

    const invite = await prisma.registrationInvite.findUniqueOrThrow({
      where: { id: inviteId },
    });
    assert.ok(invite.usedAt);
    assert.equal(invite.usedByUserId, users[0]!.id);
    assert.notEqual(invite.tokenHash, plaintext);

    await prisma.registrationInvite.delete({ where: { id: inviteId } });
    await prisma.refreshToken.deleteMany({ where: { userId: users[0]!.id } });
    await prisma.user.delete({ where: { id: users[0]!.id } });
  });
  if (result === "skipped") t.skip("DATABASE_URL unavailable or migration not applied");
});
