import assert from "node:assert/strict";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enAuth from "../../../i18n/locales/en/auth.json" with { type: "json" };
import { ForgotPasswordPage } from "../../../pages/ForgotPasswordPage.js";
import { ResetPasswordPage } from "../../../pages/ResetPasswordPage.js";
import { LoginPage } from "../../../pages/LoginPage.js";
import { RegisterPage } from "../../../pages/RegisterPage.js";
import { AuthContext } from "../context/AuthContext.js";
import { resetHeldPasswordResetTokenForTests } from "./password-reset-validation.js";

function resetTokenState() {
  resetHeldPasswordResetTokenForTests();
}

async function ensureI18n() {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      resources: { en: { auth: enAuth, common: {} } },
      defaultNS: "auth",
      interpolation: { escapeValue: false },
    });
  }
}

function wrap(node: ReactNode, initialEntries: string[] = ["/"]) {
  return createElement(
    I18nextProvider,
    { i18n },
    createElement(MemoryRouter, { initialEntries }, node),
  );
}

const guestAuth = {
  user: null,
  loading: false,
  status: "anonymous" as const,
  error: null,
  sessionNotice: null,
  hasAccessToken: false,
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => ({ remoteRevoked: true }),
  applyProfileUser: () => undefined,
};

test("ForgotPasswordPage renders email field and back link", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(createElement(ForgotPasswordPage), ["/forgot-password"]),
  );
  assert.match(html, /Reset your password/);
  assert.match(html, /Send reset instructions/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /type="email"/);
});

test("ResetPasswordPage renders form when token present and strips query", async () => {
  await ensureI18n();
  resetTokenState();
  const replaced: string[] = [];
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: {
        replaceState: (_s: unknown, _t: string, url: string) => {
          replaced.push(String(url));
        },
      },
      location: { pathname: "/reset-password", hash: "", search: "?token=abc" },
    },
  });

  const html = renderToStaticMarkup(
    wrap(createElement(ResetPasswordPage), [
      "/reset-password?token=tok_abcdefghijklmnopqrstuvwxyz0123",
    ]),
  );

  assert.match(html, /Choose a new password/);
  assert.match(html, /Update password/);
  assert.match(html, /name="referrer"/);
  assert.match(html, /content="no-referrer"/);
  assert.equal(html.includes("tok_abcdefghijklmnopqrstuvwxyz0123"), false);
  assert.ok(replaced.some((u) => !u.includes("token=")));
  assert.match(
    html,
    /If an account exists|Choose a new password/,
  );
});

test("ResetPasswordPage shows missing-token state without query", async () => {
  await ensureI18n();
  resetTokenState();
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: { replaceState: () => undefined },
      location: { pathname: "/reset-password", hash: "", search: "" },
    },
  });

  const html = renderToStaticMarkup(
    wrap(createElement(ResetPasswordPage), ["/reset-password"]),
  );
  assert.match(html, /This reset link is incomplete/);
  assert.match(html, /href="\/forgot-password"/);
});

test("ForgotPasswordPage confirmation copy stays anti-enumeration", async () => {
  await ensureI18n();
  const confirmation = i18n.t("forgotPassword.confirmation", { ns: "auth" });
  assert.match(confirmation, /If an account exists/i);
  assert.equal(/has been sent|email delivery is available/i.test(confirmation), false);
});

test("LoginPage links to forgot-password", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(LoginPage),
      ),
      ["/login"],
    ),
  );
  assert.match(html, /Forgot your password\?/);
  assert.match(html, /href="\/forgot-password"/);
  assert.match(html, /Sign in/);
  assert.match(html, /type="email"/);
  assert.match(html, /type="password"/);
});

test("RegisterPage still renders core fields (no regression)", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(RegisterPage),
      ),
      ["/register"],
    ),
  );
  assert.match(html, /Create your account/);
  assert.match(html, /Create account/);
  assert.match(html, /type="email"/);
  assert.match(html, /href="\/login"/);
});
