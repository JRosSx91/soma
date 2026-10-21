import assert from "node:assert/strict";
import { test } from "node:test";
import { assertDemoUserSeedAllowed } from "./demo-user-seed.js";

test("demo user seed is allowed outside production", () => {
  assert.doesNotThrow(() => assertDemoUserSeedAllowed({}));
  assert.doesNotThrow(() =>
    assertDemoUserSeedAllowed({ NODE_ENV: "development" }),
  );
  assert.doesNotThrow(() => assertDemoUserSeedAllowed({ NODE_ENV: "test" }));
});

test("demo user seed is refused in production without touching the database", () => {
  assert.throws(
    () => assertDemoUserSeedAllowed({ NODE_ENV: "production" }),
    (err: unknown) => {
      assert.ok(err instanceof Error);
      assert.match(err.message, /Demo user seed is disabled/);
      return true;
    },
  );
});
