/**
 * HTTP + PostgreSQL checks for inbox-read, celebrate, isolation, and
 * historical backfill SQL.
 *
 * NOT run by default. `pnpm --filter @soma/api test` skips this file
 * unless ACHIEVEMENT_PG_HTTP=1 is set in the process environment (not
 * inferred from .env). DATABASE_URL must then be local Postgres.
 *
 * HTTP traffic uses an in-process Nest app (`app.init()`, never `listen`).
 * After boot, the suite PrismaClient and Nest PrismaService must share the
 * same local PostgreSQL identity. A process already bound to port 3000 is
 * never used.
 *
 * Synthetic users are exclusive to this run. Cleanup deletes only those
 * users (cascade UserAchievement) and invites this file created.
 * No seed, truncate, or reset. Do not enable the flag against production.
 */
import "reflect-metadata";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { after, before, describe, test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { createId } from "../auth/create-id.js";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
  registrationInviteTtlMs,
} from "../auth/invite-token.crypto.js";
import { REFRESH_COOKIE_NAME } from "../auth/refresh-cookie.js";
import { ACHIEVEMENT_IDS_MAX_BATCH } from "./dto/achievement-ids.dto.js";

const ORIGIN = "http://localhost:5173";
const PASSWORD_A = "ach-pg-A-9f3k2m";
const PASSWORD_B = "ach-pg-B-4h6w0d";
const RUN_ID = createId();
const flagSkip =
  process.env.ACHIEVEMENT_PG_HTTP !== "1"
    ? "ACHIEVEMENT_PG_HTTP is not 1 (refuses to write Postgres)"
    : false;

type SuperAgent = ReturnType<typeof request>;

interface Session {
  id: string;
  email: string;
  accessToken: string;
}

interface AchievementHttpRow {
  id: string;
  unlocked: boolean;
  unlockedAt: string | null;
  notifiedAt: string | null;
  inboxReadAt: string | null;
  celebratedAt: string | null;
  insertedThisCall: boolean;
}

interface TimestampRow {
  achievementId: string;
  unlockedAt: Date;
  notifiedAt: Date | null;
  inboxReadAt: Date | null;
  celebratedAt: Date | null;
}

interface PgIdentity {
  db: string;
  usr: string;
  port: number | null;
}

let skipReason: string | null = null;
let columnsReady = false;
let app: INestApplication | undefined;
let prisma: PrismaClient | undefined;
const inviteIds: string[] = [];
const createdUserIds: string[] = [];
let sessionA: Session | undefined;
let sessionB: Session | undefined;
let substanceA: string | undefined;
let substanceB: string | undefined;
let foreignUnlockCount = 0;
let unlockedIdsA: string[] = [];
let unlockedIdsB: string[] = [];
let celebrateTargetId: string | undefined;
let inboxTargetA: string | undefined;
let inboxTargetB: string | undefined;

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

function applyIsolatedProcessEnv(): void {
  process.env.AUTH_REGISTRATION_MODE = "invite";
  process.env.AUTH_REGISTER_THROTTLE_LIMIT = "50";
  process.env.AUTH_LOGIN_THROTTLE_LIMIT = "50";
  process.env.AUTH_REFRESH_THROTTLE_LIMIT = "80";
  process.env.CORS_ORIGIN = process.env.CORS_ORIGIN ?? ORIGIN;
  process.env.APP_PUBLIC_URL = process.env.APP_PUBLIC_URL ?? ORIGIN;
}

function cookieValue(res: request.Response, name: string): string | undefined {
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const entry of list) {
    if (entry.startsWith(`${name}=`)) {
      return entry.split(";")[0]!.slice(name.length + 1);
    }
  }
  return undefined;
}

function http(): SuperAgent {
  if (!app) throw new Error("app is not started");
  return request(app.getHttpServer());
}

function auth(session: Session) {
  return { Authorization: `Bearer ${session.accessToken}` };
}

