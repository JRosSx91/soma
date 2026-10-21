import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  ApiError,
  apiRequest,
  bumpSessionEpoch,
  clearAccessToken,
  getAccessToken,
  refreshAccessSession,
  setAccessToken,
  SESSION_REVOKED_EVENT,
} from "./api.js";
import {
  login,
  logout,
  register,
  restoreSession,
} from "./auth-api.js";
import { clearLegacyAuthStorage, LEGACY_TOKEN_STORAGE_KEY } from "./access-token.js";

type FetchCall = {
  url: string;
  init?: RequestInit;
};

const originalFetch = globalThis.fetch;
let calls: FetchCall[] = [];
let handlers: ((url: string, init?: RequestInit) => Promise<Response> | Response)[] = [];

function jsonResponse(status: number, body: unknown, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function mockFetch(
  handler: (url: string, init?: RequestInit) => Promise<Response> | Response,
) {
  handlers.push(handler);
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, init });
    const active = handlers[handlers.length - 1]!;
    return active(url, init);
  }) as typeof fetch;
}

beforeEach(() => {
  calls = [];
  handlers = [];
  clearAccessToken();
  bumpSessionEpoch();
  clearLegacyAuthStorage();
  if (typeof globalThis.localStorage === "undefined") {
    const store = new Map<string, string>();
    const storage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, String(v));
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
      clear: () => store.clear(),
    };
    Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
    Object.defineProperty(globalThis, "sessionStorage", { value: storage, configurable: true });
  } else {
    localStorage.clear();
  }
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  handlers = [];
});

function pathOf(url: string): string {
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}

