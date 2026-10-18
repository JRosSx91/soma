import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { PasswordResetService, FORGOT_PASSWORD_RESPONSE } from "./password-reset.service.js";
import { MemoryPasswordResetPrisma } from "./password-reset.memory.js";
import { MemoryPasswordResetMailer } from "./password-reset.mailer.js";
import {
  generatePasswordResetPlaintext,
  hashPasswordResetToken,
} from "./password-reset.crypto.js";
import { createId } from "./create-id.js";
import { hashRefreshToken } from "./refresh-token.crypto.js";

function setup() {
  process.env.AUTH_PASSWORD_RESET_MIN_MS = "0";
  process.env.APP_PUBLIC_URL = "http://localhost:5173";
  process.env.NODE_ENV = "test";

  const db = new MemoryPasswordResetPrisma();
  const mailer = new MemoryPasswordResetMailer();
  const users = new UsersService(db as never);
  const service = new PasswordResetService(db as never, users, mailer);
  return { db, mailer, service, users };
}

test("forgot-password: existing and missing emails share the same generic response", async () => {
  const { db, mailer, service } = setup();
  const user = db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });

  const existing = await service.requestReset({ email: "user@example.com" });
  const missing = await service.requestReset({ email: "nobody@example.com" });

  assert.deepEqual(existing, FORGOT_PASSWORD_RESPONSE);
  assert.deepEqual(missing, FORGOT_PASSWORD_RESPONSE);
  assert.equal(mailer.sent.length, 1);
  assert.equal(mailer.last()?.to, user.email);
  assert.match(mailer.last()!.resetUrl, /token=/);
});

test("forgot-password normalizes email and persists only the hash", async () => {
  const { db, mailer, service } = setup();
  db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });

  await service.requestReset({ email: "  User@Example.COM " });
  assert.equal(mailer.sent.length, 1);
  const url = new URL(mailer.last()!.resetUrl);
  const plaintext = url.searchParams.get("token")!;
  const rows = [...db.resetTokens.values()];
  assert.equal(rows.length, 1);
  assert.equal(rows[0]!.tokenHash, hashPasswordResetToken(plaintext));
  assert.ok(!JSON.stringify(rows).includes(plaintext));
});

test("forgot-password skips token issuance on legacy email collision", async () => {
  const { db, mailer, service } = setup();
  db.seedUser({
    id: createId(),
    email: "Same@Example.com",
    hashedPassword: await bcrypt.hash("a", 4),
  });
  db.seedUser({
    id: createId(),
    email: "same@example.com",
    hashedPassword: await bcrypt.hash("b", 4),
  });

  const res = await service.requestReset({ email: "same@example.com" });
  assert.deepEqual(res, FORGOT_PASSWORD_RESPONSE);
  assert.equal(mailer.sent.length, 0);
  assert.equal(db.resetTokens.size, 0);
});

test("forgot-password invalidates prior unused tokens when re-requested", async () => {
  const { db, mailer, service } = setup();
  db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });

  await service.requestReset({ email: "user@example.com" });
  const first = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;
  await service.requestReset({ email: "user@example.com" });
  const second = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;
  assert.notEqual(first, second);

  const firstRow = [...db.resetTokens.values()].find(
    (r) => r.tokenHash === hashPasswordResetToken(first),
  )!;
  assert.ok(firstRow.usedAt);
});

test("forgot-password mailer failure discards only the new token", async () => {
  const { db, mailer, service } = setup();
  db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });
  await service.requestReset({ email: "user@example.com" });
  const first = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;
  const firstHash = hashPasswordResetToken(first);

  const failing = {
    kind: "provider" as const,
    canAcceptSend: () => true,
    sendPasswordReset: async () => {
      throw new Error("smtp down");
    },
  };
  const failingService = new PasswordResetService(
    db as never,
    new UsersService(db as never),
    failing as never,
  );

  const res = await failingService.requestReset({ email: "user@example.com" });
  assert.deepEqual(res, FORGOT_PASSWORD_RESPONSE);

  const firstRow = [...db.resetTokens.values()].find(
    (r) => r.tokenHash === firstHash,
  )!;
  assert.equal(firstRow.usedAt, null, "prior token must survive mailer failure");

  const discarded = [...db.resetTokens.values()].filter(
    (r) => r.tokenHash !== firstHash,
  );
  assert.equal(discarded.length, 1);
  assert.ok(discarded[0]!.usedAt);
});