function requireLive(t: { skip: (reason?: string) => void }): boolean {
  if (skipReason) {
    t.skip(skipReason);
    return false;
  }
  return true;
}

function requireHttp(t: { skip: (reason?: string) => void }): boolean {
  if (!requireLive(t)) return false;
  if (!columnsReady) {
    t.skip(
      "UserAchievement inboxReadAt/celebratedAt columns are absent; apply the additive migration before this HTTP suite",
    );
    return false;
  }
  if (!sessionA || !sessionB) {
    t.skip("synthetic users were not created");
    return false;
  }
  return true;
}

async function mintInvite(): Promise<{ id: string; plaintext: string }> {
  if (!prisma) throw new Error("prisma is not connected");
  const plaintext = generateRegistrationInvitePlaintext();
  const id = createId();
  await prisma.registrationInvite.create({
    data: {
      id,
      tokenHash: hashRegistrationInviteToken(plaintext),
      expiresAt: new Date(Date.now() + registrationInviteTtlMs()),
    },
  });
  inviteIds.push(id);
  return { id, plaintext };
}

async function registerUser(input: {
  email: string;
  password: string;
  displayName: string;
  biologicalSex: "male" | "female";
  birthYear: number;
  inviteToken: string;
}): Promise<Session> {
  const res = await http().post("/auth/register").send({
    email: input.email,
    password: input.password,
    displayName: input.displayName,
    biologicalSex: input.biologicalSex,
    birthYear: input.birthYear,
    inviteToken: input.inviteToken,
  });
  const createdId = res.body?.user?.id;
  if (res.status === 201 && typeof createdId === "string" && createdId.length > 0) {
    createdUserIds.push(createdId);
  }
  assert.equal(res.status, 201, "register must succeed with a live invite");
  assert.equal(typeof createdId, "string");
  const refresh = cookieValue(res, REFRESH_COOKIE_NAME);
  assert.ok(refresh, "register must set a refresh cookie");
  assert.equal(typeof res.body.accessToken, "string");
  const session: Session = {
    id: createdId,
    email: res.body.user.email,
    accessToken: res.body.accessToken,
  };
  return session;
}

async function pgIdentity(client: PrismaClient): Promise<PgIdentity> {
  const rows = await client.$queryRaw<PgIdentity[]>`
    SELECT current_database() AS db, current_user AS usr, inet_server_port() AS port
  `;
  const row = rows[0];
  if (!row) throw new Error("PostgreSQL identity query returned no row");
  return row;
}

async function getAchievements(session: Session): Promise<AchievementHttpRow[]> {
  const res = await http().get("/me/achievements").set(auth(session));
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  return res.body as AchievementHttpRow[];
}

function unlocked(rows: AchievementHttpRow[]): AchievementHttpRow[] {
  return rows.filter((row) => row.unlocked);
}

async function putAbstinentUsage(
  session: Session,
  substanceId: string,
): Promise<void> {
  const res = await http()
    .put("/me/profile")
    .set(auth(session))
    .send({
      usages: [
        {
          substanceId,
          yearStarted: 2018,
          frequency: "daily",
          status: "abstinent",
          lastUseDate: "2025-01-01",
        },
      ],
    });
  assert.equal(res.status, 200);
}

async function timestamps(
  userId: string,
  achievementId?: string,
): Promise<TimestampRow[]> {
  if (!prisma) throw new Error("prisma is not connected");
  if (achievementId) {
    return prisma.$queryRaw<TimestampRow[]>`
      SELECT "achievementId", "unlockedAt", "notifiedAt", "inboxReadAt", "celebratedAt"
      FROM "UserAchievement"
      WHERE "userId" = ${userId} AND "achievementId" = ${achievementId}
    `;
  }
  return prisma.$queryRaw<TimestampRow[]>`
    SELECT "achievementId", "unlockedAt", "notifiedAt", "inboxReadAt", "celebratedAt"
    FROM "UserAchievement"
    WHERE "userId" = ${userId}
    ORDER BY "achievementId"
  `;
}

