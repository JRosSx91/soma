import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  CanActivate,
  ExecutionContext,
  INestApplication,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import request from "supertest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { JournalController } from "./journal.controller.js";
import { JournalService } from "./journal.service.js";

const USER_A = {
  id: "user-a",
  email: "a@example.test",
  displayName: "A",
  biologicalSex: "male" as const,
  birthYear: 1990,
  weightKg: null,
  onboardingStatus: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const USER_B = { ...USER_A, id: "user-b", email: "b@example.test" };

let activeUser: typeof USER_A | null = USER_A;

@Injectable()
class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (!activeUser) {
      throw new UnauthorizedException();
    }
    const req = context.switchToHttp().getRequest<{ user: typeof USER_A }>();
    req.user = activeUser;
    return true;
  }
}

@Injectable()
class RecordingJournalService {
  lastCreate: { userId: string } | null = null;
  lastGet: { userId: string; id: string } | null = null;
  lastPatch: { userId: string; id: string } | null = null;
  lastRemove: { userId: string; id: string } | null = null;
  lastWipe: { userId: string } | null = null;
  lastExport: { userId: string } | null = null;
  lastMilestoneGet: { userId: string; id: string } | null = null;
  lastList: { userId: string; query: unknown } | null = null;
  foreignIds = new Set(["foreign-entry"]);
  foreignMilestones = new Set(["foreign-milestone"]);

  async create(userId: string) {
    this.lastCreate = { userId };
    return { id: "created-1", occurredOn: "2026-04-29", mood: 3 };
  }

  async getOne(userId: string, id: string) {
    this.lastGet = { userId, id };
    if (this.foreignIds.has(id)) throw new NotFoundException("Journal entry not found");
    return { id, occurredOn: "2026-04-29", mood: 3 };
  }

  async list(userId: string, query: unknown) {
    this.lastList = { userId, query };
    return { items: [{ id: "own", userId }], nextCursor: null };
  }

  async exportAll(userId: string) {
    this.lastExport = { userId };
    return { exportedAt: "2026-04-29T00:00:00.000Z", entries: [] };
  }

  async patch(userId: string, id: string) {
    this.lastPatch = { userId, id };
    if (this.foreignIds.has(id)) throw new NotFoundException("Journal entry not found");
    return { id, occurredOn: "2026-04-29", mood: 4 };
  }

  async remove(userId: string, id: string) {
    this.lastRemove = { userId, id };
    if (this.foreignIds.has(id)) throw new NotFoundException("Journal entry not found");
  }

  async wipeAll(userId: string) {
    this.lastWipe = { userId };
  }

  async listMilestones(userId: string) {
    return [{ id: "own-ms", userId, kind: "clarity" }];
  }

  async createMilestone(userId: string) {
    return { id: "ms-1", userId, kind: "clarity", occurredOn: "2026-04-29" };
  }

  async getMilestone(userId: string, id: string) {
    this.lastMilestoneGet = { userId, id };
    if (this.foreignMilestones.has(id)) {
      throw new NotFoundException("Personal milestone not found");
    }
    return { id, kind: "clarity", occurredOn: "2026-04-29" };
  }

  async patchMilestone(userId: string, id: string) {
    if (this.foreignMilestones.has(id)) {
      throw new NotFoundException("Personal milestone not found");
    }
    return { id, userId, kind: "rest" };
  }

  async removeMilestone(userId: string, id: string) {
    if (this.foreignMilestones.has(id)) {
      throw new NotFoundException("Personal milestone not found");
    }
  }
}

let app: INestApplication;
let stub: RecordingJournalService;

before(async () => {
  stub = new RecordingJournalService();
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [JournalController],
    providers: [{ provide: JournalService, useValue: stub }],
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
  await app.close();
});

test("POST /me/journal requires auth", async () => {
  activeUser = null;
  const res = await request(app.getHttpServer())
    .post("/me/journal")
    .send({ occurredOn: "2026-04-29", mood: 3 });
  assert.equal(res.status, 401);
  activeUser = USER_A;
});

test("POST /me/journal rejects empty content", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .post("/me/journal")
    .send({ occurredOn: "2026-04-29" });
  assert.equal(res.status, 400);
});