test("login stores access only in memory and never in localStorage", async () => {
  mockFetch((url) => {
    if (pathOf(url) === "/auth/login") {
      return jsonResponse(200, {
        accessToken: "access-login",
        user: { id: "1", email: "a@b.c", displayName: "A" },
      });
    }
    return jsonResponse(404, { message: "no" });
  });

  await login({ email: "a@b.c", password: "password12" });
  assert.equal(getAccessToken(), "access-login");
  assert.equal(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
  assert.equal(calls[0]!.init?.credentials, "include");
});

test("register stores access only in memory", async () => {
  mockFetch((url) => {
    if (pathOf(url) === "/auth/register") {
      return jsonResponse(201, {
        accessToken: "access-reg",
        user: { id: "2", email: "n@b.c", displayName: "N" },
      });
    }
    return jsonResponse(404, { message: "no" });
  });

  await register({
    email: "n@b.c",
    password: "password12",
    displayName: "N",
    biologicalSex: "male",
    birthYear: 1990,
  });
  assert.equal(getAccessToken(), "access-reg");
  assert.equal(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
  const openBody = JSON.parse(String(calls[0]!.init?.body ?? "{}")) as Record<
    string,
    unknown
  >;
  assert.equal("inviteToken" in openBody, false);
});

test("register sends inviteToken only in JSON body and never persists it", async () => {
  const secret = "inv_json_body_only_secret_value";
  mockFetch((url) => {
    if (pathOf(url) === "/auth/register") {
      return jsonResponse(201, {
        accessToken: "access-inv",
        user: { id: "3", email: "i@b.c", displayName: "I" },
      });
    }
    return jsonResponse(404, { message: "no" });
  });

  await register({
    email: "i@b.c",
    password: "password12",
    displayName: "I",
    biologicalSex: "female",
    birthYear: 1988,
    inviteToken: secret,
  });

  const sent = JSON.parse(String(calls[0]!.init?.body ?? "{}")) as Record<
    string,
    unknown
  >;
  assert.equal(sent.inviteToken, secret);
  assert.equal(pathOf(calls[0]!.url), "/auth/register");
  assert.equal(String(calls[0]!.url).includes(secret), false);
  assert.equal(localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY), null);
  assert.equal(localStorage.getItem("invite"), null);
  assert.equal(sessionStorage.getItem("invite"), null);
});

test("bootstrap restoreSession with valid cookie sets memory access", async () => {
  mockFetch((url) => {
    if (pathOf(url) === "/auth/refresh") {
      return jsonResponse(200, {
        accessToken: "access-refresh",
        user: { id: "1", email: "a@b.c", displayName: "A" },
      });
    }
    return jsonResponse(404, { message: "no" });
  });

  const restored = await restoreSession();
  assert.ok(restored);
  assert.equal(restored!.accessToken, "access-refresh");
  assert.equal(getAccessToken(), "access-refresh");
  assert.equal(
    (calls[0]!.init?.headers as Record<string, string>)["X-Soma-Requested-With"],
    "soma-web",
  );
});

test("bootstrap without cookie returns null and clears access", async () => {
  mockFetch(() => jsonResponse(401, { message: "Invalid refresh token" }));
  const restored = await restoreSession();
  assert.equal(restored, null);
  assert.equal(getAccessToken(), null);
});

test("bootstrap with API down returns null", async () => {
  mockFetch(() => {
    throw new TypeError("Failed to fetch");
  });
  const restored = await restoreSession();
  assert.equal(restored, null);
  assert.equal(getAccessToken(), null);
});

test("401 on protected route triggers one refresh and retries original once", async () => {
  let meHits = 0;
  let refreshHits = 0;
  mockFetch((url) => {
    const path = pathOf(url);
    if (path === "/me/profile") {
      meHits += 1;
      if (meHits === 1) return jsonResponse(401, { message: "Unauthorized" });
      return jsonResponse(200, { displayName: "ok" });
    }
    if (path === "/auth/refresh") {
      refreshHits += 1;
      return jsonResponse(200, {
        accessToken: "access-new",
        user: { id: "1", email: "a@b.c", displayName: "A" },
      });
    }
    return jsonResponse(404, {});
  });

  setAccessToken("access-old");
  const body = await apiRequest<{ displayName: string }>("/me/profile");
  assert.equal(body.displayName, "ok");
  assert.equal(meHits, 2);
  assert.equal(refreshHits, 1);
  assert.equal(getAccessToken(), "access-new");
});

test("concurrent 401s share a single refresh (single-flight)", async () => {
  let refreshHits = 0;
  let profileHits = 0;
  mockFetch(async (url) => {
    const path = pathOf(url);
    if (path === "/auth/refresh") {
      refreshHits += 1;
      await new Promise((r) => setTimeout(r, 30));
      return jsonResponse(200, {
        accessToken: "access-shared",
        user: { id: "1", email: "a@b.c", displayName: "A" },
      });
    }
    if (path === "/me/profile" || path === "/me/achievements") {
      profileHits += 1;
      if (!getAccessToken() || getAccessToken() === "stale") {
        return jsonResponse(401, { message: "Unauthorized" });
      }
      return jsonResponse(200, { ok: true });
    }
    return jsonResponse(404, {});
  });

  setAccessToken("stale");
  const [a, b] = await Promise.all([
    apiRequest("/me/profile"),
    apiRequest("/me/achievements"),
  ]);
  assert.deepEqual(a, { ok: true });
  assert.deepEqual(b, { ok: true });
  assert.equal(refreshHits, 1);
  assert.ok(profileHits >= 3);
});

test("failed refresh ends the session and emits session-revoked", async () => {
  let revoked = 0;
  const listeners = new Map<string, Set<EventListener>>();
  const fakeWindow = {
    addEventListener(type: string, listener: EventListener) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(listener);
    },
    removeEventListener(type: string, listener: EventListener) {
      listeners.get(type)?.delete(listener);
    },
    dispatchEvent(event: Event) {
      for (const listener of listeners.get(event.type) ?? []) {
        listener(event);
      }
      return true;
    },
  };
  Object.defineProperty(globalThis, "window", {
    value: fakeWindow,
    configurable: true,
  });
  fakeWindow.addEventListener(SESSION_REVOKED_EVENT, () => {
    revoked += 1;
  });

  mockFetch((url) => {
    if (pathOf(url) === "/me/profile") {
      return jsonResponse(401, { message: "Unauthorized" });
    }
    if (pathOf(url) === "/auth/refresh") {
      return jsonResponse(401, { message: "Invalid refresh token" });
    }
    return jsonResponse(404, {});
  });

  setAccessToken("stale");
  await assert.rejects(() => apiRequest("/me/profile"), ApiError);
  assert.equal(getAccessToken(), null);
  assert.ok(revoked >= 1);
});

test("login and register are not auto-retried via refresh", async () => {
  let loginHits = 0;
  let refreshHits = 0;
  mockFetch((url) => {
    if (pathOf(url) === "/auth/login") {
      loginHits += 1;
      return jsonResponse(401, {
        message: "Invalid credentials",
        code: "AUTH_INVALID_CREDENTIALS",
      });
    }
    if (pathOf(url) === "/auth/refresh") {
      refreshHits += 1;
      return jsonResponse(200, { accessToken: "x", user: {} });
    }
    return jsonResponse(404, {});
  });

  await assert.rejects(
    () => login({ email: "a@b.c", password: "bad" }),
    ApiError,
  );
  assert.equal(loginHits, 1);
  assert.equal(refreshHits, 0);
});

