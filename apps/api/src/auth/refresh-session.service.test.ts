import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { RefreshSessionService } from "./refresh-session.service.js";
import { hashRefreshToken } from "./refresh-token.crypto.js";
import { MemoryRefreshPrisma } from "./refresh-session.memory.js";

function serviceWith(db: MemoryRefreshPrisma) {
  return new RefreshSessionService(db as never);
}

test("issueSession persists only the hash of the plaintext token", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  const issued = await service.issueSession("user-1");
  const stored = db.all();
  assert.equal(stored.length, 1);
  assert.equal(stored[0]!.tokenHash, hashRefreshToken(issued.plaintext));
  assert.notEqual(stored[0]!.tokenHash, issued.plaintext);
  assert.ok(!JSON.stringify(stored).includes(issued.plaintext));
});

test("rotateSession issues a new hash and revokes the previous row", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  const first = await service.issueSession("user-1");
  const rotated = await service.rotateSession(first.plaintext);
  assert.notEqual(rotated.session.plaintext, first.plaintext);
  const rows = db.all();
  assert.equal(rows.length, 2);
  const old = rows.find((r) => r.tokenHash === hashRefreshToken(first.plaintext))!;
  const next = rows.find(
    (r) => r.tokenHash === hashRefreshToken(rotated.session.plaintext),
  )!;
  assert.ok(old.revokedAt);
  assert.equal(old.replacedById, next.id);
  assert.equal(next.revokedAt, null);
  assert.equal(old.familyId, next.familyId);
});

test("expired and unknown tokens are rejected", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  await assert.rejects(
    () => service.rotateSession("unknown-token"),
    UnauthorizedException,
  );

  const issued = await service.issueSession("user-1");
  const row = db.all()[0]!;
  row.expiresAt = new Date(Date.now() - 1000);
  await assert.rejects(
    () => service.rotateSession(issued.plaintext),
    UnauthorizedException,
  );
});

test("revoked token without replacement is rejected", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  const issued = await service.issueSession("user-1");
  await service.revokeByPlaintext(issued.plaintext);
  await assert.rejects(
    () => service.rotateSession(issued.plaintext),
    UnauthorizedException,
  );
});

test("reuse of a rotated token outside the race window revokes the family", async () => {
  const prev = process.env.AUTH_REFRESH_CONCURRENT_RACE_MS;
  process.env.AUTH_REFRESH_CONCURRENT_RACE_MS = "0";
  try {
    const db = new MemoryRefreshPrisma();
    const service = serviceWith(db);
    const first = await service.issueSession("user-1");
    const second = await service.rotateSession(first.plaintext);
    await assert.rejects(
      () => service.rotateSession(first.plaintext),
      UnauthorizedException,
    );
    const active = db
      .all()
      .filter((r) => r.revokedAt === null && r.expiresAt > new Date());
    assert.equal(active.length, 0);
    await assert.rejects(
      () => service.rotateSession(second.session.plaintext),
      UnauthorizedException,
    );
  } finally {
    process.env.AUTH_REFRESH_CONCURRENT_RACE_MS = prev;
  }
});

test("concurrent rotations: exactly one winner; loser gets 401 without new credentials", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  process.env.AUTH_REFRESH_CONCURRENT_RACE_MS = "60000";
  const first = await service.issueSession("user-1");

  const [a, b] = await Promise.allSettled([
    service.rotateSession(first.plaintext),
    service.rotateSession(first.plaintext),
  ]);

  const fulfilled = [a, b].filter((r) => r.status === "fulfilled") as PromiseFulfilledResult<{
    session: { plaintext: string };
  }>[];
  const rejected = [a, b].filter((r) => r.status === "rejected");

  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  assert.ok(rejected[0]!.status === "rejected");
  assert.ok(rejected[0]!.reason instanceof UnauthorizedException);

  const active = db
    .all()
    .filter((r) => r.revokedAt === null && r.expiresAt > new Date());
  assert.equal(active.length, 1);
  assert.equal(active[0]!.tokenHash, hashRefreshToken(fulfilled[0]!.value.session.plaintext));

  // Old plaintext must not yield another mint while the race window is open.
  await assert.rejects(
    () => service.rotateSession(first.plaintext),
    UnauthorizedException,
  );
  assert.equal(
    db.all().filter((r) => r.revokedAt === null && r.expiresAt > new Date()).length,
    1,
  );
});

test("logout is idempotent for missing and already-revoked cookies", async () => {
  const db = new MemoryRefreshPrisma();
  const service = serviceWith(db);
  await service.revokeByPlaintext(undefined);
  await service.revokeByPlaintext("never-issued");
  const issued = await service.issueSession("user-1");
  await service.revokeByPlaintext(issued.plaintext);
  await service.revokeByPlaintext(issued.plaintext);
  assert.equal(db.all().filter((r) => r.revokedAt === null).length, 0);
});
