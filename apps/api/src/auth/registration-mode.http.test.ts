import "reflect-metadata";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import request from "supertest";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetService } from "./password-reset.service.js";

async function appWithMode(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useValue: {} },
      { provide: PasswordResetService, useValue: {} },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

const prevMode = process.env.AUTH_REGISTRATION_MODE;
const prevNode = process.env.NODE_ENV;

afterEach(() => {
  if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
  else process.env.AUTH_REGISTRATION_MODE = prevMode;
  if (prevNode === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = prevNode;
});

test("GET /auth/registration-mode returns invite from real config", async () => {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REGISTRATION_MODE = "invite";
  const app = await appWithMode();
  const res = await request(app.getHttpServer()).get("/auth/registration-mode");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { mode: "invite" });
  assert.equal("AUTH_REGISTRATION_MODE" in res.body, false);
  await app.close();
});

test("GET /auth/registration-mode returns open in a permitted environment", async () => {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REGISTRATION_MODE = "open";
  const app = await appWithMode();
  const res = await request(app.getHttpServer()).get("/auth/registration-mode");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { mode: "open" });
  await app.close();
});

test("GET /auth/registration-mode does not invent invite when config is invalid", async () => {
  process.env.NODE_ENV = "test";
  process.env.AUTH_REGISTRATION_MODE = "closed";
  const app = await appWithMode();
  const res = await request(app.getHttpServer()).get("/auth/registration-mode");
  assert.equal(res.status, 503);
  assert.notEqual(res.body.mode, "invite");
  assert.notEqual(res.body.mode, "open");
  await app.close();
});
