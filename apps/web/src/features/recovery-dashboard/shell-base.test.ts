import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isAppShellPath,
  shellBaseFromPath,
  shellSections,
} from "./shell-base.ts";

test("shell sections stay inside their base", () => {
  const app = shellSections("/app");
  const preview = shellSections("/preview");

  assert.equal(app[0]?.to, "/app");
  assert.equal(app.find((item) => item.id === "recuperacion")?.to, "/app/recovery");
  assert.equal(app.find((item) => item.id === "logros")?.to, "/app/achievements");

  assert.equal(preview[0]?.to, "/preview");
  assert.equal(
    preview.find((item) => item.id === "recuperacion")?.to,
    "/preview/recovery",
  );
  assert.ok(app.every((item) => item.to === "/app" || item.to.startsWith("/app/")));
  assert.ok(
    preview.every(
      (item) => item.to === "/preview" || item.to.startsWith("/preview/"),
    ),
  );
  assert.ok(app.every((item) => !item.to.startsWith("/preview")));
  assert.ok(preview.every((item) => !item.to.startsWith("/app")));
});

test("app shell path detection does not swallow app-legacy", () => {
  assert.equal(isAppShellPath("/app"), true);
  assert.equal(isAppShellPath("/app/recovery"), true);
  assert.equal(isAppShellPath("/app-legacy"), false);
  assert.equal(isAppShellPath("/preview"), false);
  assert.equal(shellBaseFromPath("/app/anatomy"), "/app");
  assert.equal(shellBaseFromPath("/preview/explore"), "/preview");
});
