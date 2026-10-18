import assert from "node:assert/strict";
import { test } from "node:test";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OnboardingStatus } from "@prisma/client";
import { ProfileService } from "./profile.service.js";

type UsageRow = {
  id: string;
  userId: string;
  substanceId: string;
  yearStarted: number;
  frequency: "daily";
  lastUseDate: Date | null;
  status: "abstinent";
  createdAt: Date;
  updatedAt: Date;
};

function makeUser(overrides: {
  id?: string;
  onboardingStatus?: OnboardingStatus;
  usages?: UsageRow[];
} = {}) {
  const id = overrides.id ?? "user-1";
  return {
    id,
    email: `${id}@example.test`,
    hashedPassword: "hash",
    displayName: "Test",
    biologicalSex: "male" as const,
    birthYear: 1990,
    weightKg: null,
    onboardingStatus: overrides.onboardingStatus ?? OnboardingStatus.pending,
    createdAt: new Date(),
    updatedAt: new Date(),
    usages: overrides.usages ?? [],
  };
}

function makeUsage(userId: string, substanceId = "nicotine"): UsageRow {
  const now = new Date();
  return {
    id: `usage-${substanceId}`,
    userId,
    substanceId,
    yearStarted: 2020,
    frequency: "daily",
    lastUseDate: new Date("2024-01-01"),
    status: "abstinent",
    createdAt: now,
    updatedAt: now,
  };
}

function createService(store: {
  users: Map<string, ReturnType<typeof makeUser>>;
}) {
  const prisma = {
    user: {
      findUnique: async ({
        where,
        include,
        select,
      }: {
        where: { id: string };
        include?: { usages: boolean };
        select?: { id: boolean; onboardingStatus: boolean };
      }) => {
        const user = store.users.get(where.id);
        if (!user) return null;
        if (select) {
          return { id: user.id, onboardingStatus: user.onboardingStatus };
        }
        if (include?.usages) return user;
        return user;
      },
      update: async ({
        where,
        data,
      }: {
        where: { id: string };
        data: { onboardingStatus: OnboardingStatus };
      }) => {
        const user = store.users.get(where.id);
        if (!user) throw new Error("missing");
        user.onboardingStatus = data.onboardingStatus;
        return user;
      },
    },
    substanceUsage: {
      deleteMany: async ({ where }: { where: { userId: string } }) => {
        const user = store.users.get(where.userId);
        if (user) user.usages = [];
        return { count: 0 };
      },
      createMany: async ({
        data,
      }: {
        data: Array<{
          userId: string;
          substanceId: string;
          yearStarted: number;
          status: "abstinent" | "active";
          lastUseDate: Date | null;
          frequency: "daily";
        }>;
      }) => {
        for (const row of data) {
          const user = store.users.get(row.userId);
          if (!user) continue;
          user.usages.push(
            makeUsage(row.userId, row.substanceId),
          );
        }
        return { count: data.length };
      },
    },
    $transaction: async (fn: (tx: unknown) => Promise<unknown>) => fn(prisma),
  };

  return new ProfileService(prisma as never);
}

test("getProfile returns pending for a new user with empty usages", async () => {
  const user = makeUser();
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.getProfile(user.id);
  assert.equal(profile.onboardingStatus, OnboardingStatus.pending);
  assert.equal(profile.usages.length, 0);
});

test("getProfile returns stored status even when usages are empty (skipped)", async () => {
  const user = makeUser({ onboardingStatus: OnboardingStatus.skipped });
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.getProfile(user.id);
  assert.equal(profile.onboardingStatus, OnboardingStatus.skipped);
  assert.equal(profile.usages.length, 0);
});

test("getProfile status is independent of usages.length", async () => {
  const user = makeUser({
    onboardingStatus: OnboardingStatus.pending,
    usages: [makeUsage("user-1")],
  });
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.getProfile(user.id);
  assert.equal(profile.onboardingStatus, OnboardingStatus.pending);
  assert.equal(profile.usages.length, 1);
});

