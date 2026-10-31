/**
 * HTTP + PostgreSQL progress API (GAM-01C). JwtAuthGuard is replaced with a
 * test guard that injects a real user row; ProgressService and Prisma are not
 * mocked so ledger uniqueness, init, and owner isolation are exercised.
 *
 * Skips when DATABASE_URL is unset, unreachable, or the ledger migration is
 * missing. Never truncates tables or deletes pre-existing users.
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
import { PROGRESS_XP_MAX, totalXpToReach } from "@soma/shared-types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { persistSpecialCategoryGrant } from "../auth/special-category-consent.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { ProgressModule } from "./progress.module.js";
import { ProgressService } from "./progress.service.js";

const PASSWORD = "progress-http-pass-1";

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
      email: `progress-http-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Progress Http",
      biologicalSex: "male",
      birthYear: 1990,
    },
  });
  await persistSpecialCategoryGrant(prisma as unknown as PrismaService, id);
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
    await prisma.$queryRaw`SELECT "totalXp" FROM "UserProgression" LIMIT 0`;
    await prisma.$queryRaw`SELECT "sourceKey" FROM "XpGrant" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or progress migration not applied";
    return;
  }

  userA = await createUser("a");
  userB = await createUser("b");
  activeUserId = userA.id;

  const moduleRef = await Test.createTestingModule({
    imports: [ProgressModule],
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
  progress = app.get(ProgressService);
});

after(async () => {
  await app?.close();
  if (prisma) {
    if (userA) await prisma.user.delete({ where: { id: userA.id } }).catch(() => undefined);
    if (userB) await prisma.user.delete({ where: { id: userB.id } }).catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
});

test("pg http: unauthenticated GET /me/progress is 401", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = null;
  const res = await http().get("/me/progress");
  assert.equal(res.status, 401);
  activeUserId = userA!.id;
});

test("pg http: new user initializes at 0 XP level 1 walker; GET does not grant", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const first = await http().get("/me/progress");
  assert.equal(first.status, 200);
  assert.equal(first.body.totalXp, 0);
  assert.equal(first.body.level, 1);
  assert.equal(first.body.xpIntoLevel, 0);
  assert.equal(first.body.percentToNextLevel, 0);
  assert.equal(first.body.equippedTitleId, "walker");
  assert.deepEqual(first.body.unlockedTitleIds, ["walker"]);

  const second = await http().get("/me/progress");
  assert.equal(second.status, 200);
  assert.deepEqual(second.body, first.body);

  const grants = await prisma!.xpGrant.count({ where: { userId: userA!.id } });
  assert.equal(grants, 0);
});

test("pg http: ledger first grant, duplicate, distinct keys, isolation", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const first = await progress!.awardXp(userA!.id, {
    source: "journal_create_day",
    sourceKey: "day-1",
  });
  assert.equal(first.status, "awarded");
  assert.equal(first.totalXp, 12);

  const dup = await progress!.awardXp(userA!.id, {
    source: "journal_create_day",
    sourceKey: "day-1",
  });
  assert.equal(dup.status, "duplicate");
  assert.equal(dup.totalXp, 12);

  const second = await progress!.awardXp(userA!.id, {
    source: "personal_milestone",
    sourceKey: "sleep-better",
  });
  assert.equal(second.status, "awarded");
  assert.equal(second.totalXp, 22);

  activeUserId = userA!.id;
  const a = await http().get("/me/progress");
  assert.equal(a.status, 200);
  assert.equal(a.body.totalXp, 22);
  assert.equal(a.body.level, 1);

  activeUserId = userB!.id;
  const b = await http().get("/me/progress");
  assert.equal(b.status, 200);
  assert.equal(b.body.totalXp, 0);
  assert.equal(b.body.level, 1);
  assert.equal(JSON.stringify(b.body).includes(userA!.id), false);

  const peerGrants = await prisma!.xpGrant.count({ where: { userId: userB!.id } });
  assert.equal(peerGrants, 0);
});

test("pg http: concurrent duplicate grants add XP once", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const key = `concurrent-${createId()}`;
  const before = await prisma!.userProgression.findUnique({
    where: { userId: userA!.id },
  });
  const start = Number(before?.totalXp ?? 0n);

  const results = await Promise.all([
    progress!.awardXp(userA!.id, {
      source: "journal_create_day",
      sourceKey: key,
    }),
    progress!.awardXp(userA!.id, {
      source: "journal_create_day",
      sourceKey: key,
    }),
  ]);
  const awarded = results.filter((row) => row.status === "awarded");
  assert.equal(awarded.length, 1);
  assert.equal(
    results.filter((row) => row.status === "duplicate").length,
    1,
  );
  assert.ok(results.every((row) => row.totalXp === start + 12));

  const distinct = await Promise.all([
    progress!.awardXp(userA!.id, {
      source: "journal_create_day",
      sourceKey: `${key}-a`,
    }),
    progress!.awardXp(userA!.id, {
      source: "journal_create_day",
      sourceKey: `${key}-b`,
    }),
  ]);
  assert.equal(distinct.filter((row) => row.status === "awarded").length, 2);
  const after = await prisma!.userProgression.findUniqueOrThrow({
    where: { userId: userA!.id },
  });
  assert.equal(Number(after.totalXp), start + 36);
});

test("pg http: cap miss rolls back grant; 70 and 2790 map to levels", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const capped = await createUser("cap");
  try {
    await prisma!.userProgression.create({
      data: {
        userId: capped.id,
        totalXp: BigInt(PROGRESS_XP_MAX) - 5n,
        equippedTitleId: null,
        updatedAt: new Date(),
      },
    });
    const overflow = await progress!.awardXp(capped.id, {
      source: "onboarding_complete",
      sourceKey: "would-overflow",
    });
    assert.equal(overflow.status, "capped");
    assert.equal(overflow.totalXp, PROGRESS_XP_MAX - 5);
    const grants = await prisma!.xpGrant.count({ where: { userId: capped.id } });
    assert.equal(grants, 0);
    const row = await prisma!.userProgression.findUniqueOrThrow({
      where: { userId: capped.id },
    });
    assert.equal(Number(row.totalXp), PROGRESS_XP_MAX - 5);

    const spoof = await createUser("spoof");
    const spoofed = await progress!.awardXp(spoof.id, {
      source: "journal_create_day",
      sourceKey: "spoof-amount",
      ...({ amount: 70 } as object),
    });
    assert.equal(spoofed.totalXp, 12);
    await prisma!.user.delete({ where: { id: spoof.id } });

    const lvl2 = await createUser("lvl2");
    await prisma!.userProgression.create({
      data: {
        userId: lvl2.id,
        totalXp: 70n,
        equippedTitleId: null,
        updatedAt: new Date(),
      },
    });
    activeUserId = lvl2.id;
    const res2 = await http().get("/me/progress");
    assert.equal(res2.status, 200);
    assert.equal(typeof res2.body.totalXp, "number");
    assert.equal(res2.body.totalXp, 70);
    assert.equal(res2.body.level, 2);
    assert.equal(res2.body.xpIntoLevel, 0);
    assert.deepEqual(res2.body.unlockedTitleIds, ["walker"]);
    assert.equal(res2.body.equippedTitleId, "walker");
    JSON.parse(JSON.stringify(res2.body));
    await prisma!.user.delete({ where: { id: lvl2.id } });

    const lvl10 = await createUser("lvl10");
    await prisma!.userProgression.create({
      data: {
        userId: lvl10.id,
        totalXp: 2790n,
        equippedTitleId: null,
        updatedAt: new Date(),
      },
    });
    activeUserId = lvl10.id;
    const res10 = await http().get("/me/progress");
    assert.equal(res10.body.totalXp, 2790);
    assert.equal(res10.body.level, 10);
    assert.deepEqual(res10.body.unlockedTitleIds, [
      "walker",
      "explorer",
      "cartographer",
    ]);
    await prisma!.user.delete({ where: { id: lvl10.id } });

    const atCap = await createUser("capjson");
    await prisma!.userProgression.create({
      data: {
        userId: atCap.id,
        totalXp: BigInt(PROGRESS_XP_MAX),
        equippedTitleId: null,
        updatedAt: new Date(),
      },
    });
    activeUserId = atCap.id;
    const resCap = await http().get("/me/progress");
    assert.equal(resCap.status, 200);
    assert.equal(typeof resCap.body.totalXp, "number");
    assert.equal(resCap.body.totalXp, PROGRESS_XP_MAX);
    assert.equal(resCap.body.percentToNextLevel, 100);
    JSON.parse(JSON.stringify(resCap.body));
    await prisma!.user.delete({ where: { id: atCap.id } });
  } finally {
    await prisma!.user.delete({ where: { id: capped.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg http: PATCH equips unlocked titles only; does not change XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("equip");
  const peer = await createUser("equip-peer");
  try {
    activeUserId = user.id;
    const init = await http().patch("/me/progress").send({
      equippedTitleId: "walker",
    });
    assert.equal(init.status, 200);
    assert.equal(init.body.totalXp, 0);
    assert.equal(init.body.level, 1);
    assert.equal(init.body.equippedTitleId, "walker");
    assert.deepEqual(init.body.unlockedTitleIds, ["walker"]);

    const locked = await http().patch("/me/progress").send({
      equippedTitleId: "explorer",
    });
    assert.equal(locked.status, 400);
    assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 0);

    await prisma!.userProgression.update({
      where: { userId: user.id },
      data: { totalXp: BigInt(totalXpToReach(5)) },
    });
    const explorer = await http().patch("/me/progress").send({
      equippedTitleId: "explorer",
    });
    assert.equal(explorer.status, 200);
    assert.equal(explorer.body.level, 5);
    assert.equal(explorer.body.equippedTitleId, "explorer");
    assert.equal(explorer.body.totalXp, totalXpToReach(5));

    await prisma!.userProgression.update({
      where: { userId: user.id },
      data: { totalXp: BigInt(totalXpToReach(10)) },
    });
    const walkerAgain = await http().patch("/me/progress").send({
      equippedTitleId: "walker",
    });
    assert.equal(walkerAgain.status, 200);
    assert.equal(walkerAgain.body.level, 10);
    assert.equal(walkerAgain.body.equippedTitleId, "walker");
    assert.ok(walkerAgain.body.unlockedTitleIds.includes("cartographer"));

    const repeat = await http().patch("/me/progress").send({
      equippedTitleId: "walker",
    });
    assert.equal(repeat.status, 200);
    assert.deepEqual(repeat.body, walkerAgain.body);

    const got = await http().get("/me/progress");
    assert.equal(got.body.equippedTitleId, "walker");
    assert.equal(got.body.totalXp, totalXpToReach(10));
    assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 0);

    const xpBeforePeer = got.body.totalXp;
    activeUserId = peer.id;
    const peerPatch = await http().patch("/me/progress").send({
      equippedTitleId: "explorer",
    });
    assert.equal(peerPatch.status, 400);
    const owner = await prisma!.userProgression.findUniqueOrThrow({
      where: { userId: user.id },
    });
    assert.equal(owner.equippedTitleId, "walker");
    assert.equal(Number(owner.totalXp), xpBeforePeer);
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    await prisma!.user.delete({ where: { id: peer.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg http: PATCH walker initializes a missing progression row", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("init-title");
  try {
    const existing = await prisma!.userProgression.findUnique({
      where: { userId: user.id },
    });
    assert.equal(existing, null);
    activeUserId = user.id;
    const res = await http().patch("/me/progress").send({
      equippedTitleId: "walker",
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.equippedTitleId, "walker");
    assert.equal(res.body.totalXp, 0);
    assert.equal(res.body.level, 1);
    const row = await prisma!.userProgression.findUniqueOrThrow({
      where: { userId: user.id },
    });
    assert.equal(row.equippedTitleId, "walker");
    assert.equal(Number(row.totalXp), 0);
    assert.equal(await prisma!.xpGrant.count({ where: { userId: user.id } }), 0);
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});