async function countForeignUnlocks(): Promise<number> {
  if (!prisma) throw new Error("prisma is not connected");
  if (createdUserIds.length === 0) {
    const result = await prisma.userAchievement.count();
    return result;
  }
  return prisma.userAchievement.count({
    where: { userId: { notIn: createdUserIds } },
  });
}

async function assertForeignUnlocksUnchanged(label: string): Promise<void> {
  const current = await countForeignUnlocks();
  assert.equal(
    current,
    foreignUnlockCount,
    `${label}: UserAchievement rows of other users must stay unchanged`,
  );
}

describe("inbox-read and celebrate PostgreSQL HTTP", {
  skip: flagSkip,
  concurrency: false,
}, () => {
  before(async () => {
    loadLocalEnvFile();
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      skipReason = "DATABASE_URL is unset";
      return;
    }
    if (!isLocalPostgresUrl(databaseUrl)) {
      skipReason = "DATABASE_URL is not local development PostgreSQL";
      return;
    }
    if (!process.env.JWT_SECRET) {
      skipReason = "JWT_SECRET is unset";
      return;
    }

    applyIsolatedProcessEnv();

    const verifiedDatabaseUrl = databaseUrl;
    prisma = new PrismaClient({
      datasources: { db: { url: verifiedDatabaseUrl } },
    });
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      await prisma.$disconnect().catch(() => undefined);
      prisma = undefined;
      skipReason = "DATABASE_URL unreachable";
      return;
    }

    try {
      await prisma.$queryRaw`SELECT "inboxReadAt", "celebratedAt" FROM "UserAchievement" LIMIT 0`;
      columnsReady = true;
    } catch {
      columnsReady = false;
    }

    if (!columnsReady) {
      return;
    }

    const distApp = join(
      dirname(fileURLToPath(import.meta.url)),
      "../../dist/app.module.js",
    );
    if (!existsSync(distApp)) {
      skipReason = "API dist is missing; compile with tsc -b before this suite";
      return;
    }

    try {
      const [{ AppModule }, prismaModule] = await Promise.all([
        import("../../dist/app.module.js") as Promise<{
          AppModule: new (...args: never[]) => unknown;
        }>,
        import("../../dist/prisma/prisma.service.js") as Promise<{
          PrismaService: new (...args: never[]) => PrismaClient;
        }>,
      ]);
      const moduleRef = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleRef.createNestApplication();
      app.use(cookieParser());
      app.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
      );
      await app.init();

      const server = app.getHttpServer() as { listening?: boolean };
      assert.equal(
        server.listening,
        false,
        "suite HTTP server must stay in-process and must not listen on PORT 3000",
      );
      assert.equal(process.env.DATABASE_URL, verifiedDatabaseUrl);
      if (!isLocalPostgresUrl(process.env.DATABASE_URL ?? "")) {
        skipReason = "Nest boot changed DATABASE_URL away from local PostgreSQL";
        return;
      }

      const nestPrisma = app.get(prismaModule.PrismaService);
      const suiteIdentity = await pgIdentity(prisma);
      const nestIdentity = await pgIdentity(nestPrisma);
      assert.deepEqual(
        nestIdentity,
        suiteIdentity,
        "Nest PrismaService must use the same local PostgreSQL as the suite client",
      );

      const catalog = await http().get("/substances");
      assert.equal(catalog.status, 200);
      const substances = catalog.body as Array<{ id: string }>;
      const catalogIds = substances.map((row) => row.id);
      substanceA = catalogIds.includes("nicotine") ? "nicotine" : catalogIds[0];
      substanceB = catalogIds.includes("cannabis")
        ? "cannabis"
        : catalogIds.find((id) => id !== substanceA);
      if (!substanceA || !substanceB) {
        skipReason = "catalog must contain at least two substances";
        return;
      }

      const inviteA = await mintInvite();
      const inviteB = await mintInvite();

      sessionA = await registerUser({
        email: `ach-pg-a-${RUN_ID}@example.test`,
        password: PASSWORD_A,
        displayName: `AchPgA ${RUN_ID.slice(0, 8)}`,
        biologicalSex: "female",
        birthYear: 1988,
        inviteToken: inviteA.plaintext,
      });
      sessionB = await registerUser({
        email: `ach-pg-b-${RUN_ID}@example.test`,
        password: PASSWORD_B,
        displayName: `AchPgB ${RUN_ID.slice(0, 8)}`,
        biologicalSex: "male",
        birthYear: 1992,
        inviteToken: inviteB.plaintext,
      });

      foreignUnlockCount = await countForeignUnlocks();

      await putAbstinentUsage(sessionA, substanceA);
      await putAbstinentUsage(sessionB, substanceB);
    } catch (err) {
      skipReason =
        err instanceof Error
          ? `achievement pg setup failed: ${err.message}`
          : "achievement pg setup failed";
    }
  });

  after(async () => {
    const leftovers: string[] = [];
    const ownUserIds = [...new Set(createdUserIds.filter((id) => id.length > 0))];
    const ownInviteIds = [...new Set(inviteIds.filter((id) => id.length > 0))];
    if (prisma) {
      for (const id of ownUserIds) {
        try {
          await prisma.user.delete({ where: { id } });
        } catch {
          const stillThere = await prisma.user.findUnique({ where: { id } });
          if (stillThere) leftovers.push(`user:${id}`);
        }
      }
      if (ownInviteIds.length > 0) {
        try {
          await prisma.registrationInvite.deleteMany({
            where: { id: { in: ownInviteIds } },
          });
        } catch {
          leftovers.push(`invites:${ownInviteIds.join(",")}`);
        }
      }
      await prisma.$disconnect().catch(() => undefined);
    }
    if (app) {
      await app.close().catch(() => undefined);
    }
    if (leftovers.length > 0) {
      throw new Error(
        `Achievement PG suite cleanup incomplete. Manual recovery ids: ${leftovers.join("; ")}`,
      );
    }
  });

  test("historical notifiedAt backfill SQL fills only already-notified rows", async (t) => {
    if (!requireLive(t) || !prisma) return;

    const notifiedAt = new Date("2026-02-01T12:00:00.000Z");
    const unlockedNotified = new Date("2026-01-01T00:00:00.000Z");
    const unlockedSilent = new Date("2026-01-02T00:00:00.000Z");

    const rows = await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(`
        CREATE TEMP TABLE "ua_backfill_probe" (
          "id" TEXT PRIMARY KEY,
          "unlockedAt" TIMESTAMP(3) NOT NULL,
          "notifiedAt" TIMESTAMP(3),
          "inboxReadAt" TIMESTAMP(3),
          "celebratedAt" TIMESTAMP(3)
        ) ON COMMIT DROP
      `);
      await tx.$executeRaw`
        INSERT INTO "ua_backfill_probe" ("id", "unlockedAt", "notifiedAt", "inboxReadAt", "celebratedAt")
        VALUES
          ('hist-notified', ${unlockedNotified}, ${notifiedAt}, NULL, NULL),
          ('hist-silent', ${unlockedSilent}, NULL, NULL, NULL)
      `;
      await tx.$executeRawUnsafe(`
        UPDATE "ua_backfill_probe"
        SET
            "inboxReadAt" = "notifiedAt",
            "celebratedAt" = "notifiedAt"
        WHERE "notifiedAt" IS NOT NULL
      `);
      return tx.$queryRaw<
        Array<{
          id: string;
          unlockedAt: Date;
          notifiedAt: Date | null;
          inboxReadAt: Date | null;
          celebratedAt: Date | null;
        }>
      >`
        SELECT "id", "unlockedAt", "notifiedAt", "inboxReadAt", "celebratedAt"
        FROM "ua_backfill_probe"
        ORDER BY "id"
      `;
    });

    const notified = rows.find((row) => row.id === "hist-notified");
    const silent = rows.find((row) => row.id === "hist-silent");
    assert.ok(notified);
    assert.ok(silent);
    assert.equal(notified.unlockedAt.toISOString(), unlockedNotified.toISOString());
    assert.equal(notified.notifiedAt?.toISOString(), notifiedAt.toISOString());
    assert.equal(notified.inboxReadAt?.toISOString(), notifiedAt.toISOString());
    assert.equal(notified.celebratedAt?.toISOString(), notifiedAt.toISOString());
    assert.equal(silent.unlockedAt.toISOString(), unlockedSilent.toISOString());
    assert.equal(silent.notifiedAt, null);
    assert.equal(silent.inboxReadAt, null);
    assert.equal(silent.celebratedAt, null);
  });

  test("post-migration historical rows keep backfill semantics (read-only)", async (t) => {
    if (!requireLive(t) || !prisma) return;
    if (!columnsReady) {
      t.skip(
        "UserAchievement inboxReadAt/celebratedAt columns are absent; apply the additive migration first",
      );
      return;
    }

    const columns = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string; is_nullable: string }>
    >`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'UserAchievement'
        AND column_name IN ('inboxReadAt', 'celebratedAt')
      ORDER BY column_name
    `;
    assert.deepEqual(
      columns.map((row) => row.column_name),
      ["celebratedAt", "inboxReadAt"],
    );
    for (const column of columns) {
      assert.equal(column.data_type, "timestamp without time zone");
      assert.equal(column.is_nullable, "YES");
    }

    const migration = await prisma.$queryRaw<Array<{ finished_at: Date | null }>>`
      SELECT "finished_at"
      FROM "_prisma_migrations"
      WHERE "migration_name" = '20261025194500_user_achievement_inbox_celebrate'
        AND "rolled_back_at" IS NULL
      LIMIT 1
    `;
    const finishedAt = migration[0]?.finished_at;
    if (!finishedAt) {
      t.skip("migration row is not recorded yet");
      return;
    }

    const summary = await prisma.$queryRaw<
      Array<{
        notified_missing_claim: number;
        silent_with_new_timestamps: number;
      }>
    >`
      SELECT
        COUNT(*) FILTER (
          WHERE "createdAt" < ${finishedAt}
            AND "notifiedAt" IS NOT NULL
            AND ("inboxReadAt" IS NULL OR "celebratedAt" IS NULL)
        )::int AS notified_missing_claim,
        COUNT(*) FILTER (
          WHERE "createdAt" < ${finishedAt}
            AND "notifiedAt" IS NULL
            AND ("inboxReadAt" IS NOT NULL OR "celebratedAt" IS NOT NULL)
        )::int AS silent_with_new_timestamps
      FROM "UserAchievement"
    `;
    const row = summary[0];
    assert.equal(Number(row?.notified_missing_claim), 0);
    assert.equal(Number(row?.silent_with_new_timestamps), 0);
  });

  test("GET unlocks new rows and marks only RETURNING ids as insertedThisCall", async (t) => {
    if (!requireHttp(t) || !sessionA) return;

    const first = await getAchievements(sessionA);
    const newly = first.filter((row) => row.insertedThisCall);
    const unlockedRows = unlocked(first);
    assert.ok(unlockedRows.length >= 2, "A must unlock at least two achievements");
    assert.ok(newly.length >= 2, "first GET must insert new UserAchievement rows");
    for (const row of newly) {
      assert.equal(row.unlocked, true);
    }
    assert.equal(
      newly.length,
      unlockedRows.length,
      "first GET for a new user should insert every unlocked row",
    );

    unlockedIdsA = unlockedRows.map((row) => row.id).sort();
    celebrateTargetId = unlockedIdsA[0];
    inboxTargetA = unlockedIdsA[1] ?? unlockedIdsA[0];
    await assertForeignUnlocksUnchanged("after A first GET");
  });

  test("second GET does not insert again", async (t) => {
    if (!requireHttp(t) || !sessionA || !sessionB) return;

    const second = await getAchievements(sessionA);
    assert.equal(
      second.filter((row) => row.insertedThisCall).length,
      0,
    );
    assert.deepEqual(
      unlocked(second).map((row) => row.id).sort(),
      unlockedIdsA,
    );

    const firstB = await getAchievements(sessionB);
    const unlockedB = unlocked(firstB);
    assert.ok(unlockedB.length >= 1, "B must unlock at least one achievement");
    unlockedIdsB = unlockedB.map((row) => row.id).sort();
    inboxTargetB = unlockedIdsB[0];
    assert.notEqual(substanceA, substanceB);
    await assertForeignUnlocksUnchanged("after second GET");
  });

  test("GET and POST without JWT are rejected", async (t) => {
    if (!requireHttp(t)) return;
    const getRes = await http().get("/me/achievements");
    const inboxRes = await http()
      .post("/me/achievements/inbox-read")
      .send({ achievementIds: ["x"] });
    const celebrateRes = await http()
      .post("/me/achievements/celebrate")
      .send({ achievementIds: ["x"] });
    assert.equal(getRes.status, 401);
    assert.equal(inboxRes.status, 401);
    assert.equal(celebrateRes.status, 401);
  });

  test("achievement id payloads are validated", async (t) => {
    if (!requireHttp(t) || !sessionA) return;
    const forged = await http()
      .post("/me/achievements/celebrate")
      .set(auth(sessionA))
      .send({ achievementIds: ["own"], userId: sessionA.id });
    const emptyId = await http()
      .post("/me/achievements/inbox-read")
      .set(auth(sessionA))
      .send({ achievementIds: [""] });
    const oversized = await http()
      .post("/me/achievements/celebrate")
      .set(auth(sessionA))
      .send({
        achievementIds: Array.from(
          { length: ACHIEVEMENT_IDS_MAX_BATCH + 1 },
          (_, i) => `id-${i}`,
        ),
      });
    assert.equal(forged.status, 400);
    assert.equal(emptyId.status, 400);
    assert.equal(oversized.status, 400);
  });

  test("two concurrent celebrate POSTs cannot both win the same id", async (t) => {
    if (!requireHttp(t) || !sessionA || !celebrateTargetId) return;

    const before = await timestamps(sessionA.id, celebrateTargetId);
    assert.equal(before.length, 1);
    assert.equal(before[0]?.celebratedAt, null);
    assert.equal(before[0]?.notifiedAt, null);
    assert.equal(before[0]?.inboxReadAt, null);
    const unlockedAtIso = before[0]!.unlockedAt.toISOString();

    const [r1, r2] = await Promise.all([
      http()
        .post("/me/achievements/celebrate")
        .set(auth(sessionA))
        .send({ achievementIds: [celebrateTargetId] }),
      http()
        .post("/me/achievements/celebrate")
        .set(auth(sessionA))
        .send({ achievementIds: [celebrateTargetId] }),
    ]);
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    const won = [
      ...(r1.body.celebratedIds as string[]),
      ...(r2.body.celebratedIds as string[]),
    ];
    assert.deepEqual(won, [celebrateTargetId]);

    const after = await timestamps(sessionA.id, celebrateTargetId);
    assert.equal(after.length, 1);
    assert.ok(after[0]?.celebratedAt);
    assert.equal(after[0]?.notifiedAt, null);
    assert.equal(after[0]?.inboxReadAt, null);
    assert.equal(after[0]?.unlockedAt.toISOString(), unlockedAtIso);
  });

  test("celebrate is idempotent and does not write notifiedAt or inboxReadAt", async (t) => {
    if (!requireHttp(t) || !sessionA || !celebrateTargetId) return;
    const before = await timestamps(sessionA.id, celebrateTargetId);
    assert.ok(before[0]?.celebratedAt);
    const celebratedIso = before[0]!.celebratedAt!.toISOString();

    const res = await http()
      .post("/me/achievements/celebrate")
      .set(auth(sessionA))
      .send({ achievementIds: [celebrateTargetId] });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.celebratedIds, []);

    const after = await timestamps(sessionA.id, celebrateTargetId);
    assert.equal(after[0]?.celebratedAt?.toISOString(), celebratedIso);
    assert.equal(after[0]?.notifiedAt, null);
    assert.equal(after[0]?.inboxReadAt, null);
  });

  test("inbox-read of user A cannot set inboxReadAt on user B", async (t) => {
    if (
      !requireHttp(t) ||
      !sessionA ||
      !sessionB ||
      !inboxTargetA ||
      !inboxTargetB
    ) {
      return;
    }

    const stealInbox = await http()
      .post("/me/achievements/inbox-read")
      .set(auth(sessionA))
      .send({ achievementIds: [inboxTargetB] });
    const stealCelebrate = await http()
      .post("/me/achievements/celebrate")
      .set(auth(sessionA))
      .send({ achievementIds: [inboxTargetB] });
    assert.equal(stealInbox.status, 200);
    assert.equal(stealCelebrate.status, 200);
    assert.deepEqual(stealInbox.body.readIds, []);
    assert.equal(stealInbox.body.updated, 0);
    assert.deepEqual(stealCelebrate.body.celebratedIds, []);

    const bRows = await timestamps(sessionB.id, inboxTargetB);
    assert.equal(bRows.length, 1);
    assert.equal(bRows[0]?.inboxReadAt, null);
    assert.equal(bRows[0]?.celebratedAt, null);

    const own = await http()
      .post("/me/achievements/inbox-read")
      .set(auth(sessionA))
      .send({ achievementIds: [inboxTargetA] });
    assert.equal(own.status, 200);
    assert.deepEqual(own.body.readIds, [inboxTargetA]);
  });

  test("inbox-read is idempotent", async (t) => {
    if (!requireHttp(t) || !sessionA || !inboxTargetA) return;
    const before = await timestamps(sessionA.id, inboxTargetA);
    assert.ok(before[0]?.inboxReadAt);
    const readIso = before[0]!.inboxReadAt!.toISOString();
    const celebratedIso = before[0]?.celebratedAt?.toISOString() ?? null;
    const notifiedIso = before[0]?.notifiedAt?.toISOString() ?? null;

    const res = await http()
      .post("/me/achievements/inbox-read")
      .set(auth(sessionA))
      .send({ achievementIds: [inboxTargetA] });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.readIds, []);
    assert.equal(res.body.updated, 0);

    const after = await timestamps(sessionA.id, inboxTargetA);
    assert.equal(after[0]?.inboxReadAt?.toISOString(), readIso);
    assert.equal(after[0]?.celebratedAt?.toISOString() ?? null, celebratedIso);
    assert.equal(after[0]?.notifiedAt?.toISOString() ?? null, notifiedIso);
  });

  test("existing unlocks are preserved for A, B, and other users", async (t) => {
    if (!requireHttp(t) || !sessionA || !sessionB) return;
    const laterA = await getAchievements(sessionA);
    const laterB = await getAchievements(sessionB);
    assert.deepEqual(
      unlocked(laterA).map((row) => row.id).sort(),
      unlockedIdsA,
    );
    assert.deepEqual(
      unlocked(laterB).map((row) => row.id).sort(),
      unlockedIdsB,
    );
    assert.equal(
      laterA.filter((row) => row.insertedThisCall).length,
      0,
    );
    await assertForeignUnlocksUnchanged("after celebrate and inbox-read");
  });
});
