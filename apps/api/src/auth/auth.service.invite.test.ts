import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { AuthService } from "./auth.service.js";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
} from "./invite-token.crypto.js";
import type { UsersService } from "../users/users.service.js";
import type { RefreshSessionService } from "./refresh-session.service.js";
import { REGISTRATION_UNAVAILABLE_CODE } from "./registration-mode.js";
import { currentRegisterClientFields } from "@soma/shared-types";

type InviteRow = {
  id: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  revokedAt: Date | null;
  usedByUserId: string | null;
};

type UserRow = {
  id: string;
  email: string;
  hashedPassword: string;
  displayName: string;
  biologicalSex: "male";
  birthYear: number;
  weightKg: number | null;
};

const dto = {
  email: "beta@example.com",
  password: "password123",
  displayName: "Beta",
  biologicalSex: "male" as const,
  ...currentRegisterClientFields(),
};

function cloneInvites(rows: Map<string, InviteRow>): Map<string, InviteRow> {
  return new Map(
    [...rows.entries()].map(([id, row]) => [id, { ...row }]),
  );
}

function createInviteAuth(options: {
  invites: InviteRow[];
  existingEmails?: string[];
  failCreate?: boolean;
}) {
  const inviteById = new Map(options.invites.map((row) => [row.id, { ...row }]));
  const inviteByHash = new Map(
    options.invites.map((row) => [row.tokenHash, row.id]),
  );
  const usersByEmail = new Map(
    (options.existingEmails ?? []).map((email) => [email, true]),
  );
  let userSeq = 0;
  const createdUsers: UserRow[] = [];

  const tx = {
    registrationInvite: {
      findUnique: async ({ where: { tokenHash } }: { where: { tokenHash: string } }) => {
        const id = inviteByHash.get(tokenHash);
        if (!id) return null;
        const row = inviteById.get(id);
        return row ? { ...row } : null;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; usedAt: null; revokedAt: null; expiresAt: { gt: Date } };
        data: { usedAt: Date };
      }) => {
        const row = inviteById.get(where.id);
        if (
          !row ||
          row.usedAt ||
          row.revokedAt ||
          row.expiresAt.getTime() <= where.expiresAt.gt.getTime()
        ) {
          return { count: 0 };
        }
        row.usedAt = data.usedAt;
        return { count: 1 };
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { usedByUserId: string };
      }) => {
        const row = inviteById.get(where.id);
        if (row) row.usedByUserId = data.usedByUserId;
        return row;
      },
    },
    registrationAcceptance: {
      createMany: async () => ({ count: 3 }),
    },
    user: {
      findMany: async ({
        where,
      }: {
        where: { email: { equals: string; mode: string } };
      }) => {
        const email = where.email.equals;
        if (!usersByEmail.has(email)) return [];
        return [{ email }];
      },
      create: async ({ data }: { data: UserRow }) => {
        if (options.failCreate) throw new Error("create failed");
        userSeq += 1;
        const user = {
          ...data,
          id: `user-${userSeq}`,
          biologicalSex: "male" as const,
          weightKg: data.weightKg ?? null,
        };
        createdUsers.push(user);
        usersByEmail.set(user.email, true);
        return user;
      },
    },
  };

  const prisma = {
    $transaction: async (fn: (client: typeof tx) => Promise<unknown>) => {
      const snapshotInvites = cloneInvites(inviteById);
      const snapshotEmails = new Map(usersByEmail);
      const snapshotUsers = [...createdUsers];
      try {
        return await fn(tx);
      } catch (err) {
        inviteById.clear();
        for (const [id, row] of snapshotInvites) inviteById.set(id, row);
        usersByEmail.clear();
        for (const [email, flag] of snapshotEmails) usersByEmail.set(email, flag);
        createdUsers.length = 0;
        createdUsers.push(...snapshotUsers);
        throw err;
      }
    },
  };

  const users = {
    findByEmailInsensitive: async (email: string, db?: typeof tx) => {
      const client = db ?? tx;
      const matches = await client.user.findMany({
        where: { email: { equals: email, mode: "insensitive" } },
      });
      if (matches.length === 0) return { status: "none" as const };
      return {
        status: "found" as const,
        user: { email: matches[0]!.email } as never,
      };
    },
    create: async (input: UserRow, db?: typeof tx) => {
      const client = db ?? tx;
      return client.user.create({ data: input });
    },
  };

  const jwtService = {
    sign: (payload: unknown) => `token:${JSON.stringify(payload)}`,
  };
  const refreshSessions = {
    issueSession: async () => ({
      plaintext: "refresh-plain",
      familyId: "family-1",
      expiresAt: new Date(Date.now() + 86_400_000),
    }),
  };

  const service = new AuthService(
    users as unknown as UsersService,
    jwtService as never,
    refreshSessions as unknown as RefreshSessionService,
    prisma as never,
    new RegistrationInviteService(),
  );

  return { service, inviteById, createdUsers };
}

