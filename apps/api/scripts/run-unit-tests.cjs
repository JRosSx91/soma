"use strict";

/**
 * Runs API tests that do not require PostgreSQL.
 * Excludes *.pg.*.test.ts (integration / HTTP-with-DB).
 * Invokes the same `tsx --test` entry as `pnpm test`, with an explicit file list.
 */

const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const { delimiter, dirname, join } = require("node:path");

const apiRoot = join(__dirname, "..");
const srcRoot = join(apiRoot, "src");

function walk(dir, acc) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(path, acc);
      continue;
    }
    if (!ent.name.endsWith(".test.ts")) continue;
    if (ent.name.includes(".pg.")) continue;
    acc.push(path);
  }
}

const files = [];
walk(srcRoot, files);
files.sort();

if (files.length === 0) {
  process.stderr.write("No API unit tests found under src/\n");
  process.exit(1);
}

const pnpmBinDir = join(dirname(process.execPath));
const pathWithBins = [
  join(apiRoot, "node_modules", ".bin"),
  join(apiRoot, "..", "..", "node_modules", ".bin"),
  pnpmBinDir,
  process.env.PATH ?? "",
].join(delimiter);

const result = spawnSync("tsx", ["--test", ...files], {
  cwd: apiRoot,
  env: { ...process.env, PATH: pathWithBins },
  stdio: "inherit",
  windowsHide: true,
  shell: process.platform === "win32",
});

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
