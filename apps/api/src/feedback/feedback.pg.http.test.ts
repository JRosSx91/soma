/**
 * HTTP + PostgreSQL feedback API (FBK-01C). JwtAuthGuard is replaced with a
 * test guard that injects a real user row; FeedbackService and Prisma are not
 * mocked so owner isolation, duplicates, and pagination are exercised.
 *
 * Skips when DATABASE_URL is unset, unreachable, or FeedbackReport is missing.
 * Does not connect to production; intended for the local test database.
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
import { FEEDBACK_LIST_DEFAULT_LIMIT } from "@soma/shared-types";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { createId } from "../auth/create-id.js";
import { FeedbackModule } from "./feedback.module.js";
import { feedbackFingerprint } from "./feedback.hash.js";

const PASSWORD = "feedback-http-pass-1";
const BODY = "The save button does nothing after I write a note.";

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
      email: `feedback-http-${label}-${id}@example.test`,
      hashedPassword: await bcrypt.hash(PASSWORD, 4),
      displayName: "Feedback Http",
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

function assertPublicItem(body: Record<string, unknown>) {
  assert.equal(body.userId, undefined);
  assert.equal(body.fingerprint, undefined);
  assert.equal(typeof body.id, "string");
  assert.equal(typeof body.category, "string");
  assert.equal(typeof body.title, "string");
  assert.equal(typeof body.body, "string");
  assert.equal(typeof body.status, "string");
}

before(async () => {
  if (!process.env.DATABASE_URL) {
    skipReason = "DATABASE_URL is unset";
    return;
  }
  let host = "";
  try {
    host = new URL(process.env.DATABASE_URL).hostname;
  } catch {
    skipReason = "DATABASE_URL is not a local test database";
    return;
  }
  if (host !== "localhost" && host !== "127.0.0.1") {
    skipReason = "DATABASE_URL is not a local test database";
    return;
  }

  prisma = new PrismaClient();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "fingerprint" FROM "FeedbackReport" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    prisma = undefined;
    skipReason = "DATABASE_URL unreachable or feedback migration not applied";
    return;
  }

  userA = await createUser("a");
  userB = await createUser("b");
  activeUserId = userA.id;

  const moduleRef = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }]),
      FeedbackModule,
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

test("pg http: unauthenticated feedback routes are 401", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = null;
  const res = await http().post("/me/feedback").send({
    category: "bug",
    title: "Save fails",
    body: BODY,
  });
  assert.equal(res.status, 401);
  activeUserId = userA!.id;
});

test("pg http: create, duplicate window, isolation, pagination, no XP", async (t) => {
  if (skipReason) {
    t.skip(skipReason);
    return;
  }
  activeUserId = userA!.id;

  const created = await http().post("/me/feedback").send({
    category: "bug",
    title: "Save fails",
    body: BODY,
  });
  assert.equal(created.status, 201);
  assertPublicItem(created.body);
  assert.equal(created.body.status, "open");
  const firstId = created.body.id as string;

  const duplicate = await http().post("/me/feedback").send({
    category: "bug",
    title: "  Save   fails ",
    body: ` ${BODY} `,
  });
  assert.equal(duplicate.status, 200);
  assert.equal(duplicate.body.id, firstId);

  const agedAt = new Date(Date.now() - 25 * 60 * 60 * 1000);
  await prisma!.feedbackReport.create({
    data: {
      userId: userA!.id,
      category: "suggestion",
      title: "Dark mode",
      body: "Please add a dim theme option soon.",
      fingerprint: feedbackFingerprint(
        "suggestion",
        "Dark mode",
        "Please add a dim theme option soon.",
      ),
      createdAt: agedAt,
      updatedAt: agedAt,
    },
  });
  const afterWindow = await http().post("/me/feedback").send({
    category: "suggestion",
    title: "Dark mode",
    body: "Please add a dim theme option soon.",
  });
  assert.equal(afterWindow.status, 201);
  assert.notEqual(afterWindow.body.id, firstId);

  activeUserId = userB!.id;
  const other = await http().post("/me/feedback").send({
    category: "bug",
    title: "Save fails",
    body: BODY,
  });
  assert.equal(other.status, 201);
  assert.notEqual(other.body.id, firstId);
  const listB = await http().get("/me/feedback");
  assert.equal(listB.status, 200);
  assert.equal(listB.body.items.length, 1);
  assert.equal(listB.body.items[0].id, other.body.id);
  assert.equal(
    listB.body.items.some((row: { id: string }) => row.id === firstId),
    false,
  );

  activeUserId = userA!.id;
  for (let i = 0; i < FEEDBACK_LIST_DEFAULT_LIMIT; i += 1) {
    const title = `Page item ${String(i).padStart(2, "0")}`;
    const body = `${BODY} variant ${i}`;
    const createdAt = new Date(Date.now() - i * 1000);
    await prisma!.feedbackReport.create({
      data: {
        userId: userA!.id,
        category: "general",
        title,
        body,
        fingerprint: feedbackFingerprint("general", title, body),
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
  const page1 = await http().get("/me/feedback");
  assert.equal(page1.status, 200);
  assert.equal(page1.body.items.length, FEEDBACK_LIST_DEFAULT_LIMIT);
  assert.equal(typeof page1.body.nextCursor, "string");
  const times = page1.body.items.map((row: { createdAt: string; id: string }) =>
    `${row.createdAt}|${row.id}`,
  );
  const sorted = [...times].sort((a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0));
  assert.deepEqual(times, sorted);

  const page2 = await http().get("/me/feedback").query({
    cursor: page1.body.nextCursor,
  });
  assert.equal(page2.status, 200);
  assert.ok(page2.body.items.length >= 1);
  const ids1 = new Set(page1.body.items.map((row: { id: string }) => row.id));
  for (const row of page2.body.items as { id: string }[]) {
    assert.equal(ids1.has(row.id), false);
  }

  const grants = await prisma!.xpGrant.findMany({
    where: { userId: userA!.id },
  });
  assert.equal(grants.length, 0);
  const progression = await prisma!.userProgression.findUnique({
    where: { userId: userA!.id },
  });
  assert.equal(progression, null);
});
