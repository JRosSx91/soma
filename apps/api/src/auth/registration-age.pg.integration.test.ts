/**
 * Live PostgreSQL: adult-age registration gate.
 * Skips when DATABASE_URL is unset, not local, or the schema is missing.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { JwtService } from "@nestjs/jwt";
import { PrismaClient } from "@prisma/client";
import {
  civilDateInTimeZone,
  currentRegisterClientFields,
  daysInMonth,
  formatIsoCivilDate,
  type CivilDate,
} from "@soma/shared-types";
import { UsersService } from "../users/users.service.js";
import { PrismaService } from "../prisma/prisma.service.js";
import { AuthService } from "./auth.service.js";
import { RefreshSessionService } from "./refresh-session.service.js";
import { RegistrationInviteService } from "./registration-invite.service.js";
import { createId } from "./create-id.js";
import { CodedBadRequestException } from "../common/exceptions/coded-exception.js";
import {
  AUTH_AGE_RESTRICTED_CODE,
  AUTH_BIRTH_DATE_INVALID_CODE,
} from "./registration-age.js";

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

function addOneCivilDay(date: CivilDate): CivilDate {
  const last = daysInMonth(date.year, date.month);
  if (date.day < last) return { year: date.year, month: date.month, day: date.day + 1 };
  if (date.month < 12) return { year: date.year, month: date.month + 1, day: 1 };
  return { year: date.year + 1, month: 1, day: 1 };
}

function yearsAgoSameDay(today: CivilDate, years: number): CivilDate {
  const year = today.year - years;
  const last = daysInMonth(year, today.month);
  return {
    year,
    month: today.month,
    day: Math.min(today.day, last),
  };
}

test("pg: adult-age register stores year only and rejects minors", async (t) => {
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
  const createdIds: string[] = [];

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "birthYear" FROM "User" LIMIT 0`;
    await prisma.$queryRaw`SELECT "purpose" FROM "RegistrationAcceptance" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
    t.skip("User or RegistrationAcceptance table is not available");
    return;
  }

  const columns = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'User'
  `;
  const columnNames = columns.map((row) => row.column_name);
  assert.equal(columnNames.includes("birthYear"), true);
  assert.equal(columnNames.includes("birthDate"), false);
  assert.equal(columnNames.includes("birthMonth"), false);
  assert.equal(columnNames.includes("birthDay"), false);
  assert.equal(columnNames.includes("dateOfBirth"), false);

  const users = new UsersService(prisma as unknown as PrismaService);
  const refresh = new RefreshSessionService(prisma as unknown as PrismaService);
  const jwt = {
    sign: (payload: unknown) => `pg-age:${JSON.stringify(payload)}`,
  };
  const service = new AuthService(
    users,
    jwt as unknown as JwtService,
    refresh,
    prisma as unknown as PrismaService,
    new RegistrationInviteService(),
  );
  const gates = currentRegisterClientFields();
  const today = civilDateInTimeZone(new Date());
  const eighteenthToday = yearsAgoSameDay(today, 18);
  const eighteenthTomorrow = addOneCivilDay(eighteenthToday);
  const minor = yearsAgoSameDay(today, 16);

  async function registerWithDate(birthDate: string, label: string) {
    const result = await service.register({
      email: `age-${label}-${createId()}@example.test`,
      password: "password123",
      displayName: `Age ${label}`,
      biologicalSex: "female",
      ...gates,
      birthDate,
    });
    createdIds.push(result.user.id);
    return result;
  }

  try {
    const adult = await registerWithDate("1990-06-15", "adult");
    const adultRow = await prisma.user.findUniqueOrThrow({
      where: { id: adult.user.id },
    });
    assert.equal(adultRow.birthYear, 1990);
    assert.equal("birthDate" in adultRow, false);
    const adultJson = JSON.stringify(adultRow);
    assert.equal(adultJson.includes("1990-06-15"), false);
    assert.equal(adultJson.includes("06-15"), false);

    const adultAccept = await prisma.registrationAcceptance.findMany({
      where: { userId: adult.user.id },
    });
    const adultPurposes = adultAccept.map((row) => row.purpose).sort();
    assert.deepEqual(adultPurposes, [
      "adult_age_declaration",
      "privacy_notice",
      "terms_of_use",
    ]);
    assert.equal(
      adultAccept.some((row) => row.purpose === "special_category_processing"),
      false,
    );
    for (const row of adultAccept) {
      assert.equal(JSON.stringify(row).includes("1990-06-15"), false);
    }

    const today18 = await registerWithDate(
      formatIsoCivilDate(eighteenthToday),
      "today18",
    );
    const today18Row = await prisma.user.findUniqueOrThrow({
      where: { id: today18.user.id },
    });
    assert.equal(today18Row.birthYear, eighteenthToday.year);
    assert.equal(
      JSON.stringify(today18Row).includes(formatIsoCivilDate(eighteenthToday)),
      false,
    );

    await assert.rejects(
      () => registerWithDate(formatIsoCivilDate(eighteenthTomorrow), "tomorrow18"),
      (err: unknown) => {
        assert.ok(err instanceof CodedBadRequestException);
        assert.equal(err.code, AUTH_AGE_RESTRICTED_CODE);
        return true;
      },
    );

    await assert.rejects(
      () => registerWithDate(formatIsoCivilDate(minor), "minor"),
      (err: unknown) => {
        assert.ok(err instanceof CodedBadRequestException);
        assert.equal(err.code, AUTH_AGE_RESTRICTED_CODE);
        return true;
      },
    );

    await assert.rejects(
      () => registerWithDate("2026-02-30", "invalid"),
      (err: unknown) => {
        assert.ok(err instanceof CodedBadRequestException);
        assert.equal(err.code, AUTH_BIRTH_DATE_INVALID_CODE);
        return true;
      },
    );

    const leftoverMinors = await prisma.user.findMany({
      where: { id: { in: createdIds } },
    });
    assert.equal(leftoverMinors.length, 2);
  } finally {
    if (createdIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: createdIds } } });
    }
    await prisma.$disconnect().catch(() => undefined);
    if (prevMode === undefined) delete process.env.AUTH_REGISTRATION_MODE;
    else process.env.AUTH_REGISTRATION_MODE = prevMode;
  }
});
