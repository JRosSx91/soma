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
import { JournalController } from "./journal.controller.js";
import {
  JOURNAL_EXPORT_THROTTLE,
  JOURNAL_WIPE_THROTTLE,
} from "./journal-throttle.js";
import { JournalService } from "./journal.service.js";

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
class StubJournalService {
  async exportAll() {
    return {
      exportedAt: "2026-04-29T00:00:00.000Z",
      entries: [{ id: "e1", title: "secret-title", body: "secret-body" }],
    };
  }

  async wipeAll(): Promise<void> {
    return;
  }

  async list() {
    return { items: [], nextCursor: null };
  }
}

let app: INestApplication;

before(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 1_000 }])],
    controllers: [JournalController],
    providers: [{ provide: JournalService, useClass: StubJournalService }],
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

test("GET /me/journal/export returns 429 after its attempt budget", async () => {
  const server = app.getHttpServer();
  for (let i = 0; i < JOURNAL_EXPORT_THROTTLE.limit; i += 1) {
    const res = await request(server).get("/me/journal/export").set(auth());
    assert.equal(res.status, 200, `export attempt ${i + 1}`);
  }
  const blocked = await request(server).get("/me/journal/export").set(auth());
  assert.equal(blocked.status, 429);
  const payload = JSON.stringify(blocked.body);
  assert.equal(payload.includes("secret-title"), false);
  assert.equal(payload.includes("secret-body"), false);
});

test("DELETE /me/journal wipe budget stays independent after export is exhausted", async () => {
  const server = app.getHttpServer();
  for (let i = 0; i < JOURNAL_WIPE_THROTTLE.limit; i += 1) {
    const res = await request(server)
      .delete("/me/journal")
      .set(auth())
      .send({ confirm: "delete-journal" });
    assert.equal(res.status, 204, `wipe attempt ${i + 1}`);
  }
  const blocked = await request(server)
    .delete("/me/journal")
    .set(auth())
    .send({ confirm: "delete-journal" });
  assert.equal(blocked.status, 429);
  const payload = JSON.stringify(blocked.body);
  assert.equal(payload.includes("secret-title"), false);
  assert.equal(payload.includes("secret-body"), false);
});

test("GET /me/journal list is not covered by export ThrottlerGuard", async () => {
  const res = await request(app.getHttpServer())
    .get("/me/journal")
    .set(auth());
  assert.equal(res.status, 200);
});
