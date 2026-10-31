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
  lastDetails: { userId: string; dto: Record<string, unknown> } | null = null;
  statusByUser = new Map<string, OnboardingStatus>([
    [USER_A.id, OnboardingStatus.pending],
    [USER_B.id, OnboardingStatus.completed],
  ]);
  detailsByUser = new Map<
    string,
    {
      displayName: string;
      biologicalSex: string;
      birthYear: number;
      weightKg: number | null;
    }
  >([
    [
      USER_A.id,
      {
        displayName: "A",
        biologicalSex: "male",
        birthYear: 1990,
        weightKg: null,
      },
    ],
    [
      USER_B.id,
      {
        displayName: "B",
        biologicalSex: "male",
        birthYear: 1990,
        weightKg: null,
      },
    ],
  ]);

  async getProfile(userId: string) {
    this.lastGetId = userId;
    const details = this.detailsByUser.get(userId) ?? {
      displayName: "X",
      biologicalSex: "male",
      birthYear: 1990,
      weightKg: null,
    };
    return {
      user: {
        id: userId,
        email: `${userId}@example.test`,
        ...details,
      },
      onboardingStatus:
        this.statusByUser.get(userId) ?? OnboardingStatus.pending,
      specialCategoryConsentActive: true,
      specialCategoryConsentWithdrawn: false,
      usages: [],
    };
  }

  async upsertProfile(userId: string, dto: { usages: unknown[] }) {
    this.lastUpsert = { userId, usagesLen: dto.usages.length };
    return this.getProfile(userId);
  }

  async updateProfileDetails(
    userId: string,
    dto: Record<string, unknown>,
  ) {
    this.lastDetails = { userId, dto };
    const current = this.detailsByUser.get(userId) ?? {
      displayName: "X",
      biologicalSex: "male",
      birthYear: 1990,
      weightKg: null as number | null,
    };
    this.detailsByUser.set(userId, {
      displayName:
        dto.displayName !== undefined
          ? (dto.displayName as string)
          : current.displayName,
      biologicalSex:
        dto.biologicalSex !== undefined
          ? (dto.biologicalSex as string)
          : current.biologicalSex,
      birthYear:
        dto.birthYear !== undefined
          ? (dto.birthYear as number)
          : current.birthYear,
      weightKg:
        dto.weightKg !== undefined
          ? (dto.weightKg as number | null)
          : current.weightKg,
    });
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

test("PATCH /me/profile/details updates fields for the caller", async () => {
  activeUser = USER_A;
  const statusBefore =
    stub.statusByUser.get(USER_A.id) ?? OnboardingStatus.pending;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ displayName: "Alice", weightKg: 65 });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.displayName, "Alice");
  assert.equal(res.body.user.weightKg, 65);
  assert.equal(stub.lastDetails?.userId, USER_A.id);
  // Details PATCH must not change onboarding intent.
  assert.equal(res.body.onboardingStatus, statusBefore);
});

test("PATCH /me/profile/details without auth returns 401", async () => {
  activeUser = null;
  stub.lastDetails = null;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ displayName: "Nope" });
  assert.equal(res.status, 401);
  assert.equal(stub.lastDetails, null);
});

test("PATCH /me/profile/details rejects unauthorized fields", async () => {
  activeUser = USER_A;
  stub.lastDetails = null;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ displayName: "Ok", email: "hacked@example.test" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastDetails, null);
});

test("PATCH /me/profile/details rejects onboardingStatus in body", async () => {
  activeUser = USER_A;
  stub.lastDetails = null;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ onboardingStatus: "completed" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastDetails, null);
});

test("PATCH /me/profile/details rejects invalid birthYear", async () => {
  activeUser = USER_A;
  stub.lastDetails = null;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ birthYear: 1800 });
  assert.equal(res.status, 400);
  assert.equal(stub.lastDetails, null);
});

test("PATCH /me/profile/details allows clearing weightKg with null", async () => {
  activeUser = USER_A;
  await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ weightKg: 70 });
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ weightKg: null });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.weightKg, null);
});

test("PATCH /me/profile/details isolates callers", async () => {
  activeUser = USER_A;
  await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ displayName: "OnlyA" });

  activeUser = USER_B;
  const resB = await request(app.getHttpServer()).get("/me/profile");
  assert.equal(resB.body.user.displayName, "B");
});

test("PATCH /me/profile/details rejects empty body", async () => {
  activeUser = USER_A;
  stub.lastDetails = null;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({});
  assert.equal(res.status, 400);
  assert.equal(stub.lastDetails, null);
});

test("PATCH /me/profile/details accepts decimal weightKg 68.5", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ weightKg: 68.5 });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.weightKg, 68.5);
});

test("PATCH /me/profile/details response omits secrets", async () => {
  activeUser = USER_A;
  const res = await request(app.getHttpServer())
    .patch("/me/profile/details")
    .send({ displayName: "Safe" });
  assert.equal(res.status, 200);
  assert.equal("hashedPassword" in res.body, false);
  assert.equal("hashedPassword" in (res.body.user ?? {}), false);
  assert.equal("passwordHash" in (res.body.user ?? {}), false);
  assert.equal("refreshTokens" in res.body, false);
  assert.ok(res.body.user?.email);
  assert.ok("onboardingStatus" in res.body);
  assert.ok(Array.isArray(res.body.usages));
});
