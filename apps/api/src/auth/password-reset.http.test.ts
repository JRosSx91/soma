import "reflect-metadata";
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import {
  BadRequestException,
  INestApplication,
  Injectable,
  ValidationPipe,
} from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { ThrottlerModule } from "@nestjs/throttler";
import request from "supertest";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { PasswordResetService } from "./password-reset.service.js";
import {
  FORGOT_PASSWORD_RESPONSE,
  RESET_PASSWORD_RESPONSE,
} from "./password-reset.service.js";
import type { AuthenticatedSessionResult } from "./auth.service.js";

@Injectable()
class StubAuthService {
  async login(): Promise<AuthenticatedSessionResult> {
    throw new Error("unused");
  }
  async register(): Promise<AuthenticatedSessionResult> {
    throw new Error("unused");
  }
  async refreshFromCookie(): Promise<AuthenticatedSessionResult> {
    throw new Error("unused");
  }
  async logout(): Promise<void> {}
}

@Injectable()
class RecordingPasswordResetService {
  lastReset: { token: string; newPassword: string } | null = null;

  async requestReset() {
    return FORGOT_PASSWORD_RESPONSE;
  }

  async resetPassword(dto: { token: string; newPassword: string }) {
    if (dto.newPassword.length < 8) {
      throw new BadRequestException("should be caught by validation");
    }
    this.lastReset = dto;
    return RESET_PASSWORD_RESPONSE;
  }
}

let app: INestApplication;
let resetStub: RecordingPasswordResetService;

before(async () => {
  resetStub = new RecordingPasswordResetService();
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [AuthController],
    providers: [
      { provide: AuthService, useClass: StubAuthService },
      { provide: PasswordResetService, useValue: resetStub },
    ],
  }).compile();

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

test("POST /auth/forgot-password returns the generic body", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/forgot-password")
    .send({ email: "anyone@example.com" });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, FORGOT_PASSWORD_RESPONSE);
});

test("POST /auth/reset-password rejects short passwords via DTO", async () => {
  const res = await request(app.getHttpServer())
    .post("/auth/reset-password")
    .send({ token: "a".repeat(32), newPassword: "short" });
  assert.equal(res.status, 400);
});

test("POST /auth/reset-password accepts a valid payload shape", async () => {
  const token = "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789_-";
  const res = await request(app.getHttpServer())
    .post("/auth/reset-password")
    .send({ token, newPassword: "longenough" });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, RESET_PASSWORD_RESPONSE);
  assert.equal(resetStub.lastReset?.token, token);
});
