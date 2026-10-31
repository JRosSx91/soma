/**
 * Live PostgreSQL: special-category consent grant, withdrawal, history.
 * Skips when DATABASE_URL is unset or not local.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import {
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  currentRegistrationAcceptanceFields,
  currentSpecialCategoryGrantFields,
} from "@soma/shared-types";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProfileService } from "../profile/profile.service.js";
import { JournalService } from "../journal/journal.service.js";
import { ProgressService } from "../progress/progress.service.js";
import { AchievementsService } from "../achievements/achievements.service.js";
import { AuthService } from "./auth.service.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import {
  AUTH_SPECIAL_CATEGORY_REQUIRED_CODE,
  AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE,
} from "./special-category-consent.js";
import { CodedForbiddenException } from "../common/exceptions/coded-exception.js";

function loadLocalEnvFile(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(process.cwd(), ".env"), join(here, "../../.env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

function isLocalPostgresUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return false;
  }
  const host = url.hostname.toLowerCase();
  const allowed = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "host.docker.internal",
  ]);
  if (!allowed.has(host)) return false;
  const blocked =
    /prod|staging|amazonaws|neon\.tech|supabase|railway|render\.com|heroku|fly\.io/;
  return !blocked.test(raw.toLowerCase());
}

test("pg: contextual consent, history, isolation, and derived unlocks", async (t) => {
  loadLocalEnvFile();
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) {
    t.skip("DATABASE_URL is unset");
    return;
  }
  if (!isLocalPostgresUrl(databaseUrl)) {
    t.skip("DATABASE_URL is not a local development database");
    return;
  }

  const prisma = new PrismaClient();
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "purpose" FROM "RegistrationAcceptance" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
    t.skip("RegistrationAcceptance table is not available");
    return;
  }

  const prismaAsService = prisma as unknown as PrismaService;
  const users = new UsersService(prismaAsService);
  const refresh = new RefreshSessionService(prismaAsService);
  const jwt = {
    sign: (payload: unknown) => `pg-token:${JSON.stringify(payload)}`,
  };
  const service = new AuthService(
    users,
    jwt as unknown as JwtService,
    refresh,
    prismaAsService,
    new RegistrationInviteService(),
  );
  const profile = new ProfileService(prismaAsService);
  const progress = new ProgressService(prismaAsService);
  const journal = new JournalService(prismaAsService, progress);
  const achievements = new AchievementsService(prismaAsService);

  const password = "password123";
  let userId = "";
  let peerId = "";

  try {
    const result = await service.register({
      email: `consent-${Date.now()}@example.test`,
      password,
      displayName: "Consent",
      biologicalSex: "female",
      birthYear: 1992,
      ...currentRegistrationAcceptanceFields(),
    });
    userId = result.user.id;
    const sessionBefore = result.refresh.plaintext;

    const atRegister = await prisma.registrationAcceptance.findMany({
      where: { userId },
    });
    assert.equal(atRegister.length, 2);
    assert.equal(
      atRegister.some((row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE),
      false,
    );

    const loaded = await profile.getProfile(userId);
    assert.equal(loaded.specialCategoryConsentActive, false);
    assert.equal(loaded.specialCategoryConsentWithdrawn, false);

    const substance = await prisma.substance.findFirst();
    if (substance) {
      await assert.rejects(
        () =>
          profile.upsertProfile(userId, {
            usages: [
              {
                substanceId: substance.id,
                yearStarted: 2021,
                frequency: "daily",
                status: "abstinent",
                lastUseDate: "2026-01-01",
              },
            ],
          }),
        (err: unknown) => {
          assert.ok(err instanceof CodedForbiddenException);
          assert.equal(err.code, AUTH_SPECIAL_CATEGORY_REQUIRED_CODE);
          return true;
        },
      );
    }

    await assert.rejects(
      () =>
        journal.create(userId, {
          occurredOn: "2026-10-03",
          mood: 3,
        }),
      (err: unknown) => {
        assert.ok(err instanceof CodedForbiddenException);
        assert.equal(err.code, AUTH_SPECIAL_CATEGORY_REQUIRED_CODE);
        return true;
      },
    );

    const unlocksWithoutGrant = await achievements.detectAndPersistUnlocks(userId);
    assert.deepEqual(unlocksWithoutGrant, []);

    const peer = await service.register({
      email: `consent-peer-${Date.now()}@example.test`,
      password,
      displayName: "Peer",
      biologicalSex: "male",
      birthYear: 1990,
      ...currentRegistrationAcceptanceFields(),
    });
    peerId = peer.user.id;
    await service.grantSpecialCategoryConsent(
      peerId,
      currentSpecialCategoryGrantFields(),
    );
    const peerRows = await prisma.registrationAcceptance.findMany({
      where: { userId: peerId, purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE },
    });
    assert.equal(peerRows.length, 1);

    await service.grantSpecialCategoryConsent(
      userId,
      currentSpecialCategoryGrantFields(),
    );
    await service.grantSpecialCategoryConsent(
      userId,
      currentSpecialCategoryGrantFields(),
    );
    const afterGrant = await prisma.registrationAcceptance.findMany({
      where: { userId },
    });
    assert.equal(
      afterGrant.filter((row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE)
        .length,
      1,
    );
    const afterGrantProfile = await profile.getProfile(userId);
    assert.equal(afterGrantProfile.specialCategoryConsentActive, true);

    if (substance) {
      await profile.upsertProfile(userId, {
        usages: [
          {
            substanceId: substance.id,
            yearStarted: 2020,
            frequency: "daily",
            status: "abstinent",
            lastUseDate: "2026-01-01",
          },
        ],
      });
    }
    await journal.create(userId, {
      occurredOn: "2026-10-01",
      mood: 4,
    });

    const listed = await journal.list(userId, {});
    assert.ok(listed.items.length >= 1);

    await assert.rejects(
      () => service.withdrawSpecialCategoryConsent(userId, "wrong-pass"),
      UnauthorizedException,
    );

    await service.withdrawSpecialCategoryConsent(userId, password);
    await service.withdrawSpecialCategoryConsent(userId, password);

    const afterWithdraw = await prisma.registrationAcceptance.findMany({
      where: { userId },
      orderBy: { acceptedAt: "asc" },
    });
    assert.equal(
      afterWithdraw.filter((row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE)
        .length,
      1,
    );
    assert.equal(
      afterWithdraw.filter(
        (row) => row.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      ).length,
      1,
    );
    const firstGrantAt = afterWithdraw.find(
      (row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE,
    )?.acceptedAt;
    assert.ok(firstGrantAt);

    assert.equal(await prisma.user.count({ where: { id: userId } }), 1);
    assert.equal(await prisma.substanceUsage.count({ where: { userId } }), 0);
    assert.equal(await prisma.journalEntry.count({ where: { userId } }), 0);

    const withdrawnProfile = await profile.getProfile(userId);
    assert.equal(withdrawnProfile.specialCategoryConsentWithdrawn, true);
    assert.equal(withdrawnProfile.onboardingStatus, "skipped");

    if (substance) {
      await assert.rejects(
        () =>
          profile.upsertProfile(userId, {
            usages: [
              {
                substanceId: substance.id,
                yearStarted: 2021,
                frequency: "daily",
                status: "abstinent",
                lastUseDate: "2026-01-01",
              },
            ],
          }),
        (err: unknown) => {
          assert.ok(err instanceof CodedForbiddenException);
          assert.equal(err.code, AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE);
          return true;
        },
      );
    }

    await prisma.journalEntry.deleteMany({ where: { userId } });

    await service.grantSpecialCategoryConsent(
      userId,
      currentSpecialCategoryGrantFields(),
    );
    const afterReconsent = await prisma.registrationAcceptance.findMany({
      where: { userId },
      orderBy: { acceptedAt: "asc" },
    });
    assert.equal(
      afterReconsent.filter(
        (row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE,
      ).length,
      2,
    );
    assert.equal(
      afterReconsent.filter(
        (row) => row.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      ).length,
      1,
    );
    assert.equal(
      afterReconsent.find((row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE)
        ?.acceptedAt.toISOString(),
      firstGrantAt.toISOString(),
    );
    const reconsentProfile = await profile.getProfile(userId);
    assert.equal(reconsentProfile.specialCategoryConsentActive, true);
    assert.equal(reconsentProfile.specialCategoryConsentWithdrawn, false);

    const peerStill = await prisma.registrationAcceptance.findMany({
      where: { userId: peerId, purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE },
    });
    assert.equal(peerStill.length, 1);

    const rotated = await refresh.rotateSession(sessionBefore);
    assert.equal(rotated.userId, userId);

    await service.deleteOwnAccount(userId, password);
    assert.equal(await prisma.user.count({ where: { id: userId } }), 0);
    assert.equal(
      await prisma.registrationAcceptance.count({ where: { userId } }),
      0,
    );
    userId = "";
    await prisma.user.deleteMany({ where: { id: peerId } });
    peerId = "";
  } finally {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    if (peerId) {
      await prisma.user.deleteMany({ where: { id: peerId } });
    }
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
  }
});

test("pg: concurrent grant/withdraw and journal write vs purge", async (t) => {
  loadLocalEnvFile();
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) {
    t.skip("DATABASE_URL is unset");
    return;
  }
  if (!isLocalPostgresUrl(databaseUrl)) {
    t.skip("DATABASE_URL is not a local development database");
    return;
  }

  const prisma = new PrismaClient();
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "purpose" FROM "RegistrationAcceptance" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
    t.skip("RegistrationAcceptance table is not available");
    return;
  }

  const prismaAsService = prisma as unknown as PrismaService;
  const users = new UsersService(prismaAsService);
  const refresh = new RefreshSessionService(prismaAsService);
  const jwt = {
    sign: (payload: unknown) => `pg-token:${JSON.stringify(payload)}`,
  };
  const service = new AuthService(
    users,
    jwt as unknown as JwtService,
    refresh,
    prismaAsService,
    new RegistrationInviteService(),
  );
  const progress = new ProgressService(prismaAsService);
  const journal = new JournalService(prismaAsService, progress);
  const password = "password123";
  let userId = "";

  try {
    const result = await service.register({
      email: `consent-race-${Date.now()}@example.test`,
      password,
      displayName: "Race",
      biologicalSex: "male",
      birthYear: 1990,
      ...currentRegistrationAcceptanceFields(),
    });
    userId = result.user.id;

    await Promise.all([
      service.grantSpecialCategoryConsent(
        userId,
        currentSpecialCategoryGrantFields(),
      ),
      service.grantSpecialCategoryConsent(
        userId,
        currentSpecialCategoryGrantFields(),
      ),
    ]);
    assert.equal(
      await prisma.registrationAcceptance.count({
        where: { userId, purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE },
      }),
      1,
    );

    await Promise.allSettled([
      journal.create(userId, { occurredOn: "2026-10-04", mood: 2 }),
      journal.create(userId, { occurredOn: "2026-10-05", mood: 3 }),
      service.withdrawSpecialCategoryConsent(userId, password),
    ]);
    assert.equal(await prisma.journalEntry.count({ where: { userId } }), 0);
    const afterWithdraw = await prisma.registrationAcceptance.findMany({
      where: { userId, purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE },
    });
    assert.equal(afterWithdraw.length, 1);

    await Promise.all([
      service.withdrawSpecialCategoryConsent(userId, password),
      service.withdrawSpecialCategoryConsent(userId, password),
    ]);
    assert.equal(
      await prisma.registrationAcceptance.count({
        where: { userId, purpose: SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE },
      }),
      1,
    );

    await Promise.all([
      service.grantSpecialCategoryConsent(
        userId,
        currentSpecialCategoryGrantFields(),
      ),
      service.withdrawSpecialCategoryConsent(userId, password),
    ]);
    const events = await prisma.registrationAcceptance.findMany({
      where: {
        userId,
        purpose: {
          in: [
            SPECIAL_CATEGORY_PROCESSING_PURPOSE,
            SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
          ],
        },
      },
      orderBy: { acceptedAt: "asc" },
    });
    const last = events[events.length - 1];
    assert.ok(last);
    if (last.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE) {
      assert.equal(await prisma.journalEntry.count({ where: { userId } }), 0);
    }

    await service.deleteOwnAccount(userId, password);
    userId = "";
  } finally {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
  }
});
