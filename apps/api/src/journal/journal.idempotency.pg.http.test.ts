/**
 * JRN-01R: POST /me/journal Idempotency-Key against live PostgreSQL.
 * Skips when DATABASE_URL is unset or the idempotency migration is missing.
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
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { persistSpecialCategoryGrant } from "../auth/special-category-consent.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { JournalModule } from "./journal.module.js";

const PASSWORD = "journal-idem-pass-1";
const KEY_A = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee01";
const KEY_B = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee02";
const KEY_C = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee03";
const KEY_SHARED = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee04";
const KEY_BAD_FK = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee05";
const KEY_CONSENT = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee06";

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

async function createUser(label: string, grant = true): Promise<{ id: string }> {
  if (!prisma) throw new Error("prisma");
  const id = createId();
  await prisma.user.create({
    data: {
      id,
      email: `journal-idem-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Journal Idem",
      biologicalSex: "male",
      birthYear: 1990,
    },
  });
  if (grant) {
    await persistSpecialCategoryGrant(prisma as unknown as PrismaService, id);
  }
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
    await prisma.$queryRaw`SELECT "clientOpId", "requestHash" FROM "JournalEntry" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or idempotency migration not applied";
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

test("pg idem: first POST is 201; identical replay is 200 with the same id", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const payload = { occurredOn: "2026-05-01", mood: 3, title: "once" };
  const first = await http()
    .post("/me/journal")
    .set("Idempotency-Key", KEY_A)
    .send(payload);
  assert.equal(first.status, 201);
  const id = first.body.id as string;
  const replay = await http()
    .post("/me/journal")
    .set("Idempotency-Key", KEY_A)
    .send(payload);
  assert.equal(replay.status, 200);
  assert.equal(replay.body.id, id);
  const count = await prisma!.journalEntry.count({
    where: { userId: userA!.id, clientOpId: KEY_A },
  });
  assert.equal(count, 1);
});

test("pg idem: same content with distinct keys creates two rows", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const payload = { occurredOn: "2026-05-02", mood: 4 };
  const a = await http().post("/me/journal").set("Idempotency-Key", KEY_B).send(payload);
  const b = await http().post("/me/journal").set("Idempotency-Key", KEY_C).send(payload);
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.notEqual(a.body.id, b.body.id);
});

test("pg idem: same key different payload is 409 and does not insert", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const key = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee07";
  const first = await http()
    .post("/me/journal")
    .set("Idempotency-Key", key)
    .send({ occurredOn: "2026-05-03", mood: 2, title: "alpha" });
  assert.equal(first.status, 201);
  const conflict = await http()
    .post("/me/journal")
    .set("Idempotency-Key", key)
    .send({ occurredOn: "2026-05-03", mood: 5, title: "beta" });
  assert.equal(conflict.status, 409);
  assert.equal(conflict.body.code, "IDEMPOTENCY_KEY_REUSED");
  assert.equal(
    await prisma!.journalEntry.count({ where: { userId: userA!.id, clientOpId: key } }),
    1,
  );
});

test("pg idem: two users may reuse the same key independently", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const payload = { occurredOn: "2026-05-04", mood: 3 };
  const a = await http()
    .post("/me/journal")
    .set("Idempotency-Key", KEY_SHARED)
    .send(payload);
  activeUserId = userB!.id;
  const b = await http()
    .post("/me/journal")
    .set("Idempotency-Key", KEY_SHARED)
    .send(payload);
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.notEqual(a.body.id, b.body.id);
  const foreign = await http().get(`/me/journal/${a.body.id}`);
  assert.equal(foreign.status, 404);
});

test("pg idem: concurrent POSTs with the same key yield one row", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const key = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee08";
  const payload = { occurredOn: "2026-05-05", mood: 2, title: "race" };
  const [x, y] = await Promise.all([
    http().post("/me/journal").set("Idempotency-Key", key).send(payload),
    http().post("/me/journal").set("Idempotency-Key", key).send(payload),
  ]);
  assert.equal([x.status, y.status].sort().join(","), "200,201");
  assert.equal(x.body.id, y.body.id);
  assert.equal(
    await prisma!.journalEntry.count({ where: { userId: userA!.id, clientOpId: key } }),
    1,
  );
});

test("pg idem: replay after PATCH returns the stored row without a second insert", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const key = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee09";
  const original = { occurredOn: "2026-05-06", mood: 3, title: "before" };
  const created = await http()
    .post("/me/journal")
    .set("Idempotency-Key", key)
    .send(original);
  assert.equal(created.status, 201);
  const patched = await http()
    .patch(`/me/journal/${created.body.id}`)
    .send({ title: "after-patch" });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.title, "after-patch");
  const replay = await http()
    .post("/me/journal")
    .set("Idempotency-Key", key)
    .send(original);
  assert.equal(replay.status, 200);
  assert.equal(replay.body.id, created.body.id);
  assert.equal(replay.body.title, "after-patch");
  assert.equal(
    await prisma!.journalEntry.count({ where: { userId: userA!.id, clientOpId: key } }),
    1,
  );
});

test("pg idem: omitted key keeps legacy multi-create behaviour", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const payload = { occurredOn: "2026-05-07", mood: 1 };
  const a = await http().post("/me/journal").send(payload);
  const b = await http().post("/me/journal").send(payload);
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  assert.notEqual(a.body.id, b.body.id);
});

test("pg idem: invalid key is 400 without a row", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const before = await prisma!.journalEntry.count({ where: { userId: userA!.id } });
  const res = await http()
    .post("/me/journal")
    .set("Idempotency-Key", "nope")
    .send({ occurredOn: "2026-05-08", mood: 3 });
  assert.equal(res.status, 400);
  assert.equal(
    await prisma!.journalEntry.count({ where: { userId: userA!.id } }),
    before,
  );
});

test("pg idem: failed FK write does not persist clientOpId", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;
  const res = await http()
    .post("/me/journal")
    .set("Idempotency-Key", KEY_BAD_FK)
    .send({
      occurredOn: "2026-05-09",
      cravingIntensity: 2,
      cravingSubstanceId: "not-a-catalog-id",
    });
  assert.equal(res.status, 400);
  assert.equal(
    await prisma!.journalEntry.count({
      where: { userId: userA!.id, clientOpId: KEY_BAD_FK },
    }),
    0,
  );
});

test("pg idem: replay does not grant a second daily XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("xp");
  try {
    activeUserId = user.id;
    const key = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeee0a";
    const payload = { occurredOn: "2026-05-10", mood: 4 };
    const first = await http().post("/me/journal").set("Idempotency-Key", key).send(payload);
    assert.equal(first.status, 201);
    const replay = await http().post("/me/journal").set("Idempotency-Key", key).send(payload);
    assert.equal(replay.status, 200);
    const grants = await prisma!.xpGrant.count({
      where: { userId: user.id, source: "journal_create_day" },
    });
    assert.equal(grants, 1);
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});

test("pg idem: consent still required on the first insert", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  const user = await createUser("consent", false);
  try {
    activeUserId = user.id;
    const res = await http()
      .post("/me/journal")
      .set("Idempotency-Key", KEY_CONSENT)
      .send({ occurredOn: "2026-05-11", mood: 3 });
    assert.equal(res.status, 403);
    assert.equal(
      await prisma!.journalEntry.count({ where: { userId: user.id } }),
      0,
    );
  } finally {
    await prisma!.user.delete({ where: { id: user.id } }).catch(() => undefined);
    activeUserId = userA!.id;
  }
});