test("POST /me/journal rejects unknown properties including userId", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .post("/me/journal")
    .send({ occurredOn: "2026-04-29", mood: 3, userId: "user-b" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastCreate, null);
});

test("POST /me/journal uses authenticated user id", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .post("/me/journal")
    .send({ occurredOn: "2026-04-29", mood: 3 });
  assert.equal(res.status, 201);
  assert.equal(stub.lastCreate?.userId, USER_A.id);
});

test("GET /me/journal accepts the current month including days after UTC tomorrow", async () => {
  activeUser = USER_A;
  stub.lastList = null;
  const res = await request(app.getHttpServer())
    .get("/me/journal")
    .query({ from: "2026-11-01", to: "2026-11-30", limit: 50 });
  assert.equal(res.status, 200);
  assert.equal(stub.lastList?.userId, USER_A.id);
  assert.equal(
    (stub.lastList?.query as { from?: string; to?: string }).from,
    "2026-11-01",
  );
  assert.equal(
    (stub.lastList?.query as { from?: string; to?: string }).to,
    "2026-11-30",
  );
});

test("GET /me/journal accepts a past civil month", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .get("/me/journal")
    .query({ from: "2026-10-01", to: "2026-10-31", limit: 50 });
  assert.equal(res.status, 200);
});

test("GET /me/journal rejects inverted and malformed ranges", async () => {
  activeUser = USER_A;
  stub.lastList = null;
  const inverted = await request(app.getHttpServer())
    .get("/me/journal")
    .query({ from: "2026-11-30", to: "2026-11-01" });
  assert.equal(inverted.status, 400);
  assert.match(JSON.stringify(inverted.body), /from must be on or before to/);
  assert.equal(stub.lastList, null);

  const malformed = await request(app.getHttpServer())
    .get("/me/journal")
    .query({ from: "2026-02-30", to: "2026-02-30" });
  assert.equal(malformed.status, 400);
  assert.equal(JSON.stringify(malformed.body).includes("occurredOn"), false);
});

test("POST /me/journal rejects occurredOn after UTC tomorrow", async () => {
  activeUser = USER_A;
  stub.lastCreate = null;
  const res = await request(app.getHttpServer())
    .post("/me/journal")
    .send({ occurredOn: "2099-01-01", mood: 3 });
  assert.equal(res.status, 400);
  assert.match(
    JSON.stringify(res.body),
    /occurredOn must be a YYYY-MM-DD civil date between 1970-01-01 and UTC tomorrow/,
  );
  assert.equal(stub.lastCreate, null);
});

test("PATCH /me/journal/:id rejects occurredOn after UTC tomorrow", async () => {
  activeUser = USER_A;
  stub.lastPatch = null;
  const res = await request(app.getHttpServer())
    .patch("/me/journal/created-1")
    .send({ occurredOn: "2099-01-01" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastPatch, null);
});

test("GET /me/journal/export is registered before :id", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).get("/me/journal/export");
  assert.equal(res.status, 200);
  assert.equal(stub.lastExport?.userId, USER_A.id);
});

test("GET /me/journal/milestones is not captured by :id", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).get("/me/journal/milestones");
  assert.equal(res.status, 200);
  assert.equal(Array.isArray(res.body), true);
});

test("GET /me/journal/milestones/:id maps foreign ids to 404", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).get(
    "/me/journal/milestones/foreign-milestone",
  );
  assert.equal(res.status, 404);
  assert.equal(res.body.message, "Personal milestone not found");
  assert.equal(stub.lastMilestoneGet?.userId, USER_A.id);
});

test("GET /me/journal/:id maps missing rows to 404 without leaking owner", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).get("/me/journal/foreign-entry");
  assert.equal(res.status, 404);
  assert.equal(res.body.message, "Journal entry not found");
  assert.equal(stub.lastGet?.userId, USER_A.id);
});

test("DELETE /me/journal requires explicit confirmation", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).delete("/me/journal").send({});
  assert.equal(res.status, 400);
  assert.equal(stub.lastWipe, null);
});

test("DELETE /me/journal wipes only after confirmation and uses auth user", async () => {
  activeUser = USER_B;
  const res = await request(app.getHttpServer())
    .delete("/me/journal")
    .send({ confirm: "delete-journal" });
  assert.equal(res.status, 204);
  assert.equal(stub.lastWipe?.userId, USER_B.id);
});
