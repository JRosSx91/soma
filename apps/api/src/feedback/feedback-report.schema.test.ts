import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const schema = readFileSync(new URL("../../prisma/schema.prisma", import.meta.url), "utf8");
const sql = readFileSync(
  new URL("../../prisma/migrations/20261029180000_feedback_reports/migration.sql", import.meta.url),
  "utf8",
);

test("FeedbackReport is additive, cascades on user delete, and is not unique on fingerprint", () => {
  assert.match(schema, /model FeedbackReport/);
  assert.match(schema, /feedbackReports\s+FeedbackReport\[\]/);
  assert.match(schema, /onDelete: Cascade/);
  assert.match(schema, /@@index\(\[userId, createdAt\]\)/);
  assert.match(schema, /@@index\(\[userId, fingerprint, createdAt\]\)/);
  assert.equal(schema.includes("@@unique([userId, fingerprint])"), false);
  assert.equal(/source\s+=\s+"feedback"/.test(schema), false);
});

test("feedback migration SQL creates types and table without destructive statements", () => {
  assert.match(sql, /CREATE TYPE "FeedbackCategory"/);
  assert.match(sql, /CREATE TYPE "FeedbackStatus"/);
  assert.match(sql, /CREATE TABLE "FeedbackReport"/);
  assert.match(sql, /ON DELETE CASCADE/);
  assert.match(sql, /FeedbackReport_userId_createdAt_idx/);
  assert.match(sql, /FeedbackReport_userId_fingerprint_createdAt_idx/);
  assert.equal(sql.includes("UNIQUE INDEX"), false);
  assert.equal(sql.includes("DROP TABLE"), false);
  assert.equal(sql.includes("DROP TYPE"), false);
  assert.equal(sql.includes("ALTER TABLE \"User\""), false);
  assert.equal(sql.includes("TRUNCATE"), false);
  assert.equal(sql.includes("INSERT INTO"), false);
});
