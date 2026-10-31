/**
 * Live PostgreSQL: pre-migration sample grants survive the append-only history
 * shape. Skips when DATABASE_URL is unset or not local.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  LEGAL_PRIVACY_VERSION,
  LEGAL_SPECIAL_CATEGORY_VERSION,
  LEGAL_TERMS_VERSION,
  SPECIAL_CATEGORY_PROCESSING_PURPOSE,
  isSpecialCategoryConsentActive,
} from "@soma/shared-types";
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

test("pg: existing special-category grants remain after history-capable inserts", async (t) => {
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
  let userId = "";

  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$queryRaw`SELECT "purpose" FROM "RegistrationAcceptance" LIMIT 0`;
  } catch {
    await prisma.$disconnect().catch(() => undefined);
    t.skip("RegistrationAcceptance table is not available");
    return;
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: `migration-sample-${Date.now()}@example.test`,
        hashedPassword: "not-a-login-hash",
        displayName: "Migration Sample",
        biologicalSex: "male",
        birthYear: 1990,
      },
    });
    userId = user.id;
    const grantAt = new Date("2026-09-01T10:00:00.000Z");
    const laterGrantAt = new Date("2026-10-31T10:00:00.000Z");

    await prisma.registrationAcceptance.createMany({
      data: [
        {
          id: createId(),
          userId,
          purpose: "terms_of_use",
          documentVersion: LEGAL_TERMS_VERSION,
          acceptedAt: grantAt,
        },
        {
          id: createId(),
          userId,
          purpose: "privacy_notice",
          documentVersion: LEGAL_PRIVACY_VERSION,
          acceptedAt: grantAt,
        },
        {
          id: createId(),
          userId,
          purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
          documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
          acceptedAt: grantAt,
        },
      ],
    });

    const before = await prisma.registrationAcceptance.findMany({
      where: { userId, purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE },
      orderBy: { acceptedAt: "asc" },
    });
    assert.equal(before.length, 1);
    const original = before[0]!;
    assert.equal(original.documentVersion, LEGAL_SPECIAL_CATEGORY_VERSION);
    assert.equal(
      isSpecialCategoryConsentActive(
        before.map((row) => ({
          purpose: row.purpose,
          acceptedAt: row.acceptedAt,
          documentVersion: row.documentVersion,
        })),
      ),
      true,
    );

    await prisma.registrationAcceptance.create({
      data: {
        id: createId(),
        userId,
        purpose: SPECIAL_CATEGORY_PROCESSING_PURPOSE,
        documentVersion: LEGAL_SPECIAL_CATEGORY_VERSION,
        acceptedAt: laterGrantAt,
      },
    });

    const after = await prisma.registrationAcceptance.findMany({
      where: { userId },
      orderBy: { acceptedAt: "asc" },
    });
    const grants = after.filter(
      (row) => row.purpose === SPECIAL_CATEGORY_PROCESSING_PURPOSE,
    );
    assert.equal(grants.length, 2);
    assert.equal(grants[0]!.id, original.id);
    assert.equal(grants[0]!.acceptedAt.toISOString(), grantAt.toISOString());
    assert.equal(grants[0]!.documentVersion, original.documentVersion);
    assert.equal(
      after.filter((row) => row.purpose === "terms_of_use").length,
      1,
    );
    assert.equal(
      after.filter((row) => row.purpose === "privacy_notice").length,
      1,
    );
    assert.equal(
      isSpecialCategoryConsentActive(
        grants.map((row) => ({
          purpose: row.purpose,
          acceptedAt: row.acceptedAt,
          documentVersion: row.documentVersion,
        })),
      ),
      true,
    );
  } finally {
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
    }
    await prisma.$disconnect().catch(() => undefined);
  }
});
