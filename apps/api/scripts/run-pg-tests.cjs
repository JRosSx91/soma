"use strict";

/**
 * Runs API PostgreSQL integration tests (files whose names contain `.pg.`).
 *
 * Discovers files by walking src/ (no shell glob). Fails if none are found,
 * if DATABASE_URL is missing/non-local, if JWT_SECRET is missing, or if
 * node:test reports any skipped test (CI must not go green on t.skip).
 */

const { spawnSync } = require("node:child_process");
const { mkdtempSync, readdirSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { delimiter, dirname, join } = require("node:path");

const apiRoot = join(__dirname, "..");
const srcRoot = join(apiRoot, "src");

function walkPgTests(dir, acc) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) {
      walkPgTests(path, acc);
      continue;
    }
    if (!ent.name.endsWith(".test.ts")) continue;
    if (!ent.name.includes(".pg.")) continue;
    acc.push(path);
  }
}

function isLocalPostgresUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    return false;
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
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

function evaluateTap(stdout) {
  const lines = stdout.split(/\r?\n/);
  const skipLines = lines.filter(
    (line) => /^\s*ok\s+\d+\b/.test(line) && /#\s*SKIP\b/i.test(line),
  );
  const skippedMeta = stdout.match(/^# skipped (\d+)\s*$/m);
  const testsMeta = stdout.match(/^# tests (\d+)\s*$/m);
  const topPlan = stdout.match(/^1\.\.(\d+)\s*$/m);
  return {
    skipLines,
    skippedCount: skippedMeta ? Number(skippedMeta[1]) : null,
    testsCount: testsMeta ? Number(testsMeta[1]) : null,
    planned: topPlan ? Number(topPlan[1]) : null,
  };
}

function tapFailureReason(tap) {
  if (tap.skipLines.length > 0) {
    return `PostgreSQL suite reported ${tap.skipLines.length} skipped TAP line(s). CI treats skips as failure.`;
  }
  if (tap.skippedCount !== null && tap.skippedCount > 0) {
    return `PostgreSQL suite reported # skipped ${tap.skippedCount}. CI treats skips as failure.`;
  }
  if (tap.planned === 0 || tap.testsCount === 0) {
    return "PostgreSQL suite planned or executed 0 tests.";
  }
  if (tap.planned === null && tap.testsCount === null) {
    return "PostgreSQL suite produced no TAP plan or test count.";
  }
  return null;
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function binPath() {
  const pnpmBinDir = join(dirname(process.execPath));
  return [
    join(apiRoot, "node_modules", ".bin"),
    join(apiRoot, "..", "..", "node_modules", ".bin"),
    pnpmBinDir,
    process.env.PATH ?? "",
  ].join(delimiter);
}

function pingPostgres(env) {
  const pingDir = mkdtempSync(join(tmpdir(), "soma-pg-ping-"));
  const pingFile = join(pingDir, "ping.sql");
  writeFileSync(pingFile, "SELECT 1;\n");
  const ping = spawnSync(
    "prisma",
    [
      "db",
      "execute",
      "--file",
      pingFile,
      "--schema",
      join(apiRoot, "prisma", "schema.prisma"),
    ],
    {
      cwd: apiRoot,
      env,
      encoding: "utf8",
      windowsHide: true,
      shell: process.platform === "win32",
      timeout: 20_000,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  rmSync(pingDir, { recursive: true, force: true });
  return ping;
}

function main() {
  const files = [];
  walkPgTests(srcRoot, files);
  files.sort();

  if (files.length === 0) {
    fail("No PostgreSQL integration tests found (src/**/*.pg.*.test.ts).");
  }

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) {
    fail("DATABASE_URL is unset; refusing to skip PostgreSQL tests.");
  }
  if (!isLocalPostgresUrl(databaseUrl)) {
    fail(
      "DATABASE_URL is not a local PostgreSQL URL; refusing production/remote hosts.",
    );
  }
  if (!process.env.JWT_SECRET) {
    fail("JWT_SECRET is unset; isolation/inbox PostgreSQL tests would skip.");
  }

  const env = { ...process.env, PATH: binPath() };

  const ping = pingPostgres(env);
  if (ping.error) {
    fail(ping.error.message);
  }
  if (ping.status !== 0) {
    process.stderr.write(ping.stdout ?? "");
    process.stderr.write(ping.stderr ?? "");
    fail("PostgreSQL is not reachable (prisma db execute SELECT 1 failed).");
  }

  process.stderr.write(
    `Running ${files.length} PostgreSQL integration test file(s).\n`,
  );

  const result = spawnSync(
    "tsx",
    [
      "--test",
      "--test-reporter=tap",
      "--test-concurrency=1",
      ...files,
    ],
    {
      cwd: apiRoot,
      env,
      encoding: "utf8",
      windowsHide: true,
      shell: process.platform === "win32",
      timeout: 20 * 60 * 1000,
      maxBuffer: 16 * 1024 * 1024,
    },
  );

  if (result.error) {
    fail(result.error.message);
  }

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";
  process.stdout.write(stdout);
  process.stderr.write(stderr);

  const tap = evaluateTap(stdout);
  const tapReason = tapFailureReason(tap);
  if (tapReason) {
    if (tap.skipLines.length > 0) {
      for (const line of tap.skipLines) {
        process.stderr.write(`  ${line.trim()}\n`);
      }
    }
    fail(tapReason);
  }

  if (result.status !== 0) {
    process.exit(result.status === null ? 1 : result.status);
  }

  process.exit(0);
}

module.exports = {
  walkPgTests,
  isLocalPostgresUrl,
  evaluateTap,
  tapFailureReason,
};

if (require.main === module) {
  main();
}