const prevMode = process.env.AUTH_REGISTRATION_MODE;

afterEach(() => {
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
});

function liveInvite(overrides: Partial<InviteRow> = {}): InviteRow {
  const plaintext = generateRegistrationInvitePlaintext();
  return {
    id: "inv-1",
    tokenHash: hashRegistrationInviteToken(plaintext),
    expiresAt: new Date(Date.now() + 86_400_000),
    usedAt: null,
    revokedAt: null,
    usedByUserId: null,
    ...overrides,
  };
}

test("invite mode without a token returns a generic 403", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const { service, createdUsers } = createInviteAuth({ invites: [] });
  await assert.rejects(
    () => service.register(dto),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, REGISTRATION_UNAVAILABLE_CODE);
      return true;
    },
  );
  assert.equal(createdUsers.length, 0);
});

test("invite mode accepts a valid unused invite", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const plaintext = generateRegistrationInvitePlaintext();
  const invite = liveInvite({
    tokenHash: hashRegistrationInviteToken(plaintext),
  });
  const { service, inviteById, createdUsers } = createInviteAuth({
    invites: [invite],
  });
  const result = await service.register({ ...dto, inviteToken: plaintext });
  assert.equal(result.user.email, "beta@example.com");
  assert.equal(createdUsers.length, 1);
  const stored = inviteById.get("inv-1");
  assert.ok(stored?.usedAt);
  assert.equal(stored?.usedByUserId, "user-1");
  assert.equal(JSON.stringify(inviteById.get("inv-1")), JSON.stringify(stored));
  assert.doesNotMatch(JSON.stringify(stored), new RegExp(plaintext));
});

test("expired, revoked, and used invites share the generic error", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const plaintext = generateRegistrationInvitePlaintext();
  const hash = hashRegistrationInviteToken(plaintext);

  for (const overrides of [
    { expiresAt: new Date(Date.now() - 1000) },
    { revokedAt: new Date() },
    { usedAt: new Date() },
  ] as Partial<InviteRow>[]) {
    const { service, createdUsers } = createInviteAuth({
      invites: [liveInvite({ tokenHash: hash, ...overrides })],
    });
    await assert.rejects(
      () => service.register({ ...dto, inviteToken: plaintext }),
      (err: unknown) => {
        assert.ok(err instanceof CodedForbiddenException);
        assert.equal(err.code, REGISTRATION_UNAVAILABLE_CODE);
        assert.doesNotMatch(err.message, /expired|revoked|used|email/i);
        return true;
      },
    );
    assert.equal(createdUsers.length, 0);
  }
});

test("duplicate email in invite mode is generic and does not consume the invite", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const plaintext = generateRegistrationInvitePlaintext();
  const invite = liveInvite({
    tokenHash: hashRegistrationInviteToken(plaintext),
  });
  const { service, inviteById, createdUsers } = createInviteAuth({
    invites: [invite],
    existingEmails: ["beta@example.com"],
  });
  await assert.rejects(
    () => service.register({ ...dto, inviteToken: plaintext }),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      assert.equal(err.code, REGISTRATION_UNAVAILABLE_CODE);
      return true;
    },
  );
  assert.equal(createdUsers.length, 0);
  assert.equal(inviteById.get("inv-1")?.usedAt, null);
});

test("create failure rolls the invite consumption back", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const plaintext = generateRegistrationInvitePlaintext();
  const invite = liveInvite({
    tokenHash: hashRegistrationInviteToken(plaintext),
  });
  const { service, inviteById } = createInviteAuth({
    invites: [invite],
    failCreate: true,
  });
  await assert.rejects(() =>
    service.register({ ...dto, inviteToken: plaintext }),
  );
  assert.equal(inviteById.get("inv-1")?.usedAt, null);
  assert.equal(inviteById.get("inv-1")?.usedByUserId, null);
});

test("a second register with the same token is rejected after a successful claim", async () => {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const plaintext = generateRegistrationInvitePlaintext();
  const invite = liveInvite({
    tokenHash: hashRegistrationInviteToken(plaintext),
  });
  const { service, createdUsers } = createInviteAuth({ invites: [invite] });
  await service.register({ ...dto, inviteToken: plaintext, email: "a@example.com" });
  await assert.rejects(
    () =>
      service.register({ ...dto, inviteToken: plaintext, email: "b@example.com" }),
    (err: unknown) => {
      assert.ok(err instanceof CodedForbiddenException);
      return true;
    },
  );
  assert.equal(createdUsers.length, 1);
});
