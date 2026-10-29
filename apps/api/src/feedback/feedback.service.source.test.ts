import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const service = readFileSync(new URL("./feedback.service.ts", import.meta.url), "utf8");
const controller = readFileSync(
  new URL("./feedback.controller.ts", import.meta.url),
  "utf8",
);
const moduleSource = readFileSync(
  new URL("./feedback.module.ts", import.meta.url),
  "utf8",
);

test("feedback API does not award XP or log title/body", () => {
  assert.equal(service.includes("awardXp"), false);
  assert.equal(service.includes("ProgressService"), false);
  assert.equal(moduleSource.includes("ProgressModule"), false);
  assert.match(service, /Never log title or body/);
  assert.equal(service.includes("dto.title"), true);
  assert.equal(service.includes("`title"), false);
  assert.equal(service.includes("${dto.title}"), false);
  assert.equal(service.includes("${dto.body}"), false);
  assert.match(controller, /JwtAuthGuard/);
  assert.match(controller, /me\/feedback/);
});