test("forgot-password with disabled mailer does not mint or invalidate tokens", async () => {
  const { db } = setup();
  db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });
  // Seed a live prior token
  const priorPlain = generatePasswordResetPlaintext();
  await db.passwordResetToken.create({
    data: {
      id: createId(),
      userId: [...db.users.values()][0]!.id,
      tokenHash: hashPasswordResetToken(priorPlain),
      expiresAt: new Date(Date.now() + 60_000),
    },
  });

  const disabled = {
    kind: "disabled" as const,
    canAcceptSend: () => false,
    sendPasswordReset: async () => {
      throw new Error("should not send");
    },
  };
  const service = new PasswordResetService(
    db as never,
    new UsersService(db as never),
    disabled as never,
  );

  const res = await service.requestReset({ email: "user@example.com" });
  assert.deepEqual(res, FORGOT_PASSWORD_RESPONSE);
  assert.equal(db.resetTokens.size, 1);
  assert.equal([...db.resetTokens.values()][0]!.usedAt, null);
});

test("reset-password rolls back when a mid-transaction step fails", async () => {
  const { db, mailer, service } = setup();
  const user = db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });
  await db.refreshToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: hashRefreshToken("refresh-plain"),
      familyId: createId(),
      expiresAt: new Date(Date.now() + 86_400_000),
    },
  });
  await service.requestReset({ email: "user@example.com" });
  const token = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;

  const originalUpdate = db.user.update.bind(db.user);
  db.user.update = async () => {
    throw new Error("forced user update failure");
  };

  await assert.rejects(
    () => service.resetPassword({ token, newPassword: "should-not-stick" }),
    BadRequestException,
  );

  db.user.update = originalUpdate;

  const unchanged = db.users.get(user.id)!;
  assert.equal(await bcrypt.compare("password123", unchanged.hashedPassword), true);
  const resetRow = [...db.resetTokens.values()].find(
    (r) => r.tokenHash === hashPasswordResetToken(token),
  )!;
  assert.equal(resetRow.usedAt, null);
  assert.equal([...db.refreshTokens.values()][0]!.revokedAt, null);
});

test("reset-password rejects invalid, expired, and used tokens", async () => {
  const { db, service } = setup();
  const user = db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });

  await assert.rejects(
    () =>
      service.resetPassword({
        token: generatePasswordResetPlaintext(),
        newPassword: "newpass12",
      }),
    BadRequestException,
  );

  const expiredPlain = generatePasswordResetPlaintext();
  await db.passwordResetToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: hashPasswordResetToken(expiredPlain),
      expiresAt: new Date(Date.now() - 1000),
    },
  });
  await assert.rejects(
    () =>
      service.resetPassword({
        token: expiredPlain,
        newPassword: "newpass12",
      }),
    BadRequestException,
  );

  const usedPlain = generatePasswordResetPlaintext();
  await db.passwordResetToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: hashPasswordResetToken(usedPlain),
      expiresAt: new Date(Date.now() + 60_000),
      usedAt: new Date(),
    },
  });
  await assert.rejects(
    () =>
      service.resetPassword({
        token: usedPlain,
        newPassword: "newpass12",
      }),
    BadRequestException,
  );
});

test("reset-password updates hash, revokes refresh, and rejects old password", async () => {
  const { db, mailer, service } = setup();
  const user = db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });
  await db.refreshToken.create({
    data: {
      id: createId(),
      userId: user.id,
      tokenHash: hashRefreshToken("refresh-plain"),
      familyId: createId(),
      expiresAt: new Date(Date.now() + 86_400_000),
    },
  });

  await service.requestReset({ email: "user@example.com" });
  const token = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;

  await service.resetPassword({ token, newPassword: "brand-new-99" });

  const updated = db.users.get(user.id)!;
  assert.equal(await bcrypt.compare("brand-new-99", updated.hashedPassword), true);
  assert.equal(await bcrypt.compare("password123", updated.hashedPassword), false);

  const refresh = [...db.refreshTokens.values()][0]!;
  assert.ok(refresh.revokedAt);

  const resetRow = [...db.resetTokens.values()].find(
    (r) => r.tokenHash === hashPasswordResetToken(token),
  )!;
  assert.ok(resetRow.usedAt);

  await assert.rejects(
    () => service.resetPassword({ token, newPassword: "another-one" }),
    BadRequestException,
  );
});

test("concurrent reset-password: exactly one winner", async () => {
  const { db, mailer, service } = setup();
  db.seedUser({
    email: "user@example.com",
    hashedPassword: await bcrypt.hash("password123", 4),
  });
  await service.requestReset({ email: "user@example.com" });
  const token = new URL(mailer.last()!.resetUrl).searchParams.get("token")!;

  const [a, b] = await Promise.allSettled([
    service.resetPassword({ token, newPassword: "winner-pass1" }),
    service.resetPassword({ token, newPassword: "loser-pass12" }),
  ]);

  const ok = [a, b].filter((r) => r.status === "fulfilled");
  const fail = [a, b].filter((r) => r.status === "rejected");
  assert.equal(ok.length, 1);
  assert.equal(fail.length, 1);
  assert.ok(
    fail[0]!.status === "rejected" &&
      fail[0]!.reason instanceof BadRequestException,
  );
});
