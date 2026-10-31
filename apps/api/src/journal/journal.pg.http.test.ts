/**
 * HTTP + PostgreSQL Journal API (JRN-01D). JwtAuthGuard is replaced with a
 * test guard that injects a real user row; JournalService and Prisma are not
 * mocked so owner isolation is exercised.
 *
 * Skips when DATABASE_URL is unset, unreachable, or JournalEntry is missing.
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

const PASSWORD = "journal-http-pass-1";

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
      email: `journal-http-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Journal Http",
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
    await prisma.$queryRaw`SELECT "occurredOn" FROM "JournalEntry" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or journal migration not applied";
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

test("pg http: unauthenticated journal routes are 401", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = null;
  const res = await http().post("/me/journal").send({
    occurredOn: "2026-04-29",
    mood: 3,
  });
  assert.equal(res.status, 401);
  activeUserId = userA!.id;
});

test("pg http: owner CRUD, foreign 404, export and wipe isolation", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;

  const created = await http().post("/me/journal").send({
    occurredOn: "2026-09-15",
    mood: 4,
    title: "owner-note",
    emotionIds: ["calm"],
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.occurredOn, "2026-09-15");
  assert.equal(created.body.title, "owner-note");
  const id = created.body.id as string;

  const own = await http().get(`/me/journal/${id}`);
  assert.equal(own.status, 200);
  assert.equal(own.body.id, id);

  activeUserId = userB!.id;
  const foreignGet = await http().get(`/me/journal/${id}`);
  assert.equal(foreignGet.status, 404);
  assert.equal(foreignGet.body.message, "Journal entry not found");
  assert.equal(JSON.stringify(foreignGet.body).includes("owner-note"), false);

  const foreignPatch = await http().patch(`/me/journal/${id}`).send({ mood: 1 });
  assert.equal(foreignPatch.status, 404);

  const foreignDelete = await http().delete(`/me/journal/${id}`);
  assert.equal(foreignDelete.status, 404);

  const peer = await http().post("/me/journal").send({
    occurredOn: "2026-09-15",
    body: "peer-secret",
  });
  assert.equal(peer.status, 201);

  const exportB = await http().get("/me/journal/export");
  assert.equal(exportB.status, 200);
  assert.equal(exportB.body.entries.length, 1);
  assert.equal(exportB.body.entries[0].body, "peer-secret");
  assert.ok(
    !exportB.body.entries.some((row: { title?: string }) => row.title === "owner-note"),
  );

  activeUserId = userA!.id;
  const patched = await http().patch(`/me/journal/${id}`).send({
    mood: 2,
    sleep: 5,
  });
  assert.equal(patched.status, 200);
  assert.equal(patched.body.mood, 2);
  assert.equal(patched.body.sleep, 5);

  const emptyPatch = await http().patch(`/me/journal/${id}`).send({
    mood: null,
    sleep: null,
    title: null,
    emotionIds: [],
    triggerIds: [],
    body: null,
    energy: null,
    anxiety: null,
    cravingIntensity: null,
  });
  assert.equal(emptyPatch.status, 400);
  const emptyPatchJson = JSON.stringify(emptyPatch.body);
  assert.equal(emptyPatchJson.includes("owner-note"), false);
  assert.equal(emptyPatchJson.includes("calm"), false);

  const listed = await http().get("/me/journal").query({ from: "2026-09-15", to: "2026-09-15" });
  assert.equal(listed.status, 200);
  assert.ok(listed.body.items.every((row: { id: string }) => row.id !== peer.body.id));

  const sparse = await http().post("/me/journal").send({
    occurredOn: "2026-09-16",
    mood: 1,
  });
  assert.equal(sparse.status, 201);
  assert.equal(sparse.body.title, null);
  assert.equal(sparse.body.body, null);

  const exportA = await http().get("/me/journal/export");
  assert.equal(exportA.status, 200);
  assert.ok(
    !exportA.body.entries.some((row: { body?: string }) => row.body === "peer-secret"),
  );
  const sparseExported = exportA.body.entries.find(
    (row: { id: string }) => row.id === sparse.body.id,
  );
  assert.equal(sparseExported.mood, 1);
  assert.equal(sparseExported.title, null);
  assert.equal(sparseExported.body, null);
  assert.equal(sparseExported.sleep, null);

  const wipeRejected = await http().delete("/me/journal").send({ confirm: "nope" });
  assert.equal(wipeRejected.status, 400);

  const wiped = await http().delete("/me/journal").send({ confirm: "delete-journal" });
  assert.equal(wiped.status, 204);

  const afterWipe = await http().get("/me/journal");
  assert.equal(afterWipe.body.items.length, 0);

  activeUserId = userB!.id;
  const peerStill = await http().get("/me/journal");
  assert.equal(peerStill.body.items.length, 1);
  assert.equal(peerStill.body.items[0].body, "peer-secret");

  const removed = await http().delete(`/me/journal/${peer.body.id}`);
  assert.equal(removed.status, 204);
});
