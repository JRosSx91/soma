import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const schema = readFileSync(
  new URL("../../prisma/schema.prisma", import.meta.url),
  "utf8",
);
const sql = readFileSync(
  new URL(
    "../../prisma/migrations/20261031120000_registration_acceptance_history/migration.sql",
    import.meta.url,
  ),
  "utf8",
);

test("RegistrationAcceptance stays append-only without a unique purpose key", () => {
  assert.match(schema, /model RegistrationAcceptance/);
  assert.match(schema, /@@index\(\[userId, purpose, acceptedAt\]\)/);
  assert.equal(schema.includes("@@unique([userId, purpose])"), false);
});

test("history migration drops only the unique index and does not delete consent rows", () => {
  assert.match(sql, /DROP INDEX "RegistrationAcceptance_userId_purpose_key"/);
  assert.match(
    sql,
    /CREATE INDEX "RegistrationAcceptance_userId_purpose_acceptedAt_idx"/,
  );
  assert.equal(sql.includes("DROP TABLE"), false);
  assert.equal(sql.includes("DELETE FROM"), false);
  assert.equal(sql.includes("TRUNCATE"), false);
  assert.equal(sql.includes("UPDATE \"RegistrationAcceptance\""), false);
});
