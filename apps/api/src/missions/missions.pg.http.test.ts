/**
 * HTTP + PostgreSQL missions API (GAM-02D). JwtAuthGuard is replaced with a
 * test guard that injects a real user row; MissionsService and Prisma are not
 * mocked for catalog, isolation, uniqueness, or XP.
 *
 * Skips when DATABASE_URL is unset, unreachable, or MissionCompletion is missing.
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
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import request from "supertest";
import { PROGRESS_XP_MAX, listPublishedMissions } from "@soma/shared-types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { ProgressService } from "../progress/progress.service.js";
import { MissionsModule } from "./missions.module.js";

const PASSWORD = "missions-http-pass-1";
const DOPAMINE = "edu-dopamine-01";
const GABA = "edu-gaba-01";
const SEROTONIN = "edu-serotonin-01";
const RECEPTORS = "edu-receptors-01";
const TOLERANCE = "edu-tolerance-01";

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
let userA: { id: string } | undefined;
let userB: { id: string } | undefined;
let activeUserId: string | null = null;

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
      email: `missions-http-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Missions Http",
      biologicalSex: "male",
      birthYear: 1990,
    },
  });
  return { id };
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
  prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "sourceKey" FROM "XpGrant" LIMIT 0`;
    await prisma.$queryRaw`SELECT "missionId" FROM "MissionCompletion" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or mission completion migration not applied";
    return;
  }

  userA = await createUser("a");
  userB = await createUser("b");
  activeUserId = userA.id;

  const moduleRef = await Test.createTestingModule({
    imports: [MissionsModule],
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
    if (userA) await prisma.user.delete({ where: { id: userA.id } }).catch(() => undefined);
    if (userB) await prisma.user.delete({ where: { id: userB.id } }).catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
});

test("pg http: GET /me/missions requires JWT", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = null;
  const res = await http().get("/me/missions");
  assert.equal(res.status, 401);
  activeUserId = userA!.id;
});

test("pg http: GET returns published catalog in stable order without private keys", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userB!.id;
  const beforeProgress = await prisma!.userProgression.findUnique({
    where: { userId: userB!.id },
  });
  const res = await http().get("/me/missions");
  assert.equal(res.status, 200);
  const expected = listPublishedMissions();
  assert.equal(res.body.missions.length, 6);
  assert.deepEqual(
    res.body.missions.map((row: { id: string }) => row.id),
    expected.map((row) => row.id),
  );
  assert.equal(
    res.body.missions.some((row: { id: string }) => row.id === "edu-unpublished-01"),
    false,
  );
  for (const row of res.body.missions) {
    assert.equal(row.state, "available");
    assert.equal(row.completedAt, null);
    assert.equal(row.status, undefined);
    assert.equal(row.correctOptionId, undefined);
    for (const option of row.options) {
      assert.deepEqual(Object.keys(option), ["id"]);
    }
  }
  const raw = JSON.stringify(res.body);
  assert.equal(raw.includes("correctOption"), false);
  assert.equal(raw.includes("MISSION_CORRECT"), false);
  assert.equal(raw.includes(userB!.id), false);

  const afterProgress = await prisma!.userProgression.findUnique({
    where: { userId: userB!.id },
  });
  assert.deepEqual(afterProgress, beforeProgress);
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userB!.id } }), 0);
  assert.equal(await prisma!.xpGrant.count({ where: { userId: userB!.id } }), 0);
  activeUserId = userA!.id;
});

test("pg http: POST without JWT is 401", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = null;
  const res = await http().post(`/me/missions/${DOPAMINE}/answer`).send({ optionId: "wanting" });
  assert.equal(res.status, 401);
  activeUserId = userA!.id;
});

test("pg http: POST correct grants 12 XP; GET isolates user state", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const res = await http().post(`/me/missions/${DOPAMINE}/answer`).send({ optionId: "wanting" });
  assert.equal(res.status, 200);
  assert.equal(res.body.correct, true);
  assert.equal(res.body.completed, true);
  assert.equal(res.body.alreadyCompleted, false);
  assert.equal(res.body.xpGranted, 12);
  assert.equal(typeof res.body.explainKey, "string");
  assert.equal(res.body.explainKey.includes("edu-dopamine-01"), true);
  assert.equal(res.body.correctOptionId, undefined);

  const mine = await http().get("/me/missions");
  const dopamine = mine.body.missions.find((row: { id: string }) => row.id === DOPAMINE);
  assert.equal(dopamine.state, "completed");
  assert.equal(typeof dopamine.completedAt, "string");

  activeUserId = userB!.id;
  const peer = await http().get("/me/missions");
  const peerDopamine = peer.body.missions.find((row: { id: string }) => row.id === DOPAMINE);
  assert.equal(peerDopamine.state, "available");
  assert.equal(peerDopamine.completedAt, null);
  assert.equal(await prisma!.xpGrant.count({ where: { userId: userB!.id } }), 0);
});

test("pg http: known incorrect answer is 200 without completion or XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const beforeXp = Number(
    (await prisma!.userProgression.findUnique({ where: { userId: userA!.id } }))?.totalXp ?? 0n,
  );
  const res = await http().post(`/me/missions/${GABA}/answer`).send({ optionId: "brain_off" });
  assert.equal(res.status, 200);
  assert.deepEqual(
    {
      correct: res.body.correct,
      completed: res.body.completed,
      alreadyCompleted: res.body.alreadyCompleted,
      xpGranted: res.body.xpGranted,
    },
    { correct: false, completed: false, alreadyCompleted: false, xpGranted: 0 },
  );
  assert.equal(typeof res.body.explainKey, "string");
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userA!.id, missionId: GABA } }), 0);
  const afterXp = Number(
    (await prisma!.userProgression.findUnique({ where: { userId: userA!.id } }))?.totalXp ?? 0n,
  );
  assert.equal(afterXp, beforeXp);
});

test("pg http: repeating a correct answer grants no extra XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const first = await http().post(`/me/missions/${GABA}/answer`).send({ optionId: "network_brake" });
  assert.equal(first.status, 200);
  assert.equal(first.body.xpGranted, 12);
  const second = await http().post(`/me/missions/${GABA}/answer`).send({ optionId: "network_brake" });
  assert.equal(second.status, 200);
  assert.equal(second.body.completed, true);
  assert.equal(second.body.alreadyCompleted, true);
  assert.equal(second.body.xpGranted, 0);
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userA!.id, missionId: GABA } }), 1);
  assert.equal(
    await prisma!.xpGrant.count({
      where: { userId: userA!.id, source: "mission_complete", sourceKey: GABA },
    }),
    1,
  );
});

test("pg http: concurrent POSTs complete and grant XP once", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const [a, b] = await Promise.all([
    http().post(`/me/missions/${SEROTONIN}/answer`).send({ optionId: "many_systems" }),
    http().post(`/me/missions/${SEROTONIN}/answer`).send({ optionId: "many_systems" }),
  ]);
  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  const granted = [a.body, b.body].filter((row) => row.xpGranted === 12);
  const duplicates = [a.body, b.body].filter((row) => row.alreadyCompleted);
  assert.equal(granted.length, 1);
  assert.equal(duplicates.length, 1);
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userA!.id, missionId: SEROTONIN } }), 1);
  assert.equal(
    await prisma!.xpGrant.count({
      where: { userId: userA!.id, source: "mission_complete", sourceKey: SEROTONIN },
    }),
    1,
  );
});

test("pg http: invalid payload, extra fields, and unknown option are 400", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const extra = await http()
    .post(`/me/missions/${RECEPTORS}/answer`)
    .send({ optionId: "occupancy", xp: 12, userId: userB!.id, completed: true, contentVersion: 9 });
  assert.equal(extra.status, 400);
  const missing = await http().post(`/me/missions/${RECEPTORS}/answer`).send({});
  assert.equal(missing.status, 400);
  const typed = await http().post(`/me/missions/${RECEPTORS}/answer`).send({ optionId: 12 });
  assert.equal(typed.status, 400);
  const unknown = await http().post(`/me/missions/${RECEPTORS}/answer`).send({ optionId: "not-an-option" });
  assert.equal(unknown.status, 400);
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userA!.id, missionId: RECEPTORS } }), 0);
});

test("pg http: unknown and unpublished missions are 404", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const missing = await http().post("/me/missions/edu-unknown-01/answer").send({ optionId: "wanting" });
  assert.equal(missing.status, 404);
  const draft = await http().post("/me/missions/edu-unpublished-01/answer").send({ optionId: "wanting" });
  assert.equal(draft.status, 404);
  assert.equal(await prisma!.missionCompletion.count({ where: { userId: userA!.id, missionId: "edu-unpublished-01" } }), 0);
});

test("pg http: XP ceiling still completes the mission with xpGranted 0", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const capped = await createUser("cap");
  activeUserId = capped.id;
  try {
    await prisma!.userProgression.create({
      data: {
        userId: capped.id,
        totalXp: BigInt(PROGRESS_XP_MAX) - 5n,
        equippedTitleId: null,
        updatedAt: new Date(),
      },
    });
    const res = await http().post(`/me/missions/${TOLERANCE}/answer`).send({ optionId: "sensitivity" });
    assert.equal(res.status, 200);
    assert.equal(res.body.completed, true);
    assert.equal(res.body.alreadyCompleted, false);
    assert.equal(res.body.xpGranted, 0);
    assert.equal(await prisma!.missionCompletion.count({ where: { userId: capped.id, missionId: TOLERANCE } }), 1);
    assert.equal(
      await prisma!.xpGrant.count({
        where: { userId: capped.id, source: "mission_complete", sourceKey: TOLERANCE },
      }),
      0,
    );
    const row = await prisma!.userProgression.findUniqueOrThrow({ where: { userId: capped.id } });
    assert.equal(Number(row.totalXp), PROGRESS_XP_MAX - 5);
  } finally {
    await prisma!.user.delete({ where: { id: capped.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg http: technical awardXp failure does not leave a completion", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const doomed = await createUser("boom");
  const previous = activeUserId;
  activeUserId = doomed.id;
  const moduleRef = await Test.createTestingModule({
    imports: [MissionsModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(TestJwtGuard)
    .overrideProvider(ProgressService)
    .useValue({
      awardXp: async () => {
        throw new Error("forced-xp-failure");
      },
    })
    .compile();
  const boomApp = moduleRef.createNestApplication();
  boomApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await boomApp.init();
  try {
    const res = await request(boomApp.getHttpServer())
      .post(`/me/missions/${RECEPTORS}/answer`)
      .send({ optionId: "occupancy" });
    assert.equal(res.status, 500);
    assert.equal(await prisma!.missionCompletion.count({ where: { userId: doomed.id, missionId: RECEPTORS } }), 0);
    assert.equal(await prisma!.xpGrant.count({ where: { userId: doomed.id } }), 0);
  } finally {
    await boomApp.close();
    await prisma!.user.delete({ where: { id: doomed.id } }).catch(() => undefined);
    activeUserId = previous;
  }
});
