/**
 * R-JXP-B: concurrent UserProgression init and XP grants on PostgreSQL.
 * Skips when DATABASE_URL is unset or ledger/journal/mission tables are missing.
 * Deletes only synthetic users created here.
 */
import "reflect-metadata";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import request from "supertest";
import { utcDateToCivilDate } from "@soma/shared-types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { JournalModule } from "../journal/journal.module.js";
import { MissionsService } from "../missions/missions.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProgressService } from "./progress.service.js";

const PASSWORD = "r-jxp-conc-pass-1";
const HTTP_ROUNDS = 12;
const AWARD_ROUNDS = 20;
const DOPAMINE = "edu-dopamine-01";

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

loadLocalEnvFile();

let skipReason: string | null = null;
let app: INestApplication | undefined;
let prisma: PrismaClient | undefined;
let progress: ProgressService | undefined;
let activeUserId: string | null = null;
const createdUserIds: string[] = [];
const progressionSql: string[] = [];

function uniqueViolation(
  meta: Record<string, unknown>,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(
    "Unique constraint failed",
    {
      code: "P2002",
      clientVersion: "5.22.0",
      meta,
    },
  );
}

@Injectable()
class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!activeUserId) {
      throw new UnauthorizedException();
    }
    const req = context.switchToHttp().getRequest<{
      user: { id: string };
    }>();
    req.user = { id: activeUserId };
    return true;
  }
}

