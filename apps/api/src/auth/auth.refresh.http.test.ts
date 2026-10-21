import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  INestApplication,
  Injectable,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedSessionResult } from "./auth.service.js";
import { AuthOriginGuard } from "./auth-origin.guard.js";
import { REFRESH_COOKIE_NAME } from "./refresh-cookie.js";
import { PasswordResetService } from "./password-reset.service.js";
import {
  FORGOT_PASSWORD_RESPONSE,
  RESET_PASSWORD_RESPONSE,
} from "./password-reset.service.js";

const ORIGIN = "http://localhost:5173";

@Injectable()
class StubAuthService {
  private sessions = new Map<string, string>();
  private seq = 0;

  async login(): Promise<AuthenticatedSessionResult> {
    return this.issue("user-1", "user@example.com");
  }

  async register(): Promise<AuthenticatedSessionResult> {
    return this.issue("user-2", "new@example.com");
  }

  async refreshFromCookie(
    plaintext: string | undefined,
  ): Promise<AuthenticatedSessionResult> {
    if (!plaintext || !this.sessions.has(plaintext)) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    this.sessions.delete(plaintext);
    return this.issue("user-1", "user@example.com");
  }

  async logout(plaintext: string | undefined): Promise<void> {
    if (plaintext) this.sessions.delete(plaintext);
  }

  private issue(id: string, email: string): AuthenticatedSessionResult {
    this.seq += 1;
    const plaintext = `rt-${id}-${this.seq}`;
    this.sessions.set(plaintext, id);
    return {
      accessToken: `access-${id}`,
      user: { id, email, displayName: "User" },
      refresh: {
        plaintext,
        familyId: `family-${id}`,
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    };
  }
}

@Injectable()
class StubPasswordResetService {
  async requestReset() {
    return FORGOT_PASSWORD_RESPONSE;
  }

  async resetPassword() {
    return RESET_PASSWORD_RESPONSE;
  }
}

let app: INestApplication;

before(async () => {
  process.env.CORS_ORIGIN = ORIGIN;
  const moduleRef = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }]),
    ],
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useClass: StubAuthService },
      { provide: PasswordResetService, useClass: StubPasswordResetService },
      AuthOriginGuard,
    ],
  }).compile();

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

function cookieValue(res: request.Response, name: string): string | undefined {
  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  for (const entry of list) {
    if (entry.startsWith(`${name}=`)) {
      return entry.split(";")[0]!.slice(name.length + 1);
    }
  }
  return undefined;
}

test("login sets an HttpOnly refresh cookie and keeps JSON contract", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email: "user@example.com", password: "password123" });

  assert.equal(res.status, 200);
  assert.equal(typeof res.body.accessToken, "string");
  assert.equal(res.body.user.email, "user@example.com");
  assert.equal(res.body.refresh, undefined);

  const raw = res.headers["set-cookie"];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  assert.ok(list.some((c) => c.startsWith(`${REFRESH_COOKIE_NAME}=`)));
  assert.ok(list.some((c) => /HttpOnly/i.test(c)));
  assert.ok(list.some((c) => /Path=\/auth/i.test(c)));
});

test("register also sets a refresh cookie", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/register")
    .send({
      email: "fresh@example.com",
      password: "password123",
      displayName: "Fresh",
      biologicalSex: "male",
      birthYear: 1990,
    });
  assert.equal(res.status, 201);
  assert.ok(cookieValue(res, REFRESH_COOKIE_NAME));
});

test("refresh rotates cookie when Origin is allowed", async () => {
  const login = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email: "user@example.com", password: "password123" });
  const refresh = cookieValue(login, REFRESH_COOKIE_NAME);
  assert.ok(refresh);

  const res = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("Origin", ORIGIN)
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${refresh}`);

  assert.equal(res.status, 200);
  assert.equal(typeof res.body.accessToken, "string");
  const next = cookieValue(res, REFRESH_COOKIE_NAME);
  assert.ok(next);
  assert.notEqual(next, refresh);
});

test("refresh without cookie returns 401", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("Origin", ORIGIN);
  assert.equal(res.status, 401);
});

test("refresh from foreign Origin is forbidden", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("Origin", "https://evil.example")
    .set("Cookie", `${REFRESH_COOKIE_NAME}=whatever`);
  assert.equal(res.status, 403);
});

test("foreign Origin cannot bypass CSRF with X-Soma-Requested-With", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("Origin", "https://evil.example")
    .set("X-Soma-Requested-With", "soma-web")
    .set("Cookie", `${REFRESH_COOKIE_NAME}=whatever`);
  assert.equal(res.status, 403);
});

test("refresh without Origin or Referer is forbidden", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/refresh")
    .set("X-Soma-Requested-With", "soma-web")
    .set("Cookie", `${REFRESH_COOKIE_NAME}=whatever`);
  assert.equal(res.status, 403);
});

test("logout clears cookie and is idempotent", async () => {
  const login = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email: "user@example.com", password: "password123" });
  const refresh = cookieValue(login, REFRESH_COOKIE_NAME);

  const first = await request(app.getHttpServer())
    .post("/auth/logout")
    .set("Origin", ORIGIN)
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${refresh}`);
  assert.equal(first.status, 200);
  assert.equal(first.body.ok, true);

  const second = await request(app.getHttpServer())
    .post("/auth/logout")
    .set("Origin", ORIGIN);
  assert.equal(second.status, 200);
  assert.equal(second.body.ok, true);
});
