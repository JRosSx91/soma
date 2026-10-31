import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { fetchRegistrationMode } from "./registration-mode.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("fetchRegistrationMode accepts only invite or open", async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ mode: "invite" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
  assert.equal(await fetchRegistrationMode(), "invite");
});

test("fetchRegistrationMode rejects unknown payloads instead of assuming invite", async () => {
  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ mode: "closed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
  await assert.rejects(() => fetchRegistrationMode());
});