async function createUser(label: string): Promise<{ id: string }> {
  if (!prisma) throw new Error("prisma");
  const id = createId();
  await prisma.user.create({
    data: {
      id,
      email: `r-jxp-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "R-JXP",
      biologicalSex: "female",
      birthYear: 1992,
    },
  });
  createdUserIds.push(id);
  return { id };
}

async function wipeUser(userId: string): Promise<void> {
  await prisma?.user.delete({ where: { id: userId } }).catch(() => undefined);
}

function http() {
  if (!app) throw new Error("app");
  return request(app.getHttpServer());
}

before(async () => {
  if (!process.env.DATABASE_URL) {
    skipReason = "DATABASE_URL is unset";
    return;
  }
  prisma = new PrismaClient({
    log: [{ emit: "event", level: "query" }],
  });
  prisma.$on("query", (event) => {
    if (
      event.query.includes("UserProgression") &&
      event.query.includes("ON CONFLICT") &&
      progressionSql.length < 4
    ) {
      progressionSql.push(event.query);
    }
  });
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "occurredOn" FROM "JournalEntry" LIMIT 0`;
    await prisma.$queryRaw`SELECT "sourceKey" FROM "XpGrant" LIMIT 0`;
    await prisma.$queryRaw`SELECT "userId" FROM "UserProgression" LIMIT 0`;
    await prisma.$queryRaw`SELECT "missionId" FROM "MissionCompletion" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or journal/progress/mission migration missing";
    return;
  }

  progress = new ProgressService(prisma);

  const moduleRef = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }]),
      JournalModule,
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(TestJwtGuard)
    .compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
});

after(async () => {
  await app?.close();
  if (prisma) {
    for (const id of createdUserIds) {
      await wipeUser(id);
    }
    await prisma.$disconnect().catch(() => undefined);
  }
});

test("r-jxp-b: ensure UserProgression uses INSERT ON CONFLICT", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("sql");
  await progress!.getMine(user.id);
  const joined = progressionSql.join("\n");
  assert.match(joined, /ON CONFLICT\s*\("userId"\)\s*DO NOTHING/i);
  assert.doesNotMatch(joined, /userProgression\.upsert/i);
});

test("r-jxp-b: concurrent INSERT without ON CONFLICT still hits PK", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("pk");
  const results = await Promise.allSettled([
    prisma!.userProgression.create({
      data: { userId: user.id, totalXp: 0n, equippedTitleId: null },
    }),
    prisma!.userProgression.create({
      data: { userId: user.id, totalXp: 0n, equippedTitleId: null },
    }),
  ]);
  const rejected = results.filter((row) => row.status === "rejected");
  assert.equal(results.filter((row) => row.status === "fulfilled").length, 1);
  assert.equal(rejected.length, 1);
  const reason = (rejected[0] as PromiseRejectedResult).reason;
  assert.ok(reason instanceof Prisma.PrismaClientKnownRequestError);
  assert.equal(reason.code, "P2002");
});

test("r-jxp-b A: concurrent first journal creates persist both entries", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const today = utcDateToCivilDate(new Date());
  for (let round = 0; round < HTTP_ROUNDS; round += 1) {
    const user = await createUser(`http-${round}`);
    activeUserId = user.id;
    const [a, b] = await Promise.all([
      http().post("/me/journal").send({ occurredOn: today, mood: 2 }),
      http().post("/me/journal").send({ occurredOn: today, mood: 3 }),
    ]);
    assert.equal(a.status, 201, JSON.stringify(a.body));
    assert.equal(b.status, 201, JSON.stringify(b.body));
    assert.notEqual(a.body.id, b.body.id);
    const entries = await prisma!.journalEntry.count({ where: { userId: user.id } });
    const grants = await prisma!.xpGrant.count({
      where: { userId: user.id, source: "journal_create_day" },
    });
    const prog = await prisma!.userProgression.findMany({
      where: { userId: user.id },
    });
    assert.equal(entries, 2);
    assert.equal(grants, 1);
    assert.equal(prog.length, 1);
    assert.equal(Number(prog[0]?.totalXp ?? 0n), 12);
    await wipeUser(user.id);
  }
  activeUserId = null;
});

test("r-jxp-b B: concurrent awardXp with distinct keys both grant", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  for (let round = 0; round < AWARD_ROUNDS; round += 1) {
    const user = await createUser(`aw-${round}`);
    const results = await Promise.all([
      progress!.awardXp(user.id, {
        source: "journal_create_day",
        sourceKey: `day-a-${round}`,
      }),
      progress!.awardXp(user.id, {
        source: "journal_create_day",
        sourceKey: `day-b-${round}`,
      }),
    ]);
    assert.deepEqual(
      results.map((row) => row.status).sort(),
      ["awarded", "awarded"],
    );
    const reported = results.map((row) => row.totalXp).sort((a, b) => a - b);
    assert.deepEqual(reported, [12, 24]);
    const grants = await prisma!.xpGrant.findMany({
      where: { userId: user.id },
      select: { source: true, sourceKey: true, amount: true },
    });
    assert.equal(grants.length, 2);
    const prog = await prisma!.userProgression.findUniqueOrThrow({
      where: { userId: user.id },
    });
    assert.equal(Number(prog.totalXp), 24);
    await wipeUser(user.id);
  }
});

test("r-jxp-b C: concurrent awardXp with the same key grants once", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  for (let round = 0; round < AWARD_ROUNDS; round += 1) {
    const user = await createUser(`same-${round}`);
    const key = `same-day-${round}`;
    const results = await Promise.all([
      progress!.awardXp(user.id, {
        source: "journal_create_day",
        sourceKey: key,
      }),
      progress!.awardXp(user.id, {
        source: "journal_create_day",
        sourceKey: key,
      }),
    ]);
    const statuses = results.map((row) => row.status).sort();
    assert.deepEqual(statuses, ["awarded", "duplicate"]);
    assert.ok(results.every((row) => row.totalXp === 12));
    assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 1);
    const prog = await prisma!.userProgression.findUniqueOrThrow({
      where: { userId: user.id },
    });
    assert.equal(Number(prog.totalXp), 12);
    await wipeUser(user.id);
  }
});

test("r-jxp-b D: concurrent getMine, equipTitle, and first awardXp", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  for (let round = 0; round < AWARD_ROUNDS; round += 1) {
    const user = await createUser(`mix-${round}`);
    const [mineA, mineB, equipped, awarded] = await Promise.all([
      progress!.getMine(user.id),
      progress!.getMine(user.id),
      progress!.equipTitle(user.id, "walker"),
      progress!.awardXp(user.id, {
        source: "personal_milestone",
        sourceKey: `kind-${round}`,
      }),
    ]);
    assert.equal(mineA.level, 1);
    assert.equal(mineB.level, 1);
    assert.equal(equipped.equippedTitleId, "walker");
    assert.equal(awarded.status, "awarded");
    assert.equal(awarded.totalXp, 10);
    const after = await progress!.getMine(user.id);
    assert.equal(after.totalXp, 10);
    assert.equal(after.equippedTitleId, "walker");
    assert.equal(
      await prisma!.userProgression.count({ where: { userId: user.id } }),
      1,
    );
    assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 1);
    await wipeUser(user.id);
  }
});

test("r-jxp-b E: UserProgression P2002 is not alreadyCompleted", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("mission-p2002");
  const prismaSvc = prisma as unknown as PrismaService;
  const boom = {
    awardXp: async () => {
      throw uniqueViolation({
        modelName: "UserProgression",
        target: ["userId"],
      });
    },
  } as unknown as ProgressService;
  const missions = new MissionsService(prismaSvc, boom);
  await assert.rejects(
    () =>
      missions.submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      }),
    (err: unknown) =>
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      (err.meta as { modelName?: string } | undefined)?.modelName ===
        "UserProgression",
  );
  assert.equal(
    await prisma!.missionCompletion.count({ where: { userId: user.id } }),
    0,
  );
  assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 0);

  const unlabeled = {
    awardXp: async () => {
      throw uniqueViolation({});
    },
  } as unknown as ProgressService;
  await assert.rejects(
    () =>
      new MissionsService(prismaSvc, unlabeled).submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      }),
    (err: unknown) =>
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002",
  );

  const grantClash = {
    awardXp: async () => {
      throw uniqueViolation({
        modelName: "XpGrant",
        target: ["userId", "source", "sourceKey"],
      });
    },
  } as unknown as ProgressService;
  await assert.rejects(
    () =>
      new MissionsService(prismaSvc, grantClash).submitAnswer(user.id, {
        missionId: DOPAMINE,
        selectedOptionId: "wanting",
      }),
    (err: unknown) =>
      err instanceof Prisma.PrismaClientKnownRequestError &&
      (err.meta as { modelName?: string } | undefined)?.modelName === "XpGrant",
  );
});
