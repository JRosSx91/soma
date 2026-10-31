/**
 * Live PostgreSQL persistence and cascade for registration acceptances.
 * Skips when DATABASE_URL is unset, not local, or the table is missing.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import { currentRegisterClientFields } from "@soma/shared-types";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuthService } from "./auth.service.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import { createId } from "./create-id.js";

function loadLocalEnvFile(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(process.cwd(), ".env"), join(here, "../../.env")];
  for (const path of candidates) {
    if (!existsSync(path)) continue;
    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
    break;
  }
}

function isLocalPostgresUrl(raw: string): boolean {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return false;
  }
  const host = url.hostname.toLowerCase();
  const allowed = new Set([
    "localhost",
    "127.0.0.1",
    "::1",
    "host.docker.internal",
  ]);
  if (!allowed.has(host)) return false;
  const blocked =
    /prod|staging|amazonaws|neon\.tech|supabase|railway|render\.com|heroku|fly\.io/;
  return !blocked.test(raw.toLowerCase());
}

test("register persists terms and privacy without a health grant and user delete cascades them", async (t) => {
  loadLocalEnvFile();
  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) {
    t.skip("DATABASE_URL is unset");
    return;
  }
  if (!isLocalPostgresUrl(databaseUrl)) {
    t.skip("DATABASE_URL is not a local development database");
    return;
  }

  const prisma = new PrismaClient();
  const prevMode = process.env.AUTH_REGISTRATION_MODE;
  process.env.AUTH_REGISTRATION_MODE = "open";

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "purpose" FROM "RegistrationAcceptance" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
    t.skip("RegistrationAcceptance table is not available");
    return;
  }

  const users = new UsersService(prisma as unknown as PrismaService);
  const refresh = new RefreshSessionService(prisma as unknown as PrismaService);
  const jwt = {
    sign: (payload: unknown) => `pg-token:${JSON.stringify(payload)}`,
  };
  const service = new AuthService(
    users,
    jwt as unknown as JwtService,
    refresh,
    prisma as unknown as PrismaService,
    new RegistrationInviteService(),
  );

  const id = createId();
  const email = `accept-${id}@example.test`;
  let userId = "";

  try {
    const result = await service.register({
      email,
      password: "password123",
      displayName: "Accept",
      biologicalSex: "male",
      ...currentRegisterClientFields(),
    });
    userId = result.user.id;
    assert.equal(result.user.email, email);

    const rows = await prisma.registrationAcceptance.findMany({
      where: { userId },
    });
    assert.equal(rows.length, 3);
    const purposes = new Set(rows.map((row) => row.purpose));
    assert.deepEqual(
      [...purposes].sort(),
      ["adult_age_declaration", "privacy_notice", "terms_of_use"],
    );
    assert.equal(purposes.has("special_category_processing"), false);
    for (const row of rows) {
      assert.equal(row.userId, userId);
      assert.equal(row.documentVersion.startsWith("draft-"), true);
      assert.ok(row.acceptedAt instanceof Date);
    }

    await prisma.user.delete({ where: { id: userId } });
    const leftover = await prisma.registrationAcceptance.findMany({
      where: { userId },
    });
    assert.equal(leftover.length, 0);
    userId = "";
  } finally {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
  }
});
