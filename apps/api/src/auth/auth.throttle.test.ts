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
import request from "supertest";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import type { AuthenticatedResponse } from "./auth.service.js";
import { AUTH_LOGIN_THROTTLE, AUTH_REGISTER_THROTTLE } from "./auth-throttle.js";

@Injectable()
class StubAuthService {
  login(): never {
    throw new UnauthorizedException("Invalid credentials");
  }

  register(): AuthenticatedResponse {
    return {
      accessToken: "test-token",
      user: { id: "u1", email: "new@example.com", displayName: "New" },
    };
  }
}

let app: INestApplication;

before(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [
      ThrottlerModule.forRoot([
        {
          ttl: 60_000,
          limit: 1_000,
        },
      ]),
    ],
    controllers: [AuthController],
    providers: [{ provide: AuthService, useClass: StubAuthService }],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // Probe routes registered before init so they sit outside AuthController
  // throttling (avoids Nest decorators inside this tsx test file).
  app.use("/health", (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) => {
    res.status(200).json({ status: "ok" });
  });
  app.use("/me/profile", (_req: unknown, res: { status: (n: number) => { json: (b: unknown) => void } }) => {
    res.status(200).json({ user: { id: "u1" }, usages: [] });
  });

  await app.init();
});

after(async () => {
  await app.close();
});

test("login returns 401 for bad credentials before the limit is exhausted", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/login")
    .send({ email: "user@example.com", password: "wrong" });

  assert.equal(res.status, 401);
  assert.equal(res.body.message, "Invalid credentials");
});

test("login returns 429 after the configured attempt budget", async () => {
  const server = app.getHttpServer();
  for (let i = 1; i < AUTH_LOGIN_THROTTLE.limit; i += 1) {
    const res = await request(server)
      .post("/auth/login")
      .send({ email: `user${i}@example.com`, password: "wrong" });
    assert.equal(res.status, 401, `attempt ${i + 1} should still be 401`);
  }

  const blocked = await request(server)
    .post("/auth/login")
    .send({ email: "blocked@example.com", password: "wrong" });

  assert.equal(blocked.status, 429);
  assert.equal(typeof blocked.body.message, "string");
  assert.doesNotMatch(String(blocked.body.message), /password|secret|token/i);
});

test("register budget stays independent after login is already exhausted", async () => {
  const server = app.getHttpServer();
  // Previous tests already exhausted login. Register must still allow its
  // full independent budget (proves handler-scoped throttler keys).
  for (let i = 0; i < AUTH_REGISTER_THROTTLE.limit; i += 1) {
    const res = await request(server)
      .post("/auth/register")
      .send({
        email: `fresh${i}@example.com`,
        password: "password123",
        displayName: "Fresh",
        biologicalSex: "male",
        birthYear: 1990,
      });
    assert.equal(res.status, 201, `register attempt ${i + 1}`);
  }

  const blocked = await request(server)
    .post("/auth/register")
    .send({
      email: "overflow@example.com",
      password: "password123",
      displayName: "Overflow",
      biologicalSex: "male",
      birthYear: 1990,
    });

  assert.equal(blocked.status, 429);
});

test("unrelated endpoints are not covered by auth ThrottlerGuard", async () => {
  const server = app.getHttpServer();
  for (let i = 0; i < AUTH_LOGIN_THROTTLE.limit + 3; i += 1) {
    const health = await request(server).get("/health");
    assert.equal(health.status, 200);

    const profile = await request(server).get("/me/profile");
    assert.equal(profile.status, 200);
  }
});
