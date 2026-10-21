import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { ApiError } from "./api.js";
import {
  classifyPasswordResetError,
  requestPasswordReset,
  resetPasswordWithToken,
} from "./password-reset-api.js";
import { clearAccessToken, setAccessToken } from "./access-token.js";

const originalFetch = globalThis.fetch;
let calls: { url: string; init?: RequestInit }[] = [];

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  calls = [];
  clearAccessToken();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

function mockFetch(
  handler: (url: string, init?: RequestInit) => Response | Promise<Response>,
) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    return handler(url, init);
  }) as typeof fetch;
}

test("requestPasswordReset posts email anonymously without refresh", async () => {
  setAccessToken("should-not-be-sent");
  mockFetch(() =>
    jsonResponse(200, {
      ok: true,
      message: "If an account exists for that email, you will receive password reset instructions shortly.",
    }),
  );

  const result = await requestPasswordReset("user@example.com");
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0]!.url, /\/auth\/forgot-password$/);
  assert.equal(calls[0]!.init?.method, "POST");
  const headers = calls[0]!.init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, undefined);
  assert.equal(
    JSON.parse(String(calls[0]!.init?.body)).email,
    "user@example.com",
  );
});

test("resetPasswordWithToken posts token + password anonymously", async () => {
  setAccessToken("should-not-be-sent");
  mockFetch(() => jsonResponse(200, { ok: true }));

  const result = await resetPasswordWithToken(
    "abcdefghijklmnopqrstuvwxyz0123456789",
    "newpassword1",
  );
  assert.equal(result.ok, true);
  assert.equal(calls.length, 1);
  assert.match(calls[0]!.url, /\/auth\/reset-password$/);
  const headers = calls[0]!.init?.headers as Record<string, string>;
  assert.equal(headers.Authorization, undefined);
  const body = JSON.parse(String(calls[0]!.init?.body));
  assert.equal(body.token, "abcdefghijklmnopqrstuvwxyz0123456789");
  assert.equal(body.newPassword, "newpassword1");
});

test("classifyPasswordResetError distinguishes 429, network, token, validation", () => {
  assert.equal(
    classifyPasswordResetError(new ApiError(429, "Too many"), "forgot"),
    "rate_limited",
  );
  assert.equal(
    classifyPasswordResetError(new TypeError("Failed to fetch"), "forgot"),
    "network",
  );
  assert.equal(
    classifyPasswordResetError(new ApiError(400, "bad"), "reset"),
    "invalid_token",
  );
  assert.equal(
    classifyPasswordResetError(new ApiError(400, "bad"), "forgot"),
    "validation",
  );
  assert.equal(
    classifyPasswordResetError(new ApiError(500, "boom"), "reset"),
    "server",
  );
});

test("requestPasswordReset surfaces HTTP 429 as ApiError", async () => {
  mockFetch(() => jsonResponse(429, { message: "ThrottlerException" }));
  await assert.rejects(
    () => requestPasswordReset("user@example.com"),
    (err: unknown) => err instanceof ApiError && err.status === 429,
  );
});

test("resetPasswordWithToken surfaces invalid token as 400", async () => {
  mockFetch(() =>
    jsonResponse(400, { message: "Invalid or expired reset token" }),
  );
  await assert.rejects(
    () =>
      resetPasswordWithToken(
        "abcdefghijklmnopqrstuvwxyz0123456789",
        "newpassword1",
      ),
    (err: unknown) => err instanceof ApiError && err.status === 400,
  );
});
