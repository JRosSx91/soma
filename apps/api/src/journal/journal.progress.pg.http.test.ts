/**
 * LIVE journal / milestone writes grant XP (GAM-01D). Skips when DATABASE_URL
 * is unset, unreachable, or the ledger/journal migrations are missing.
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
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import request from "supertest";
import { utcDateToCivilDate } from "@soma/shared-types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { persistSpecialCategoryGrant } from "../auth/special-category-consent.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { JournalModule } from "./journal.module.js";

const PASSWORD = "journal-xp-pass-1";

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
      email: `journal-xp-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Journal Xp",
      biologicalSex: "female",
      birthYear: 1992,
    },
  });
  await persistSpecialCategoryGrant(prisma as unknown as PrismaService, id);
  return { id };
}

function http() {
  if (!app) throw new Error("app");
  return request(app.getHttpServer());
}

async function totalXp(userId: string): Promise<number> {
  const row = await prisma!.userProgression.findUnique({ where: { userId } });
  return Number(row?.totalXp ?? 0n);
}

async function grantCount(userId: string, source?: string): Promise<number> {
  return prisma!.xpGrant.count({
    where: source ? { userId, source } : { userId },
  });
}

before(async () => {
  if (!process.env.DATABASE_URL) {
    skipReason = "DATABASE_URL is unset";
    return;
  }
  prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "occurredOn" FROM "JournalEntry" LIMIT 0`;
    await prisma.$queryRaw`SELECT "sourceKey" FROM "XpGrant" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or journal/progress migration missing";
    return;
  }

  userA = await createUser("a");
  userB = await createUser("b");
  activeUserId = userA.id;

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
    if (userA) await prisma.user.delete({ where: { id: userA.id } }).catch(() => undefined);
    if (userB) await prisma.user.delete({ where: { id: userB.id } }).catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
  }
});

test("pg xp: first journal entry of the UTC day awards 12; second awards 0", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const today = utcDateToCivilDate(new Date());
  const first = await http().post("/me/journal").send({
    occurredOn: today,
    mood: 4,
  });
  assert.equal(first.status, 201);
  assert.equal(await totalXp(userA!.id), 12);
  assert.equal(await grantCount(userA!.id, "journal_create_day"), 1);
  const grant = await prisma!.xpGrant.findFirst({
    where: { userId: userA!.id, source: "journal_create_day" },
  });
  assert.equal(grant?.sourceKey, utcDateToCivilDate(new Date(first.body.createdAt)));
  assert.notEqual(grant?.sourceKey, "1999-01-01");

  const second = await http().post("/me/journal").send({
    occurredOn: today,
    mood: 5,
  });
  assert.equal(second.status, 201);
  assert.equal(await totalXp(userA!.id), 12);
  assert.equal(await grantCount(userA!.id, "journal_create_day"), 1);
});

test("pg xp: occurredOn in the past still keys the grant to createdAt UTC day", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("past");
  try {
    activeUserId = user.id;
    const res = await http().post("/me/journal").send({
      occurredOn: "2020-06-01",
      title: "old-day",
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.occurredOn, "2020-06-01");
    assert.equal(await totalXp(user.id), 12);
    const grant = await prisma!.xpGrant.findFirst({
      where: { userId: user.id, source: "journal_create_day" },
    });
    assert.equal(grant?.sourceKey, utcDateToCivilDate(new Date(res.body.createdAt)));
    assert.notEqual(grant?.sourceKey, "2020-06-01");
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg xp: concurrent journal creates award a single daily grant", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("conc");
  try {
    activeUserId = user.id;
    const [a, b] = await Promise.all([
      http().post("/me/journal").send({ occurredOn: "2026-03-01", mood: 2 }),
      http().post("/me/journal").send({ occurredOn: "2026-03-02", mood: 3 }),
    ]);
    assert.equal(a.status, 201);
    assert.equal(b.status, 201);
    assert.equal(await totalXp(user.id), 12);
    assert.equal(await grantCount(user.id, "journal_create_day"), 1);
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg xp: PATCH and DELETE do not grant or revoke journal XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const beforeXp = await totalXp(userA!.id);
  const beforeGrants = await grantCount(userA!.id);
  const listed = await http().get("/me/journal");
  const id = listed.body.items[0]?.id as string;
  assert.ok(id);

  const patched = await http().patch(`/me/journal/${id}`).send({ mood: 1 });
  assert.equal(patched.status, 200);
  assert.equal(await totalXp(userA!.id), beforeXp);
  assert.equal(await grantCount(userA!.id), beforeGrants);

  const removed = await http().delete(`/me/journal/${id}`);
  assert.equal(removed.status, 204);
  assert.equal(await totalXp(userA!.id), beforeXp);
  assert.equal(await grantCount(userA!.id), beforeGrants);
});

test("pg xp: user B journal XP is isolated from A", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const xpA = await totalXp(userA!.id);
  activeUserId = userB!.id;
  const created = await http().post("/me/journal").send({
    occurredOn: "2026-03-10",
    mood: 3,
  });
  assert.equal(created.status, 201);
  assert.equal(await totalXp(userB!.id), 12);
  assert.equal(await totalXp(userA!.id), xpA);

  const progressB = await http().get("/me/progress");
  assert.equal(progressB.status, 200);
  assert.equal(progressB.body.totalXp, 12);
  assert.equal(JSON.stringify(progressB.body).includes(userA!.id), false);
});

test("pg xp: personal milestone grants 10 once per kind; delete does not revoke", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("ms");
  try {
    activeUserId = user.id;
    const first = await http().post("/me/journal/milestones").send({
      kind: "clarity",
      occurredOn: "2026-03-01",
    });
    assert.equal(first.status, 201);
    assert.equal(await totalXp(user.id), 10);

    const repeat = await http().post("/me/journal/milestones").send({
      kind: "clarity",
      occurredOn: "2026-03-02",
    });
    assert.equal(repeat.status, 201);
    assert.equal(await totalXp(user.id), 10);

    const other = await http().post("/me/journal/milestones").send({
      kind: "rest",
      occurredOn: "2026-03-03",
    });
    assert.equal(other.status, 201);
    assert.equal(await totalXp(user.id), 20);
    assert.equal(await grantCount(user.id, "personal_milestone"), 2);

    const removed = await http().delete(`/me/journal/milestones/${first.body.id}`);
    assert.equal(removed.status, 204);
    assert.equal(await totalXp(user.id), 20);
    assert.equal(await grantCount(user.id, "personal_milestone"), 2);
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});
