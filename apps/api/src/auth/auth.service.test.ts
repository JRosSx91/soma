import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service.js";
import { CodedConflictException } from "../common/exceptions/coded-exception.js";
import type { EmailLookupResult, UsersService } from "../users/users.service.js";
import type { RefreshSessionService } from "./refresh-session.service.js";

type FakeUser = {
  id: string;
  email: string;
  hashedPassword: string;
  displayName: string;
  biologicalSex: "male";
  birthYear: number;
  weightKg: number | null;
  createdAt: Date;
  updatedAt: Date;
};

function fakeUser(overrides: Partial<FakeUser> = {}): FakeUser {
  return {
    id: "user-1",
    email: "user@example.com",
    hashedPassword: bcrypt.hashSync("password123", 4),
    displayName: "Test",
    biologicalSex: "male",
    birthYear: 1990,
    weightKg: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createService(users: {
  findByEmailInsensitive: (email: string) => Promise<EmailLookupResult>;
  create?: UsersService["create"];
  findById?: UsersService["findById"];
}) {
  const jwtService = {
    sign: (payload: unknown) => `token:${JSON.stringify(payload)}`,
  };
  const refreshSessions = {
    issueSession: async () => ({
      plaintext: "refresh-plain",
      familyId: "family-1",
      expiresAt: new Date(Date.now() + 86_400_000),
    }),
    rotateSession: async () => ({
      userId: "user-1",
      session: {
        plaintext: "refresh-rotated",
        familyId: "family-1",
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    }),
    revokeByPlaintext: async () => undefined,
  };
  return new AuthService(
    users as unknown as UsersService,
    jwtService as never,
    refreshSessions as unknown as RefreshSessionService,
  );
}

test("register stores a normalized email and issues a refresh session", async () => {
  const created: string[] = [];
  const service = createService({
    findByEmailInsensitive: async () => ({ status: "none" }),
    create: async (input) => {
      created.push(input.email);
      return fakeUser({ email: input.email, displayName: input.displayName });
    },
  });

  const result = await service.register({
    email: "  New.User@Example.COM ",
    password: "password123",
    displayName: "New",
    biologicalSex: "male",
    birthYear: 1991,
  });

  assert.equal(created[0], "new.user@example.com");
  assert.equal(result.user.email, "new.user@example.com");
  assert.ok(result.accessToken.startsWith("token:"));
  assert.equal(result.refresh.plaintext, "refresh-plain");
});

test("register with existing email (any casing) throws AUTH_EMAIL_EXISTS", async () => {
  const service = createService({
    findByEmailInsensitive: async () => ({
      status: "found",
      user: fakeUser({ email: "User@Example.com" }),
    }),
  });

  await assert.rejects(
    () =>
      service.register({
        email: "user@example.com",
        password: "password123",
        displayName: "Dup",
        biologicalSex: "male",
        birthYear: 1990,
      }),
    (err: unknown) => {
      assert.ok(err instanceof CodedConflictException);
      assert.equal(err.code, "AUTH_EMAIL_EXISTS");
      return true;
    },
  );
});

test("login accepts mixed-case and padded email against a legacy stored address", async () => {
  const legacy = fakeUser({ email: "User@Example.COM" });
  const service = createService({
    findByEmailInsensitive: async (email) => {
      assert.equal(email, "user@example.com");
      return { status: "found", user: legacy };
    },
  });

  const result = await service.login({
    email: "  USER@EXAMPLE.COM ",
    password: "password123",
  });

  assert.equal(result.user.id, legacy.id);
  assert.equal(result.refresh.plaintext, "refresh-plain");
});

test("login with wrong password throws Invalid credentials", async () => {
  const service = createService({
    findByEmailInsensitive: async () => ({
      status: "found",
      user: fakeUser(),
    }),
  });

  await assert.rejects(
    () => service.login({ email: "user@example.com", password: "wrong-pass" }),
    (err: unknown) => {
      assert.ok(err instanceof UnauthorizedException);
      assert.equal(err.message, "Invalid credentials");
      return true;
    },
  );
});

test("login with unknown email throws the same Invalid credentials message", async () => {
  const service = createService({
    findByEmailInsensitive: async () => ({ status: "none" }),
  });

  await assert.rejects(
    () => service.login({ email: "missing@example.com", password: "password123" }),
    (err: unknown) => {
      assert.ok(err instanceof UnauthorizedException);
      assert.equal(err.message, "Invalid credentials");
      return true;
    },
  );
});

test("login refuses authentication when multiple legacy rows collide", async () => {
  const service = createService({
    findByEmailInsensitive: async () => ({ status: "collision", count: 2 }),
  });

  await assert.rejects(
    () => service.login({ email: "user@example.com", password: "password123" }),
    (err: unknown) => {
      assert.ok(err instanceof UnauthorizedException);
      assert.equal(err.message, "Invalid credentials");
      return true;
    },
  );
});
