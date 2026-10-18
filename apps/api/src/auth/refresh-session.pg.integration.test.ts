/**
 * Real PostgreSQL integration tests for RefreshSessionService.
 * Skips when DATABASE_URL is unset or the database is unreachable.
 * These are NOT mocks — they assert against a live Prisma datasource.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";
import { RefreshSessionService } from "./refresh-session.service.js";
import { hashRefreshToken } from "./refresh-token.crypto.js";
import { createId } from "./create-id.js";

async function withLiveDb(
  run: (
    prisma: PrismaClient,
    service: RefreshSessionService,
    userId: string,
  ) => Promise<void>,
): Promise<"ran" | "skipped"> {
  if (!process.env.DATABASE_URL) return "skipped";

  const prisma = new PrismaClient();
  const userId = createId();
  const email = `refresh-it-${userId}@example.test`;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    return "skipped";
  }

  try {
    await prisma.user.create({
      data: {
        id: userId,
        email,
        hashedPassword: await hash("integration-test-password", 4),
        displayName: "Refresh IT",
        biologicalSex: "male",
        birthYear: 1990,
      },
    });

    const service = new RefreshSessionService(prisma as never);
    await run(prisma, service, userId);
    return "ran";
  } finally {
    await prisma.refreshToken
      .deleteMany({ where: { userId } })
      .catch(() => undefined);
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
}

test("pg: RefreshToken table exists after migration", async (t) => {
  const result = await withLiveDb(async (prisma) => {
    const rows = await prisma.$queryRaw<{ t: string | null }[]>`
      SELECT to_regclass('public."RefreshToken"')::text AS t
    `;
    assert.ok(
      rows[0]?.t === "RefreshToken" || rows[0]?.t === '"RefreshToken"',
      `expected RefreshToken table, got ${String(rows[0]?.t)}`,
    );
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: issueSession persists only the hash", async (t) => {
  const result = await withLiveDb(async (prisma, service, userId) => {
    const issued = await service.issueSession(userId);
    const stored = await prisma.refreshToken.findMany({ where: { userId } });
    assert.equal(stored.length, 1);
    assert.equal(stored[0]!.tokenHash, hashRefreshToken(issued.plaintext));
    assert.notEqual(stored[0]!.tokenHash, issued.plaintext);
    assert.ok(!JSON.stringify(stored).includes(issued.plaintext));
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: rotateSession is atomic (old revoked, new active, same family)", async (t) => {
  const result = await withLiveDb(async (prisma, service, userId) => {
    const first = await service.issueSession(userId);
    const rotated = await service.rotateSession(first.plaintext);
    const rows = await prisma.refreshToken.findMany({ where: { userId } });
    assert.equal(rows.length, 2);
    const old = rows.find(
      (r) => r.tokenHash === hashRefreshToken(first.plaintext),
    )!;
    const next = rows.find(
      (r) => r.tokenHash === hashRefreshToken(rotated.session.plaintext),
    )!;
    assert.ok(old.revokedAt);
    assert.equal(old.replacedById, next.id);
    assert.equal(next.revokedAt, null);
    assert.equal(old.familyId, next.familyId);
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: two concurrent rotations — one winner, loser 401, no orphan credentials", async (t) => {
  const result = await withLiveDb(async (prisma, service, userId) => {
    process.env.AUTH_REFRESH_CONCURRENT_RACE_MS = "60000";
    const first = await service.issueSession(userId);

    const [a, b] = await Promise.allSettled([
      service.rotateSession(first.plaintext),
      service.rotateSession(first.plaintext),
    ]);

    const fulfilled = [a, b].filter(
      (r) => r.status === "fulfilled",
    ) as PromiseFulfilledResult<{ session: { plaintext: string } }>[];
    const rejected = [a, b].filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1);
    assert.equal(rejected.length, 1);
    assert.ok(
      rejected[0]!.status === "rejected" &&
        rejected[0]!.reason instanceof UnauthorizedException,
    );

    const active = await prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    assert.equal(active.length, 1);
    assert.equal(
      active[0]!.tokenHash,
      hashRefreshToken(fulfilled[0]!.value.session.plaintext),
    );

    await assert.rejects(
      () => service.rotateSession(first.plaintext),
      UnauthorizedException,
    );

    const stillActive = await prisma.refreshToken.count({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    assert.equal(stillActive, 1);
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});

test("pg: logout revokes the family; reuse of rotated token outside race window kills family", async (t) => {
  const result = await withLiveDb(async (prisma, service, userId) => {
    const first = await service.issueSession(userId);
    await service.revokeByPlaintext(first.plaintext);
    const afterLogout = await prisma.refreshToken.count({
      where: { userId, revokedAt: null },
    });
    assert.equal(afterLogout, 0);

    process.env.AUTH_REFRESH_CONCURRENT_RACE_MS = "0";
    const a = await service.issueSession(userId);
    const b = await service.rotateSession(a.plaintext);
    await assert.rejects(
      () => service.rotateSession(a.plaintext),
      UnauthorizedException,
    );
    const active = await prisma.refreshToken.count({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    });
    assert.equal(active, 0);
    await assert.rejects(
      () => service.rotateSession(b.session.plaintext),
      UnauthorizedException,
    );
  });
  if (result === "skipped") t.skip("PostgreSQL unavailable");
});
