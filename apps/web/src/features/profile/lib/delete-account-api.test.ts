import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  ApiError,
  bumpSessionEpoch,
  clearAccessToken,
  getAccessToken,
  SESSION_REVOKED_EVENT,
  setAccessToken,
} from "../../auth/client/api.js";
import { deleteOwnAccount } from "../client/profile-api.js";
import { logout } from "../../auth/client/auth-api.js";

const originalFetch = globalThis.fetch;
let calls: { url: string; init?: RequestInit }[] = [];
let revoked = 0;

beforeEach(() => {
  calls = [];
  revoked = 0;
  clearAccessToken();
  bumpSessionEpoch();
  setAccessToken("access-tok");
  if (typeof globalThis.window === "undefined") {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: (event: Event) => {
          if ((event as CustomEvent).type === SESSION_REVOKED_EVENT) {
            revoked += 1;
          }
          return true;
        },
      },
    });
  } else {
    globalThis.window.addEventListener(SESSION_REVOKED_EVENT, () => {
      revoked += 1;
    });
  }
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearAccessToken();
});

function pathOf(url: string): string {
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}

test("DELETE /me/account sends JWT, cookie CSRF header, and password JSON", async () => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  await deleteOwnAccount("secret12");
  assert.equal(calls.length, 1);
  assert.equal(pathOf(calls[0]!.url), "/me/account");
  assert.equal(calls[0]!.init?.method, "DELETE");
  assert.equal(calls[0]!.init?.credentials, "include");
  const headers = new Headers(calls[0]!.init?.headers);
  assert.equal(headers.get("Authorization"), "Bearer access-tok");
  assert.equal(headers.get("X-Soma-Requested-With"), "soma-web");
  assert.equal(headers.get("Content-Type"), "application/json");
  assert.deepEqual(JSON.parse(String(calls[0]!.init?.body)), {
    password: "secret12",
  });
  assert.equal(getAccessToken(), "access-tok");
  assert.equal(
    calls.some((c) => pathOf(c.url) === "/auth/logout"),
    false,
  );
});

test("wrong password 401 does not refresh, logout, or revoke the session", async () => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }) as typeof fetch;

  await assert.rejects(
    () => deleteOwnAccount("wrong-pass"),
    (err: unknown) => err instanceof ApiError && err.status === 401,
  );
  assert.equal(calls.length, 1);
  assert.equal(pathOf(calls[0]!.url), "/me/account");
  assert.equal(getAccessToken(), "access-tok");
  assert.equal(revoked, 0);
});

test("network error keeps the access token", async () => {
  globalThis.fetch = (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;

  await assert.rejects(() => deleteOwnAccount("secret12"), /Failed to fetch/);
  assert.equal(getAccessToken(), "access-tok");
  assert.equal(revoked, 0);
});

test("success 204 does not call logout as an extra step", async () => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    if (pathOf(String(input)) === "/auth/logout") {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(null, { status: 204 });
  }) as typeof fetch;

  await deleteOwnAccount("secret12");
  assert.equal(
    calls.some((c) => pathOf(c.url) === "/auth/logout"),
    false,
  );
  // Contrasts with explicit logout, which does hit /auth/logout.
  await logout();
  assert.equal(
    calls.some((c) => pathOf(c.url) === "/auth/logout"),
    true,
  );
});

test("expired session 401 refreshes then retries; failed refresh revokes", async () => {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init });
    const path = pathOf(String(input));
    if (path === "/me/account") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (path === "/auth/refresh") {
      return new Response(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response("nope", { status: 500 });
  }) as typeof fetch;

  await assert.rejects(() => deleteOwnAccount("secret12"), ApiError);
  assert.ok(calls.some((c) => pathOf(c.url) === "/auth/refresh"));
  assert.equal(getAccessToken(), null);
});
