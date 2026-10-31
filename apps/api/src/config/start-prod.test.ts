import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const startProd = join(apiRoot, "scripts/start-prod.cjs");
const distMain = join(apiRoot, "dist/main.js");
const VALID_SECRET = "A".repeat(32);

function spawnStartProd(
  extraEnv: NodeJS.ProcessEnv,
): Promise<{ code: number | null; combined: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [startProd], {
      cwd: apiRoot,
      env: {
        PATH: process.env.PATH,
        SystemRoot: process.env.SystemRoot,
        USERPROFILE: process.env.USERPROFILE,
        PATHEXT: process.env.PATHEXT,
        COMSPEC: process.env.COMSPEC,
        PORT: "39991",
        ...extraEnv,
      },
      windowsHide: true,
    });
    let combined = "";
    child.stdout.on("data", (chunk: Buffer) => {
      combined += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      combined += chunk.toString();
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("start:prod did not exit before opening the server"));
    }, 10_000);
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({ code, combined });
    });
  });
}

test("start and dev scripts stay unchanged; start:prod forces production", () => {
  const pkg = JSON.parse(
    readFileSync(join(apiRoot, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };
  assert.equal(pkg.scripts.start, "node dist/main.js");
  assert.match(pkg.scripts.dev ?? "", /concurrently/);
  assert.doesNotMatch(pkg.scripts.dev ?? "", /start-prod/);
  assert.equal(pkg.scripts["start:prod"], "node scripts/start-prod.cjs");
  const script = readFileSync(startProd, "utf8");
  assert.match(script, /process\.env\.NODE_ENV = "production"/);
  assert.match(script, /require\("\.\.\/dist\/main\.js"\)/);
});

test("start:prod rejects an example JWT_SECRET before listen", async (t) => {
  if (!existsSync(distMain)) {
    t.skip("API dist is missing; compile with tsc -b before this suite");
    return;
  }
  const result = await spawnStartProd({
    JWT_SECRET: "replace-with-a-long-random-secret",
    AUTH_REGISTRATION_MODE: "invite",
    CORS_ORIGIN: "https://app.example.com",
    JWT_EXPIRES_IN: "15m",
  });
  assert.equal(result.code, 1);
  assert.match(result.combined, /placeholder/i);
  assert.doesNotMatch(result.combined, /listening/i);
});

test("start:prod rejects an unknown AUTH_REGISTRATION_MODE before listen", async (t) => {
  if (!existsSync(distMain)) {
    t.skip("API dist is missing; compile with tsc -b before this suite");
    return;
  }
  const result = await spawnStartProd({
    JWT_SECRET: VALID_SECRET,
    AUTH_REGISTRATION_MODE: "closed",
    CORS_ORIGIN: "https://app.example.com",
    JWT_EXPIRES_IN: "15m",
  });
  assert.equal(result.code, 1);
  assert.match(result.combined, /open" or "invite"/);
  assert.doesNotMatch(result.combined, /listening/i);
});
