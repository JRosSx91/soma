import assert from "node:assert/strict";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import bcrypt from "bcrypt";
import { AuthService } from "./auth.service.js";
import {
  CodedBadRequestException,
  CodedConflictException,
} from "../common/exceptions/coded-exception.js";
import type { EmailLookupResult, UsersService } from "../users/users.service.js";
import type { RefreshSessionService } from "./refresh-session.service.js";
import {
  currentRegisterClientFields,
  currentSpecialCategoryGrantFields,
} from "@soma/shared-types";
import { AUTH_ACCEPTANCE_REQUIRED_CODE } from "./registration-acceptance.js";

const acceptance = currentRegisterClientFields();

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
    {
      $transaction: async () => {
        throw new Error("open-mode register must not open a transaction");
      },
      registrationAcceptance: {
        createMany: async () => ({ count: 3 }),
      },
    } as never,
    { claimUnused: async () => null, attachUser: async () => undefined } as never,
  );
}

test("register stores a normalized email and issues a refresh session", async () => {
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";
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
    ...acceptance,
  });

  assert.equal(created[0], "new.user@example.com");
  assert.equal(result.user.email, "new.user@example.com");
  assert.ok(result.accessToken.startsWith("token:"));
  assert.equal(result.refresh.plaintext, "refresh-plain");
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
});

test("register with existing email (any casing) throws AUTH_EMAIL_EXISTS", async () => {
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";
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
        ...acceptance,
      }),
    (err: unknown) => {
      assert.ok(err instanceof CodedConflictException);
      assert.equal(err.code, "AUTH_EMAIL_EXISTS");
      return true;
    },
  );
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
});

test("register without current acceptances is rejected before user create", async () => {
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";
  let created = 0;
  const service = createService({
    findByEmailInsensitive: async () => ({ status: "none" }),
    create: async () => {
      created += 1;
      return fakeUser();
    },
  });

  await assert.rejects(
    () =>
      service.register({
        email: "user@example.com",
        password: "password123",
        displayName: "New",
        biologicalSex: "male",
        ...acceptance,
        acceptedTerms: false,
      }),
    (err: unknown) => {
      assert.ok(err instanceof CodedBadRequestException);
      assert.equal(err.code, AUTH_ACCEPTANCE_REQUIRED_CODE);
      return true;
    },
  );
  assert.equal(created, 0);
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
});

