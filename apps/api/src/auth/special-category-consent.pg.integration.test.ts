/**
 * Live PostgreSQL: special-category consent withdrawal.
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
  SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
  currentRegistrationAcceptanceFields,
} from "@soma/shared-types";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProfileService } from "../profile/profile.service.js";
import { JournalService } from "../journal/journal.service.js";
import { ProgressService } from "../progress/progress.service.js";
import { AuthService } from "./auth.service.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import { AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE } from "./special-category-consent.js";
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

test("pg: withdraw consent purges sensitive data, keeps account, blocks writes, is idempotent", async (t) => {
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

  const password = "password123";
  let userId = "";

  try {
    const result = await service.register({
      email: `withdraw-${Date.now()}@example.test`,
      password,
      displayName: "Withdraw",
      biologicalSex: "female",
      birthYear: 1992,
      ...currentRegistrationAcceptanceFields(),
    });
    userId = result.user.id;
    const sessionBefore = result.refresh.plaintext;

    const substance = await prisma.substance.findFirst();
    if (substance) {
      await prisma.substanceUsage.create({
        data: {
          userId,
          substanceId: substance.id,
          yearStarted: 2020,
          frequency: "daily",
        },
      });
    }
    await prisma.journalEntry.create({
      data: {
        userId,
        occurredOn: new Date("2026-10-01"),
        mood: 4,
        wellbeingRating: 5,
        body: "sensitive note",
      },
    });
    await prisma.journalPersonalMilestone.create({
      data: {
        userId,
        kind: "sleep",
        occurredOn: new Date("2026-10-02"),
      },
    });
    const achievement = await prisma.achievement.findFirst();
    if (achievement) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          unlockedAt: new Date(),
        },
      });
    }
    await prisma.feedbackReport.create({
      data: {
        userId,
        category: "general",
        title: "note",
        body: "mentions use",
        fingerprint: "a".repeat(64),
      },
    });
    await prisma.missionCompletion.create({
      data: {
        userId,
        missionId: "gaba-intro",
        contentVersion: 1,
      },
    });
    await prisma.userProgression.create({
      data: { userId, totalXp: 24, equippedTitleId: null },
    });
    await prisma.xpGrant.createMany({
      data: [
        {
          userId,
          source: "journal_create_day",
          sourceKey: "2026-10-01",
          amount: 12,
        },
        {
          userId,
          source: "mission_complete",
          sourceKey: "gaba-intro",
          amount: 12,
        },
      ],
    });

    await assert.rejects(
      () => service.withdrawSpecialCategoryConsent(userId, "wrong-pass"),
      UnauthorizedException,
    );

    await service.withdrawSpecialCategoryConsent(userId, password);
    await service.withdrawSpecialCategoryConsent(userId, password);

    const acceptances = await prisma.registrationAcceptance.findMany({
      where: { userId },
    });
    assert.equal(acceptances.length, 4);
    assert.ok(
      acceptances.some(
        (row) => row.purpose === SPECIAL_CATEGORY_WITHDRAWAL_PURPOSE,
      ),
    );
    assert.equal(await prisma.user.count({ where: { id: userId } }), 1);
    assert.equal(
      await prisma.substanceUsage.count({ where: { userId } }),
      0,
    );
    assert.equal(await prisma.journalEntry.count({ where: { userId } }), 0);
    assert.equal(
      await prisma.journalPersonalMilestone.count({ where: { userId } }),
      0,
    );
    assert.equal(
      await prisma.userAchievement.count({ where: { userId } }),
      0,
    );
    assert.equal(
      await prisma.feedbackReport.count({ where: { userId } }),
      0,
    );
    assert.equal(
      await prisma.missionCompletion.count({ where: { userId } }),
      1,
    );
    const xp = await prisma.xpGrant.findMany({ where: { userId } });
    assert.deepEqual(
      xp.map((row) => row.source).sort(),
      ["mission_complete"],
    );
    const progression = await prisma.userProgression.findUnique({
      where: { userId },
    });
    assert.equal(progression?.totalXp, 12n);
    const loaded = await profile.getProfile(userId);
    assert.equal(loaded.specialCategoryConsentWithdrawn, true);
    assert.equal(loaded.onboardingStatus, "skipped");

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

    await assert.rejects(
      () =>
        journal.create(userId, {
          occurredOn: "2026-10-03",
          mood: 3,
        }),
      (err: unknown) => {
        assert.ok(err instanceof CodedForbiddenException);
        assert.equal(err.code, AUTH_SPECIAL_CATEGORY_WITHDRAWN_CODE);
        return true;
      },
    );

    const rotated = await refresh.rotateSession(sessionBefore);
    assert.equal(rotated.userId, userId);

    await service.deleteOwnAccount(userId, password);
    assert.equal(await prisma.user.count({ where: { id: userId } }), 0);
    assert.equal(
      await prisma.registrationAcceptance.count({ where: { userId } }),
      0,
    );
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
