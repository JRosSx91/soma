import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generateRegistrationInvitePlaintext,
  hashRegistrationInviteToken,
  isRegistrationInviteTokenFormat,
  registrationInviteTtlMs,
} from "./invite-token.crypto.js";

test("plaintext is high entropy, unique, and never equals its hash", () => {
  const a = generateRegistrationInvitePlaintext();
  const b = generateRegistrationInvitePlaintext();
  assert.notEqual(a, b);
  assert.ok(isRegistrationInviteTokenFormat(a));
  const hash = hashRegistrationInviteToken(a);
  assert.equal(hash, hashRegistrationInviteToken(a));
  assert.notEqual(hash, a);
  assert.match(hash, /^[a-f0-9]{64}$/);
});

test("invite TTL defaults to 14 days", () => {
  const prev = process.env.AUTH_INVITE_EXPIRES_DAYS;
  delete process.env.AUTH_INVITE_EXPIRES_DAYS;
  try {
    assert.equal(registrationInviteTtlMs(), 14 * 24 * 60 * 60 * 1000);
  } finally {
    if (prev === undefined) delete process.env.AUTH_INVITE_EXPIRES_DAYS;
    else process.env.AUTH_INVITE_EXPIRES_DAYS = prev;
  }
});
