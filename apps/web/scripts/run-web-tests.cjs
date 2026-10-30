"use strict";

/**
 * Discovers web tests without relying on shell glob expansion.
 * Roots match the previous `pnpm test` globs in package.json.
 */

const { spawnSync } = require("node:child_process");
const { readdirSync, existsSync } = require("node:fs");
const { join } = require("node:path");

const webRoot = join(__dirname, "..");

const TEST_ROOTS = [
  "src/features/auth",
  "src/features/profile",
  "src/features/achievements",
  "src/features/journal",
  "src/features/progress",
  "src/features/missions",
  "src/features/feedback",
  "src/features/recovery-dashboard",
  "src/features/landing-v2",
  "src/features/legal",
  "src/features/somi",
  "src/features/onboarding-tour",
  "src/seo",
  "src/i18n",
];

function isTestFile(name) {
  return name.endsWith(".test.ts") || name.endsWith(".test.tsx");
}

function walk(dir, acc) {
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) {
      walk(path, acc);
      continue;
    }
    if (ent.isFile() && isTestFile(ent.name)) acc.push(path);
  }
}

const files = [];
for (const rel of TEST_ROOTS) {
  const dir = join(webRoot, rel);
  if (!existsSync(dir)) {
    process.stderr.write(`Missing test root: ${rel}\n`);
    process.exit(1);
  }
  walk(dir, files);
}
files.sort();

if (files.length === 0) {
  process.stderr.write("No web tests found under the configured roots\n");
  process.exit(1);
}

process.stderr.write(`Discovered ${files.length} web test files\n`);

const tsxCli = require.resolve("tsx/cli", { paths: [webRoot] });
const result = spawnSync(
  process.execPath,
  [tsxCli, "--tsconfig", "./tsconfig.app.json", "--test", ...files],
  {
    cwd: webRoot,
    env: process.env,
    stdio: "inherit",
    windowsHide: true,
  },
);

if (result.error) {
  process.stderr.write(`${result.error.message}\n`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
