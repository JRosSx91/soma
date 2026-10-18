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
import { OnboardingStatus } from "@prisma/client";
import request from "supertest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ProfileController } from "./profile.controller.js";
import { ProfileService } from "./profile.service.js";

const USER_A = {
  id: "user-a",
  email: "a@example.test",
  displayName: "A",
  biologicalSex: "male" as const,
  birthYear: 1990,
  weightKg: null,
  onboardingStatus: OnboardingStatus.pending,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const USER_B = {
  ...USER_A,
  id: "user-b",
  email: "b@example.test",
  displayName: "B",
};

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
class RecordingProfileService {
  lastGetId: string | null = null;
  lastUpsert: { userId: string; usagesLen: number } | null = null;
  lastStatus: { userId: string; status: OnboardingStatus } | null = null;
  statusByUser = new Map<string, OnboardingStatus>([
    [USER_A.id, OnboardingStatus.pending],
    [USER_B.id, OnboardingStatus.completed],
  ]);

  async getProfile(userId: string) {
    this.lastGetId = userId;
    return {
      user: {
        id: userId,
        email: `${userId}@example.test`,
        displayName: "X",
        biologicalSex: "male",
        birthYear: 1990,
        weightKg: null,
      },
      onboardingStatus:
        this.statusByUser.get(userId) ?? OnboardingStatus.pending,
      usages: [],
    };
  }

  async upsertProfile(userId: string, dto: { usages: unknown[] }) {
    this.lastUpsert = { userId, usagesLen: dto.usages.length };
    return this.getProfile(userId);
  }

  async updateOnboardingStatus(userId: string, status: OnboardingStatus) {
    this.lastStatus = { userId, status };
    this.statusByUser.set(userId, status);
    return this.getProfile(userId);
  }
}

let app: INestApplication;
let stub: RecordingProfileService;

before(async () => {
  stub = new RecordingProfileService();
  const moduleRef = await Test.createTestingModule({
    controllers: [ProfileController],
    providers: [{ provide: ProfileService, useValue: stub }],
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

test("GET /me/profile returns onboardingStatus for the authenticated user", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer()).get("/me/profile");
  assert.equal(res.status, 200);
  assert.equal(res.body.onboardingStatus, OnboardingStatus.pending);
  assert.equal(stub.lastGetId, USER_A.id);
});

test("GET /me/profile without auth returns 401", async () => {
  activeUser = null;
  const res = await request(app.getHttpServer()).get("/me/profile");
  assert.equal(res.status, 401);
});

test("PATCH /me/profile/onboarding-status updates for the caller only", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/onboarding-status")
    .send({ status: "skipped" });
  assert.equal(res.status, 200);
  assert.equal(res.body.onboardingStatus, OnboardingStatus.skipped);
  assert.deepEqual(stub.lastStatus, {
    userId: USER_A.id,
    status: OnboardingStatus.skipped,
  });

  activeUser = USER_B;
  const resB = await request(app.getHttpServer()).get("/me/profile");
  assert.equal(resB.body.onboardingStatus, OnboardingStatus.completed);
  assert.equal(stub.lastGetId, USER_B.id);
});

test("PATCH /me/profile/onboarding-status rejects invalid enum", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/onboarding-status")
    .send({ status: "not-a-status" });
  assert.equal(res.status, 400);
});

test("PUT /me/profile still accepts usages payload (no regression)", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .put("/me/profile")
    .send({
      usages: [
        {
          substanceId: "nicotine",
          yearStarted: 2020,
          frequency: "daily",
          status: "abstinent",
          lastUseDate: "2024-01-01",
        },
      ],
    });
  assert.equal(res.status, 200);
  assert.deepEqual(stub.lastUpsert, { userId: USER_A.id, usagesLen: 1 });
  assert.ok("onboardingStatus" in res.body);
});

test("PUT /me/profile rejects body without usages (must not clear silently)", async () => {
  activeUser = USER_A;
  stub.lastUpsert = null;
  const res = await request(app.getHttpServer()).put("/me/profile").send({});
  assert.equal(res.status, 400);
  assert.equal(stub.lastUpsert, null);
});

test("PUT /me/profile rejects usages: null (must not coerce to [])", async () => {
  activeUser = USER_A;
  stub.lastUpsert = null;
  const res = await request(app.getHttpServer())
    .put("/me/profile")
    .send({ usages: null });
  assert.equal(res.status, 400);
  assert.equal(stub.lastUpsert, null);
});

test("PUT /me/profile accepts usages: [] as explicit clear", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .put("/me/profile")
    .send({ usages: [] });
  assert.equal(res.status, 200);
  assert.deepEqual(stub.lastUpsert, { userId: USER_A.id, usagesLen: 0 });
});
