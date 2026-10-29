import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
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
import request from "supertest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { FeedbackController } from "./feedback.controller.js";
import { FeedbackService } from "./feedback.service.js";

const BODY = "The save button does nothing after I write a note.";

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

let activeUser: typeof USER_A | null = USER_A;
let token: string | null = "valid";

@Injectable()
class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user: typeof USER_A;
    }>();
    const header = req.headers.authorization;
    if (!header) throw new UnauthorizedException();
    if (header !== "Bearer valid") throw new UnauthorizedException();
    if (!activeUser) throw new UnauthorizedException();
    req.user = activeUser;
    return true;
  }
}

const SAMPLE = {
  id: "fb-1",
  category: "bug",
  title: "Save fails",
  body: BODY,
  status: "open",
  createdAt: "2026-10-29T12:00:00.000Z",
  updatedAt: "2026-10-29T12:00:00.000Z",
};

@Injectable()
class RecordingFeedbackService {
  lastCreate: { userId: string; dto: unknown } | null = null;
  lastList: { userId: string } | null = null;
  nextCreated = true;

  async create(userId: string, dto: unknown) {
    this.lastCreate = { userId, dto };
    return { created: this.nextCreated, item: SAMPLE };
  }

  async list(userId: string) {
    this.lastList = { userId };
    return { items: [SAMPLE], nextCursor: null };
  }
}

let app: INestApplication;
let stub: RecordingFeedbackService;

before(async () => {
  stub = new RecordingFeedbackService();
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [FeedbackController],
    providers: [{ provide: FeedbackService, useValue: stub }],
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

function auth() {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

test("POST /me/feedback requires a JWT", async () => {
  token = null;
  const res = await request(app.getHttpServer())
    .post("/me/feedback")
    .send({ category: "bug", title: "Save fails", body: BODY });
  assert.equal(res.status, 401);
  token = "valid";
});

test("POST /me/feedback rejects an invalid JWT", async () => {
  token = "nope";
  const res = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({ category: "bug", title: "Save fails", body: BODY });
  assert.equal(res.status, 401);
  token = "valid";
});

test("GET /me/feedback requires a JWT", async () => {
  token = null;
  const res = await request(app.getHttpServer()).get("/me/feedback");
  assert.equal(res.status, 401);
  token = "valid";
});

test("POST /me/feedback rejects extra properties including userId and status", async () => {
  stub.lastCreate = null;
  const res = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({
      category: "bug",
      title: "Save fails",
      body: BODY,
      userId: "user-b",
      status: "resolved",
      fingerprint: "abc",
    });
  assert.equal(res.status, 400);
  assert.equal(stub.lastCreate, null);
});

test("POST /me/feedback rejects unknown categories and short fields", async () => {
  const badCategory = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({ category: "feature", title: "Save fails", body: BODY });
  assert.equal(badCategory.status, 400);
  const short = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({ category: "bug", title: "Hi", body: "too short" });
  assert.equal(short.status, 400);
});

test("POST /me/feedback uses the session user and returns 201", async () => {
  stub.nextCreated = true;
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({ category: "bug", title: "Save fails", body: BODY });
  assert.equal(res.status, 201);
  assert.equal(stub.lastCreate?.userId, USER_A.id);
  assert.equal(res.body.userId, undefined);
  assert.equal(res.body.fingerprint, undefined);
});

test("POST /me/feedback returns 200 when the service reports a duplicate", async () => {
  stub.nextCreated = false;
  const res = await request(app.getHttpServer())
    .post("/me/feedback")
    .set(auth())
    .send({ category: "bug", title: "Save fails", body: BODY });
  assert.equal(res.status, 200);
  assert.equal(res.body.id, SAMPLE.id);
  stub.nextCreated = true;
});

test("GET /me/feedback lists only the authenticated user scope", async () => {
  const res = await request(app.getHttpServer())
    .get("/me/feedback")
    .set(auth());
  assert.equal(res.status, 200);
  assert.equal(stub.lastList?.userId, USER_A.id);
  assert.equal(res.body.nextCursor, null);
  assert.equal(res.body.items[0].fingerprint, undefined);
});
