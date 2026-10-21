import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generateRefreshTokenPlaintext,
  hashClientIp,
  hashRefreshToken,
} from "./refresh-token.crypto.js";

test("generateRefreshTokenPlaintext has high entropy and is unique", () => {
  const a = generateRefreshTokenPlaintext();
  const b = generateRefreshTokenPlaintext();
  assert.notEqual(a, b);
  // 32 bytes → base64url length >= 43
  assert.ok(a.length >= 43);
});

test("hashRefreshToken is deterministic and never equals plaintext", () => {
  const plain = generateRefreshTokenPlaintext();
  const hash = hashRefreshToken(plain);
  assert.equal(hash, hashRefreshToken(plain));
  assert.notEqual(hash, plain);
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test("hashClientIp returns null for empty and a digest otherwise", () => {
  assert.equal(hashClientIp(undefined), null);
  assert.equal(hashClientIp("  "), null);
  assert.match(hashClientIp("127.0.0.1")!, /^[a-f0-9]{64}$/);
});