test("updateOnboardingStatus pending → skipped", async () => {
  const user = makeUser();
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.updateOnboardingStatus(
    user.id,
    OnboardingStatus.skipped,
  );
  assert.equal(profile.onboardingStatus, OnboardingStatus.skipped);
});

test("updateOnboardingStatus pending → completed", async () => {
  const user = makeUser();
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.updateOnboardingStatus(
    user.id,
    OnboardingStatus.completed,
  );
  assert.equal(profile.onboardingStatus, OnboardingStatus.completed);
});

test("updateOnboardingStatus completed → skipped", async () => {
  const user = makeUser({ onboardingStatus: OnboardingStatus.completed });
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.updateOnboardingStatus(
    user.id,
    OnboardingStatus.skipped,
  );
  assert.equal(profile.onboardingStatus, OnboardingStatus.skipped);
});

test("updateOnboardingStatus rejects completed → pending", async () => {
  const user = makeUser({ onboardingStatus: OnboardingStatus.completed });
  const service = createService({ users: new Map([[user.id, user]]) });
  await assert.rejects(
    () =>
      service.updateOnboardingStatus(user.id, OnboardingStatus.pending),
    (err: unknown) => err instanceof BadRequestException,
  );
});

test("updateOnboardingStatus rejects unknown user", async () => {
  const service = createService({ users: new Map() });
  await assert.rejects(
    () =>
      service.updateOnboardingStatus("missing", OnboardingStatus.skipped),
    (err: unknown) => err instanceof NotFoundException,
  );
});

test("upsertProfile does not change onboardingStatus", async () => {
  const user = makeUser({ onboardingStatus: OnboardingStatus.pending });
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.upsertProfile(user.id, {
    usages: [
      {
        substanceId: "nicotine",
        yearStarted: 2020,
        frequency: "daily",
        status: "abstinent",
        lastUseDate: "2024-01-01",
      },
    ],
  });
  assert.equal(profile.onboardingStatus, OnboardingStatus.pending);
  assert.equal(profile.usages.length, 1);
});

test("upsertProfile empty array clears usages but keeps skipped status", async () => {
  const user = makeUser({
    onboardingStatus: OnboardingStatus.skipped,
    usages: [makeUsage("user-1"), makeUsage("user-1", "cannabis")],
  });
  const service = createService({ users: new Map([[user.id, user]]) });
  const profile = await service.upsertProfile(user.id, { usages: [] });
  assert.equal(profile.onboardingStatus, OnboardingStatus.skipped);
  assert.equal(profile.usages.length, 0);
});

test("upsertProfile rejects null/undefined usages without deleting rows", async () => {
  const user = makeUser({
    onboardingStatus: OnboardingStatus.completed,
    usages: [makeUsage("user-1")],
  });
  const service = createService({ users: new Map([[user.id, user]]) });
  await assert.rejects(
    () => service.upsertProfile(user.id, { usages: null as never }),
    (err: unknown) => err instanceof BadRequestException,
  );
  await assert.rejects(
    () => service.upsertProfile(user.id, { usages: undefined as never }),
    (err: unknown) => err instanceof BadRequestException,
  );
  assert.equal(user.usages.length, 1);
  assert.equal(user.onboardingStatus, OnboardingStatus.completed);
});

test("upsertProfile replace preserves other users' usages (isolation)", async () => {
  const a = makeUser({ id: "a", usages: [makeUsage("a")] });
  const b = makeUser({
    id: "b",
    onboardingStatus: OnboardingStatus.completed,
    usages: [makeUsage("b"), makeUsage("b", "cannabis")],
  });
  const service = createService({
    users: new Map([
      [a.id, a],
      [b.id, b],
    ]),
  });
  await service.upsertProfile(a.id, { usages: [] });
  assert.equal(a.usages.length, 0);
  assert.equal(b.usages.length, 2);
  assert.equal(b.onboardingStatus, OnboardingStatus.completed);
});