test("production open register is allowed after legal notices are published", async () => {
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  const prevNode = process.env.NODE_ENV;
  process.env.AUTH_REGISTRATION_MODE = "open";
  process.env.NODE_ENV = "production";
  let created = 0;
  const service = createService({
    findByEmailInsensitive: async () => ({ status: "none" }),
    create: async () => {
      created += 1;
      return fakeUser({ email: "prod@example.com", displayName: "Prod" });
    },
  });

  const result = await service.register({
    email: "prod@example.com",
    password: "password123",
    displayName: "Prod",
    biologicalSex: "male",
    ...acceptance,
  });
  assert.equal(created, 1);
  assert.equal(result.user.email, "prod@example.com");
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
  if (prevNode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prevNode;
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

function createDeleteService(tx: {
  $queryRaw: () => Promise<{ id: string }[]>;
  user: {
    findUnique: (args: { where: { id: string } }) => Promise<FakeUser | null>;
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };
  registrationInvite: {
    deleteMany: (args: { where: { usedByUserId: string } }) => Promise<{ count: number }>;
  };
}) {
  const jwtService = { sign: () => "unused" };
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
    {} as unknown as UsersService,
    jwtService as never,
    refreshSessions as unknown as RefreshSessionService,
    {
      $transaction: async (fn: (client: typeof tx) => Promise<void>) => fn(tx),
    } as never,
    { claimUnused: async () => null, attachUser: async () => undefined } as never,
  );
}

test("grantSpecialCategoryConsent appends a grant for the JWT user", async () => {
  const user = fakeUser();
  const created: Array<Record<string, unknown>> = [];
  const txExtra = {
    registrationAcceptance: {
      findMany: async () => [],
      create: async ({ data }: { data: Record<string, unknown> }) => {
        created.push(data);
        return data;
      },
    },
  };
  const grantService = new AuthService(
    {} as unknown as UsersService,
    { sign: () => "unused" } as never,
    {
      issueSession: async () => ({
        plaintext: "x",
        familyId: "f",
        expiresAt: new Date(),
      }),
      rotateSession: async () => ({
        userId: user.id,
        session: { plaintext: "x", familyId: "f", expiresAt: new Date() },
      }),
      revokeByPlaintext: async () => undefined,
    } as unknown as RefreshSessionService,
    {
      $transaction: async (fn: (client: typeof txExtra) => Promise<void>) => {
        const tx = {
          $queryRaw: async () => [{ id: user.id }],
          ...txExtra,
        };
        await fn(tx);
      },
    } as never,
    { claimUnused: async () => null, attachUser: async () => undefined } as never,
  );
  await grantService.grantSpecialCategoryConsent(
    user.id,
    currentSpecialCategoryGrantFields(),
  );
  assert.equal(created.length, 1);
  assert.equal(created[0]?.userId, user.id);
  assert.equal(created[0]?.purpose, "special_category_processing");
});

test("withdrawSpecialCategoryConsent rejects a wrong password", async () => {
  const user = fakeUser();
  const service = createDeleteService({
    $queryRaw: async () => [{ id: user.id }],
    user: {
      findUnique: async () => user,
      delete: async () => {
        throw new Error("must not delete account");
      },
    },
    registrationInvite: {
      deleteMany: async () => {
        throw new Error("must not delete invites");
      },
    },
  });
  await assert.rejects(
    () => service.withdrawSpecialCategoryConsent(user.id, "wrong-pass"),
    (err: unknown) => {
      assert.ok(err instanceof UnauthorizedException);
      assert.equal(err.message, "Invalid credentials");
      return true;
    },
  );
});

test("deleteOwnAccount removes the invite then the user", async () => {
  const user = fakeUser();
  const ops: string[] = [];
  const service = createDeleteService({
    $queryRaw: async () => [{ id: user.id }],
    user: {
      findUnique: async () => user,
      delete: async ({ where }) => {
        ops.push(`user:${where.id}`);
        return user;
      },
    },
    registrationInvite: {
      deleteMany: async ({ where }) => {
        ops.push(`invite:${where.usedByUserId}`);
        return { count: 1 };
      },
    },
  });

  await service.deleteOwnAccount(user.id, "password123");
  assert.deepEqual(ops, [`invite:${user.id}`, `user:${user.id}`]);
});

test("deleteOwnAccount rejects a wrong password without deleting", async () => {
  const user = fakeUser();
  let deleted = false;
  const service = createDeleteService({
    $queryRaw: async () => [{ id: user.id }],
    user: {
      findUnique: async () => user,
      delete: async () => {
        deleted = true;
        return user;
      },
    },
    registrationInvite: {
      deleteMany: async () => {
        deleted = true;
        return { count: 1 };
      },
    },
  });

  await assert.rejects(
    () => service.deleteOwnAccount(user.id, "wrong-pass"),
    (err: unknown) => {
      assert.ok(err instanceof UnauthorizedException);
      assert.equal(err.message, "Invalid credentials");
      return true;
    },
  );
  assert.equal(deleted, false);
});

test("deleteOwnAccount is unauthorized when the row is already gone", async () => {
  const service = createDeleteService({
    $queryRaw: async () => [],
    user: {
      findUnique: async () => null,
      delete: async () => {
        throw new Error("must not delete");
      },
    },
    registrationInvite: {
      deleteMany: async () => {
        throw new Error("must not delete invites");
      },
    },
  });

  await assert.rejects(
    () => service.deleteOwnAccount("user-1", "password123"),
    UnauthorizedException,
  );
});

test("deleteOwnAccount rolls back when user.delete fails", async () => {
  const user = fakeUser();
  const ops: string[] = [];
  const service = new AuthService(
    {} as unknown as UsersService,
    { sign: () => "unused" } as never,
    {
      issueSession: async () => ({
        plaintext: "x",
        familyId: "f",
        expiresAt: new Date(),
      }),
      rotateSession: async () => ({
        userId: "user-1",
        session: { plaintext: "x", familyId: "f", expiresAt: new Date() },
      }),
      revokeByPlaintext: async () => undefined,
    } as unknown as RefreshSessionService,
    {
      $transaction: async (fn: (tx: unknown) => Promise<void>) => {
        const tx = {
          $queryRaw: async () => [{ id: user.id }],
          user: {
            findUnique: async () => user,
            delete: async () => {
              throw new Error("forced failure");
            },
          },
          registrationInvite: {
            deleteMany: async () => {
              ops.push("invite");
              return { count: 1 };
            },
          },
        };
        try {
          await fn(tx);
          ops.push("committed");
        } catch (err) {
          ops.push("rolled_back");
          throw err;
        }
      },
    } as never,
    { claimUnused: async () => null, attachUser: async () => undefined } as never,
  );

  await assert.rejects(
    () => service.deleteOwnAccount(user.id, "password123"),
    /forced failure/,
  );
  assert.deepEqual(ops, ["invite", "rolled_back"]);
});
