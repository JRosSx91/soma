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
import cookieParser from "cookie-parser";
import request from "supertest";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { AuthOriginGuard } from "../auth/auth-origin.guard.js";
import { AuthService } from "../auth/auth.service.js";
import { REFRESH_COOKIE_NAME } from "../auth/refresh-cookie.js";
import { currentSpecialCategoryGrantFields } from "@soma/shared-types";
import { AccountController } from "./account.controller.js";

const ORIGIN = "http://localhost:5173";
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
class StubAuthService {
  lastDelete: { userId: string; password: string } | null = null;
  lastWithdraw: { userId: string; password: string } | null = null;
  lastGrant: { userId: string; dto: Record<string, unknown> } | null = null;
  failNext: Error | null = null;

  async deleteOwnAccount(userId: string, password: string): Promise<void> {
    this.lastDelete = { userId, password };
    if (this.failNext) {
      const err = this.failNext;
      this.failNext = null;
      throw err;
    }
  }

  async grantSpecialCategoryConsent(
    userId: string,
    dto: Record<string, unknown>,
  ): Promise<void> {
    this.lastGrant = { userId, dto };
    if (this.failNext) {
      const err = this.failNext;
      this.failNext = null;
      throw err;
    }
  }

  async withdrawSpecialCategoryConsent(
    userId: string,
    password: string,
  ): Promise<void> {
    this.lastWithdraw = { userId, password };
    if (this.failNext) {
      const err = this.failNext;
      this.failNext = null;
      throw err;
    }
  }
}

let app: INestApplication;
let stub: StubAuthService;

before(async () => {
  process.env.CORS_ORIGIN = ORIGIN;
  stub = new StubAuthService();
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [AccountController],
    providers: [
      { provide: AuthService, useValue: stub },
      AuthOriginGuard,
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(TestJwtGuard)
    .compile();

  app = moduleRef.createNestApplication();
  app.use(cookieParser());
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

function deleteReq() {
  return request(app.getHttpServer()).delete("/me/account");
}

test("DELETE /me/account succeeds with JWT and Origin and clears refresh cookie", async () => {
  activeUser = USER_A;
  stub.lastDelete = null;
  const res = await deleteReq()
    .set("Origin", ORIGIN)
    .send({ password: "password123" });

  assert.equal(res.status, 204);
  assert.equal(res.text, "");
  assert.deepEqual(stub.lastDelete, {
    userId: USER_A.id,
    password: "password123",
  });
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  assert.ok(list.some((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`)));
  assert.ok(list.some((c) => /Path=\/auth/i.test(c)));
});

test("DELETE /me/account without JWT is 401", async () => {
  activeUser = null;
  const res = await deleteReq()
    .set("Origin", ORIGIN)
    .send({ password: "password123" });
  assert.equal(res.status, 401);
  activeUser = USER_A;
});

test("DELETE /me/account with extra userId is 400 and does not delete", async () => {
  activeUser = USER_A;
  stub.lastDelete = null;
  const res = await deleteReq()
    .set("Origin", ORIGIN)
    .send({ password: "password123", userId: "other-user" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastDelete, null);
});

test("DELETE /me/account from a foreign Origin is 403", async () => {
  activeUser = USER_A;
  stub.lastDelete = null;
  const res = await deleteReq()
    .set("Origin", "https://evil.example")
    .set("X-Soma-Requested-With", "soma-web")
    .send({ password: "password123" });
  assert.equal(res.status, 403);
  assert.equal(stub.lastDelete, null);
});

test("DELETE /me/account without Origin or Referer is 403", async () => {
  activeUser = USER_A;
  stub.lastDelete = null;
  const res = await deleteReq().send({ password: "password123" });
  assert.equal(res.status, 403);
  assert.equal(stub.lastDelete, null);
});

test("DELETE /me/account with wrong password is 401", async () => {
  activeUser = USER_A;
  stub.failNext = new UnauthorizedException("Invalid credentials");
  const res = await deleteReq()
    .set("Origin", ORIGIN)
    .send({ password: "nope" });
  assert.equal(res.status, 401);
  assert.equal(res.body?.email, undefined);
  assert.equal(res.body?.id, undefined);
});

function withdrawReq() {
  return request(app.getHttpServer()).post(
    "/me/account/special-category-consent/withdraw",
  );
}

test("POST withdraw succeeds with JWT and Origin and keeps the session cookie", async () => {
  activeUser = USER_A;
  stub.lastWithdraw = null;
  const res = await withdrawReq()
    .set("Origin", ORIGIN)
    .send({ password: "password123" });

  assert.equal(res.status, 204);
  assert.deepEqual(stub.lastWithdraw, {
    userId: USER_A.id,
    password: "password123",
  });
  const raw = res.headers["set-cookie"];
  assert.equal(raw, undefined);
});

test("POST withdraw without JWT is 401", async () => {
  activeUser = null;
  const res = await withdrawReq()
    .set("Origin", ORIGIN)
    .send({ password: "password123" });
  assert.equal(res.status, 401);
  activeUser = USER_A;
});

test("POST withdraw with wrong password is 401", async () => {
  activeUser = USER_A;
  stub.failNext = new UnauthorizedException("Invalid credentials");
  const res = await withdrawReq()
    .set("Origin", ORIGIN)
    .send({ password: "nope" });
  assert.equal(res.status, 401);
});

function grantReq() {
  return request(app.getHttpServer()).post(
    "/me/account/special-category-consent",
  );
}

test("POST grant succeeds with JWT and Origin and uses the JWT user id", async () => {
  activeUser = USER_A;
  stub.lastGrant = null;
  const res = await grantReq()
    .set("Origin", ORIGIN)
    .send(currentSpecialCategoryGrantFields());
  assert.equal(res.status, 204);
  assert.equal(stub.lastGrant?.userId, USER_A.id);
  assert.equal(stub.lastGrant?.dto.acceptedSpecialCategoryProcessing, true);
});

test("POST grant without JWT is 401", async () => {
  activeUser = null;
  stub.lastGrant = null;
  const res = await grantReq()
    .set("Origin", ORIGIN)
    .send(currentSpecialCategoryGrantFields());
  assert.equal(res.status, 401);
  assert.equal(stub.lastGrant, null);
  activeUser = USER_A;
});

test("POST grant with extra userId is 400 and does not grant", async () => {
  activeUser = USER_A;
  stub.lastGrant = null;
  const res = await grantReq()
    .set("Origin", ORIGIN)
    .send({ ...currentSpecialCategoryGrantFields(), userId: "other-user" });
  assert.equal(res.status, 400);
  assert.equal(stub.lastGrant, null);
});

test("POST grant rejects a false acceptance", async () => {
  activeUser = USER_A;
  stub.lastGrant = null;
  const res = await grantReq()
    .set("Origin", ORIGIN)
    .send({
      ...currentSpecialCategoryGrantFields(),
      acceptedSpecialCategoryProcessing: false,
    });
  assert.equal(res.status, 400);
  assert.equal(stub.lastGrant, null);
});
