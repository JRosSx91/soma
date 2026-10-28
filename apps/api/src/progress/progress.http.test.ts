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
import request from "supertest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ProgressController } from "./progress.controller.js";
import { ProgressService } from "./progress.service.js";

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
class RecordingProgressService {
  lastGetId: string | null = null;
  awardCalls = 0;

  async getMine(userId: string) {
    this.lastGetId = userId;
    return {
      totalXp: userId === USER_A.id ? 70 : 0,
      level: userId === USER_A.id ? 2 : 1,
      xpIntoLevel: 0,
      xpToNextLevel: userId === USER_A.id ? 130 : 70,
      xpForNextLevel: userId === USER_A.id ? 130 : 70,
      percentToNextLevel: 0,
      unlockedTitleIds: ["walker"],
      equippedTitleId: "walker",
    };
  }
}

let app: INestApplication;
let stub: RecordingProgressService;

before(async () => {
  stub = new RecordingProgressService();
  const moduleRef = await Test.createTestingModule({
    controllers: [ProgressController],
    providers: [{ provide: ProgressService, useValue: stub }],
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

function http() {
  return request(app.getHttpServer());
}

test("GET /me/progress without JWT is 401", async () => {
  activeUser = null;
  const res = await http().get("/me/progress");
  assert.equal(res.status, 401);
  assert.equal(stub.lastGetId, null);
  activeUser = USER_A;
});

test("GET /me/progress uses the authenticated user only", async () => {
  activeUser = USER_A;
  const a = await http().get("/me/progress");
  assert.equal(a.status, 200);
  assert.equal(stub.lastGetId, USER_A.id);
  assert.equal(a.body.totalXp, 70);
  assert.equal(a.body.level, 2);
  assert.equal(a.body.equippedTitleId, "walker");

  activeUser = USER_B;
  const b = await http().get("/me/progress");
  assert.equal(b.status, 200);
  assert.equal(stub.lastGetId, USER_B.id);
  assert.equal(b.body.totalXp, 0);
  assert.equal(b.body.level, 1);
  assert.equal(JSON.stringify(b.body).includes("user-a"), false);
});

test("GET /me/progress does not expose an award route", async () => {
  activeUser = USER_A;
  const post = await http().post("/me/progress").send({ amount: 12 });
  assert.equal(post.status, 404);
  assert.equal(stub.awardCalls, 0);
});
