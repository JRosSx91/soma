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
import { FEEDBACK_POST_THROTTLE } from "./feedback-throttle.js";
import { FeedbackService } from "./feedback.service.js";

const BODY = "The save button does nothing after I write a note.";

const USER = {
  id: "user-throttle",
  email: "throttle@example.test",
  displayName: "T",
  biologicalSex: "male" as const,
  birthYear: 1990,
  weightKg: null,
  onboardingStatus: "pending",
  createdAt: new Date(),
  updatedAt: new Date(),
};

@Injectable()
class TestJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<{ user: typeof USER }>();
    if (!req.headers.authorization) {
      throw new UnauthorizedException();
    }
    req.user = USER;
    return true;
  }
}

@Injectable()
class StubFeedbackService {
  async create() {
    return {
      created: true,
      item: {
        id: "fb-1",
        category: "bug",
        title: "Save fails",
        body: BODY,
        status: "open",
        createdAt: "2026-10-29T12:00:00.000Z",
        updatedAt: "2026-10-29T12:00:00.000Z",
      },
    };
  }

  async list() {
    return { items: [], nextCursor: null };
  }
}

let app: INestApplication;

before(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [FeedbackController],
    providers: [{ provide: FeedbackService, useClass: StubFeedbackService }],
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
  return { Authorization: "Bearer test" };
}

test("POST /me/feedback returns 429 after its attempt budget", async () => {
  const server = app.getHttpServer();
  for (let i = 0; i < FEEDBACK_POST_THROTTLE.limit; i += 1) {
    const res = await request(server)
      .post("/me/feedback")
      .set(auth())
      .send({ category: "bug", title: `Save fails ${i}`, body: BODY });
    assert.equal(res.status, 201, `post attempt ${i + 1}`);
  }
  const blocked = await request(server)
    .post("/me/feedback")
    .set(auth())
    .send({ category: "bug", title: "Save fails extra", body: BODY });
  assert.equal(blocked.status, 429);
  const payload = JSON.stringify(blocked.body);
  assert.equal(payload.includes(BODY), false);
});

test("GET /me/feedback is not covered by the POST ThrottlerGuard", async () => {
  const res = await request(app.getHttpServer())
    .get("/me/feedback")
    .set(auth());
  assert.equal(res.status, 200);
});
