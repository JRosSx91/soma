import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertSafeApiHint,
  assertSafeE2eOrigin,
  DEFAULT_E2E_ORIGIN,
  isAllowedE2eRequestUrl,
  isBlockedHost,
} from "./safe-env.js";

test("assertSafeE2eOrigin accepts loopback with explicit port", () => {
  const a = assertSafeE2eOrigin("http://127.0.0.1:4173");
  assert.equal(a.origin, "http://127.0.0.1:4173");
  const b = assertSafeE2eOrigin("http://localhost:4173/preview");
  assert.equal(b.origin, "http://localhost:4173");
  assert.equal(assertSafeE2eOrigin(undefined).origin, DEFAULT_E2E_ORIGIN);
});

test("assertSafeE2eOrigin rejects production and remote hosts", () => {
  assert.throws(() => assertSafeE2eOrigin("https://somarecovery.app"), /refuse/i);
  assert.throws(
    () => assertSafeE2eOrigin("https://xyz.supabase.co"),
    /refuse/i,
  );
  assert.throws(() => assertSafeE2eOrigin("https://example.com:443"), /refuse/i);
  assert.throws(() => assertSafeE2eOrigin("http://192.168.1.10:4173"), /refuse/i);
  assert.throws(() => assertSafeE2eOrigin("http://127.0.0.1"), /port/i);
  assert.throws(
    () => assertSafeE2eOrigin("http://user:pass@127.0.0.1:4173"),
    /credentials/i,
  );
});

test("isBlockedHost marks known production markers", () => {
  assert.equal(isBlockedHost("api.somarecovery.app"), true);
  assert.equal(isBlockedHost("db.supabase.co"), true);
  assert.equal(isBlockedHost("127.0.0.1"), false);
});

test("isAllowedE2eRequestUrl stays on the approved SPA origin", () => {
  const origin = "http://127.0.0.1:4173";
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/preview", origin), true);
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/assets/x.js", origin), true);
  assert.equal(isAllowedE2eRequestUrl("data:text/plain,hi", origin), true);
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:3000/auth/refresh", origin), false);
  assert.equal(isAllowedE2eRequestUrl("https://somarecovery.app/", origin), false);
  assert.equal(
    isAllowedE2eRequestUrl("https://abc.supabase.co/rest/v1/", origin),
    false,
  );
});

test("isAllowedE2eRequestUrl refuses SPA-origin API paths that preview may proxy", () => {
  const origin = "http://127.0.0.1:4173";
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/auth/refresh", origin), false);
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/substances", origin), false);
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/me", origin), false);
  assert.equal(isAllowedE2eRequestUrl("http://127.0.0.1:4173/health", origin), false);
});

test("assertSafeApiHint rejects non-loopback API URLs", () => {
  assert.doesNotThrow(() => assertSafeApiHint(undefined));
  assert.doesNotThrow(() => assertSafeApiHint(""));
  assert.doesNotThrow(() => assertSafeApiHint("http://127.0.0.1:3000"));
  assert.throws(() => assertSafeApiHint("https://api.somarecovery.app"), /refuse/i);
});
