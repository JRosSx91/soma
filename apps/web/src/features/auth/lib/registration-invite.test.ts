import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  REGISTRATION_INVITE_BOOTSTRAP_KEY,
  captureAndStripInviteToken,
  resetHeldRegistrationInviteTokenForTests,
  takeRegistrationInviteToken,
} from "./registration-invite.js";

afterEach(() => {
  resetHeldRegistrationInviteTokenForTests();
});

test("captureAndStripInviteToken removes invite from URL and keeps other params", () => {
  const replaced: string[] = [];
  const token = captureAndStripInviteToken(
    "?invite=abc_invite_token_value&lang=es",
    (url) => replaced.push(url),
    "/register",
    "",
  );
  assert.equal(token, "abc_invite_token_value");
  assert.deepEqual(replaced, ["/register?lang=es"]);
});

test("captureAndStripInviteToken returns null when invite is absent", () => {
  const replaced: string[] = [];
  const token = captureAndStripInviteToken(
    "?lang=es",
    (url) => replaced.push(url),
    "/register",
    "",
  );
  assert.equal(token, null);
  assert.equal(replaced.length, 0);
});

test("captureAndStripInviteToken never writes to persistent storage", () => {
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
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    value: storage,
    configurable: true,
  });

  const secret = "inv_should_not_persist_anywhere_12345";
  const captured = captureAndStripInviteToken(
    `?invite=${secret}`,
    () => undefined,
    "/register",
    "",
  );
  assert.equal(captured, secret);
  assert.equal(store.size, 0);
  assert.equal(localStorage.getItem("invite"), null);
  assert.equal(sessionStorage.getItem("invite"), null);
  for (const value of store.values()) {
    assert.equal(value.includes(secret), false);
  }
});

test("takeRegistrationInviteToken prefers HTML bootstrap then holds in memory", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: { replaceState: () => undefined },
      location: { pathname: "/register", hash: "", search: "" },
      [REGISTRATION_INVITE_BOOTSTRAP_KEY]: "boot_invite_from_html",
    },
  });

  const first = takeRegistrationInviteToken("");
  const second = takeRegistrationInviteToken("?invite=should_not_win");
  assert.equal(first, "boot_invite_from_html");
  assert.equal(second, "boot_invite_from_html");
  assert.equal(
    (globalThis.window as Window & { [REGISTRATION_INVITE_BOOTSTRAP_KEY]?: string })[
      REGISTRATION_INVITE_BOOTSTRAP_KEY
    ],
    undefined,
  );
});

test("takeRegistrationInviteToken strips once and survives remount", () => {
  const replaced: string[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: {
        replaceState: (_s: unknown, _t: string, url: string) => {
          replaced.push(String(url));
        },
      },
      location: {
        pathname: "/register",
        hash: "",
        search: "?invite=from_query_invite_value",
      },
    },
  });

  const first = takeRegistrationInviteToken("?invite=from_query_invite_value");
  const second = takeRegistrationInviteToken("");
  assert.equal(first, "from_query_invite_value");
  assert.equal(second, "from_query_invite_value");
  assert.equal(replaced.length, 1);
  assert.ok(replaced.every((u) => !u.includes("invite=")));
});