test("network error during refresh does not revoke the session", async () => {
  let revoked = 0;
  const listeners = new Map<string, Set<EventListener>>();
  Object.defineProperty(globalThis, "window", {
    value: {
      addEventListener(type: string, listener: EventListener) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type)!.add(listener);
      },
      removeEventListener(type: string, listener: EventListener) {
        listeners.get(type)?.delete(listener);
      },
      dispatchEvent(event: Event) {
        for (const listener of listeners.get(event.type) ?? []) {
          listener(event);
        }
        return true;
      },
    },
    configurable: true,
  });
  window.addEventListener(SESSION_REVOKED_EVENT, () => {
    revoked += 1;
  });

  mockFetch((url) => {
    if (pathOf(url) === "/me/profile") {
      return jsonResponse(401, { message: "Unauthorized" });
    }
    if (pathOf(url) === "/auth/refresh") {
      throw new TypeError("Failed to fetch");
    }
    return jsonResponse(404, {});
  });

  setAccessToken("still-valid-locally");
  await assert.rejects(() => apiRequest("/me/profile"), /Failed to fetch/);
  assert.equal(getAccessToken(), "still-valid-locally");
  assert.equal(revoked, 0);
});

test("403 does not trigger refresh", async () => {
  let refreshHits = 0;
  mockFetch((url) => {
    if (pathOf(url) === "/auth/refresh") {
      refreshHits += 1;
      return jsonResponse(200, { accessToken: "x", user: {} });
    }
    return jsonResponse(403, { message: "Forbidden" });
  });
  setAccessToken("tok");
  await assert.rejects(() => apiRequest("/me/profile"), (err: unknown) => {
    assert.ok(err instanceof ApiError);
    assert.equal(err.status, 403);
    return true;
  });
  assert.equal(refreshHits, 0);
});

test("logout revokes remotely and clears memory", async () => {
  let logoutHits = 0;
  mockFetch((url, init) => {
    if (pathOf(url) === "/auth/logout") {
      logoutHits += 1;
      assert.equal(init?.credentials, "include");
      assert.equal(
        (init?.headers as Record<string, string>)["X-Soma-Requested-With"],
        "soma-web",
      );
      return jsonResponse(200, { ok: true });
    }
    return jsonResponse(404, {});
  });

  setAccessToken("still-here");
  const result = await logout();
  assert.equal(result.remoteRevoked, true);
  assert.equal(getAccessToken(), null);
  assert.equal(logoutHits, 1);
});

test("logout during pending refresh discards late access token", async () => {
  let resolveRefresh: ((r: Response) => void) | null = null;
  mockFetch((url) => {
    if (pathOf(url) === "/auth/refresh") {
      return new Promise<Response>((resolve) => {
        resolveRefresh = resolve;
      });
    }
    if (pathOf(url) === "/auth/logout") {
      return jsonResponse(200, { ok: true });
    }
    return jsonResponse(404, {});
  });

  const refreshPromise = refreshAccessSession();
  await logout();
  resolveRefresh!(
    jsonResponse(200, {
      accessToken: "late-token",
      user: { id: "1", email: "a@b.c", displayName: "A" },
    }),
  );
  const result = await refreshPromise;
  assert.equal(result.ok, false);
  assert.equal(getAccessToken(), null);
});

test("no refresh loop: retry uses skipRefresh", async () => {
  let refreshHits = 0;
  let profileHits = 0;
  mockFetch((url) => {
    const path = pathOf(url);
    if (path === "/auth/refresh") {
      refreshHits += 1;
      return jsonResponse(200, {
        accessToken: "new",
        user: { id: "1", email: "a@b.c", displayName: "A" },
      });
    }
    if (path === "/me/profile") {
      profileHits += 1;
      // Always 401 even after refresh — should not loop.
      return jsonResponse(401, { message: "Unauthorized" });
    }
    return jsonResponse(404, {});
  });

  setAccessToken("stale");
  await assert.rejects(() => apiRequest("/me/profile"), ApiError);
  assert.equal(refreshHits, 1);
  assert.equal(profileHits, 2);
});
