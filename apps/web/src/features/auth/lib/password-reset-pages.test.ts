import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import i18n from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { test } from "node:test";
import enAuth from "../../../i18n/locales/en/auth.json" with { type: "json" };
import enCommon from "../../../i18n/locales/en/common.json" with { type: "json" };
import { ForgotPasswordPage } from "../../../pages/ForgotPasswordPage.js";
import { ResetPasswordPage } from "../../../pages/ResetPasswordPage.js";
import { LoginPage } from "../../../pages/LoginPage.js";
import { RegisterPage } from "../../../pages/RegisterPage.js";
import { AuthContext } from "../context/AuthContext.js";
import { RegistrationModeProvider } from "../context/RegistrationModeContext.js";
import type { RegistrationModeState } from "../client/registration-mode.js";
import { resetHeldPasswordResetTokenForTests } from "./password-reset-validation.js";
import { resetHeldRegistrationInviteTokenForTests } from "./registration-invite.js";

function resetTokenState() {
  resetHeldPasswordResetTokenForTests();
}

async function ensureI18n() {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      resources: { en: { auth: enAuth, common: enCommon } },
      defaultNS: "auth",
      interpolation: { escapeValue: false },
    });
  } else {
    i18n.addResourceBundle("en", "common", enCommon, true, true);
  }
}

function wrap(
  node: ReactNode,
  initialEntries: string[] = ["/"],
  registration?: RegistrationModeState,
) {
  const inner = registration
    ? createElement(RegistrationModeProvider, { value: registration }, node)
    : node;
  return createElement(
    I18nextProvider,
    { i18n },
    createElement(MemoryRouter, { initialEntries }, inner),
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
  clearSessionAfterAccountDeletion: () => undefined,
};

test("ForgotPasswordPage renders email field and back link", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(createElement(ForgotPasswordPage), ["/forgot-password"]),
  );
  assert.match(html, /Recover your access/);
  assert.match(html, /Send reset instructions/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /type="email"/);
  assert.match(html, /for="forgot-email"/);
  assert.match(html, /id="forgot-email"/);
  assert.match(html, /autocomplete="email"/i);
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

  assert.match(html, /Create a new password/);
  assert.match(html, /Update password/);
  assert.equal((html.match(/type="password"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-label="Show password"/g) ?? []).length, 2);
  assert.equal((html.match(/autocomplete="new-password"/gi) ?? []).length, 2);
  assert.match(html, /for="reset-password"/);
  assert.match(html, /id="reset-password"/);
  assert.match(html, /for="reset-confirm-password"/);
  assert.match(html, /id="reset-confirm-password"/);
  assert.equal(html.includes("aria-invalid"), false);
  assert.match(html, /name="referrer"/);
  assert.match(html, /content="no-referrer"/);
  assert.equal(html.includes("tok_abcdefghijklmnopqrstuvwxyz0123"), false);
  assert.ok(replaced.some((u) => !u.includes("token=")));
  assert.match(
    html,
    /If an account exists|Create a new password/,
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

test("LoginPage with signed_out still shows the sign-in form", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        {
          value: { ...guestAuth, sessionNotice: "signed_out" },
        },
        createElement(LoginPage),
      ),
      ["/login"],
    ),
  );
  assert.match(html, /Welcome back/);
  assert.match(html, /Sign in/);
  assert.match(html, /type="email"/);
});

test("LoginPage with account_deleted does not keep the visitor on login", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        {
          value: { ...guestAuth, sessionNotice: "account_deleted" },
        },
        createElement(LoginPage),
      ),
      ["/login"],
    ),
  );
  assert.equal(html.includes("Welcome back"), false);
  assert.equal(html.includes("Sign in"), false);
});

test("anonymous session restore does not use the setup-check copy", async () => {
  await ensureI18n();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: { ...guestAuth, loading: true, status: "checking" } },
        createElement(LoginPage),
      ),
      ["/login"],
    ),
  );
  assert.match(html, /Checking for an existing session/);
  assert.equal(html.includes("Checking your setup"), false);

  const registerHtml = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: { ...guestAuth, loading: true, status: "checking" } },
        createElement(RegisterPage),
      ),
      ["/register"],
      { status: "ready", mode: "open" },
    ),
  );
  assert.match(registerHtml, /Checking for an existing session/);
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
  assert.match(html, /Skip to main content/);
  assert.match(html, /href="#main-content"/);
  assert.match(html, /id="main-content"/);
  assert.match(html, /type="email"/);
  assert.match(html, /type="password"/);
  assert.match(html, /type="button"/);
  assert.match(html, /aria-label="Show password"/);
  assert.match(html, /for="login-email"/);
  assert.match(html, /id="login-email"/);
  assert.match(html, /for="login-password"/);
  assert.match(html, /id="login-password"/);
  assert.match(html, /autocomplete="email"/i);
  assert.match(html, /autocomplete="current-password"/i);
  assert.equal(html.includes("aria-invalid"), false);
});

test("login and forgot keep general errors as form alerts, not field descriptions", () => {
  const login = readFileSync(
    new URL("../../../pages/LoginPage.tsx", import.meta.url),
    "utf8",
  );
  const forgot = readFileSync(
    new URL("../../../pages/ForgotPasswordPage.tsx", import.meta.url),
    "utf8",
  );
  assert.match(login, /id="login-form-error"/);
  assert.match(login, /role="alert"/);
  assert.doesNotMatch(login, /aria-describedby=\{error \? "login-form-error"/);
  assert.match(forgot, /errorField === "email" \? "forgot-field-error"/);
  assert.match(
    forgot,
    /id=\{errorField === "email" \? "forgot-field-error" : "forgot-form-error"\}/,
  );
  assert.match(
    forgot,
    /aria-describedby=\{\s*errorField === "email" \? "forgot-field-error" : undefined\s*\}/,
  );
});

test("RegisterPage still renders core fields (no regression)", async () => {
  await ensureI18n();
  resetHeldRegistrationInviteTokenForTests();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(RegisterPage),
      ),
      ["/register"],
      { status: "ready", mode: "open" },
    ),
  );
  assert.match(html, /Create your Soma account/);
  assert.match(html, /Create account/);
  assert.match(html, /type="email"/);
  assert.match(html, /href="\/login"/);
  assert.match(html, /Confirm password/);
  assert.match(html, /id="register-confirm-password"/);
  assert.equal(
    (html.match(/autocomplete="new-password"/gi) ?? []).length,
    2,
  );
  assert.equal((html.match(/type="password"/g) ?? []).length, 2);
  assert.equal((html.match(/aria-label="Show password"/g) ?? []).length, 2);
  assert.doesNotMatch(html, /invitation is valid|invitación válida/i);
  assert.match(html, /for="register-display-name"/);
  assert.match(html, /id="register-display-name"/);
  assert.match(html, /for="register-email"/);
  assert.match(html, /id="register-email"/);
  assert.match(html, /for="register-password"/);
  assert.match(html, /for="register-confirm-password"/);
  assert.match(html, /for="register-biological-sex"/);
  assert.match(html, /for="register-birth-date"/);
  assert.match(html, /autocomplete="nickname"/i);
  assert.match(html, /autocomplete="email"/i);
  assert.equal(html.includes("aria-invalid"), false);
  assert.match(html, /href="\/privacy"/);
  assert.match(html, /href="\/terms"/);
  assert.match(html, /href="\/legal"/);
  assert.match(html, /href="\/cookies"/);
  assert.match(html, /id="register-accept-adult"/);
  assert.doesNotMatch(html, /register-accept-special/);
  assert.doesNotMatch(html, /privacy#privacy-special/);
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 3);
  assert.doesNotMatch(html, /type="checkbox"[^>]*checked/);
  assert.match(html, /Legal documents are still drafts/);
  assert.match(html, /development draft, not a published contract/);
  assert.match(html, /Create account/);
});

test("AuthShell lets a tall register form scroll inside the form column", () => {
  const shell = readFileSync(
    new URL("../components/AuthShell.tsx", import.meta.url),
    "utf8",
  );
  assert.match(shell, /lg:overflow-y-auto/);
  assert.match(shell, /overflow-x-clip/);
  assert.match(shell, /my-auto/);
  assert.doesNotMatch(shell, /lg:justify-center/);
  assert.match(shell, /lg:grid-cols-2/);
});

test("RegisterPage source clears password errors when the confirmation is edited", () => {
  const source = readFileSync(
    new URL("../../../pages/RegisterPage.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /setConfirmPassword\(e\.target\.value\);\s*setError\(null\);/s);
  assert.match(source, /setPassword\(e\.target\.value\);\s*setError\(null\);/s);
  assert.match(source, /prepareRegisterCredentials/);
  assert.match(source, /role="alert"/);
  assert.match(source, /errorField === "password"/);
  assert.match(source, /errorField === "confirm"/);
  assert.match(source, /register-form-error/);
  assert.doesNotMatch(source, /aria-invalid=\{error \? true/);
});

test("RegisterPage captures invite, strips URL, keeps form, no-referrer", async () => {
  await ensureI18n();
  resetHeldRegistrationInviteTokenForTests();
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
        search: "?invite=abc_invite_from_query&lang=es",
      },
    },
  });

  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(RegisterPage),
      ),
      ["/register?invite=abc_invite_from_query&lang=es"],
      { status: "ready", mode: "invite" },
    ),
  );

  assert.match(html, /Start your journey/);
  assert.match(html, /closed beta/i);
  assert.match(html, /name="referrer"/);
  assert.match(html, /content="no-referrer"/);
  assert.equal(html.includes("abc_invite_from_query"), false);
  assert.ok(replaced.some((u) => u.includes("lang=es")));
  assert.ok(replaced.every((u) => !u.includes("invite=")));
  assert.doesNotMatch(html, /invitation is valid|invitación válida/i);
});

test("RegisterPage invite mode without token does not render a form", async () => {
  await ensureI18n();
  resetHeldRegistrationInviteTokenForTests();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(RegisterPage),
      ),
      ["/register"],
      { status: "ready", mode: "invite" },
    ),
  );
  assert.match(html, /Invitation required/);
  assert.equal(html.includes('type="email"'), false);
  assert.match(html, /href="\/"/);
  assert.match(html, /href="\/login"/);
});

test("RegisterPage does not assume invite when the mode request fails", async () => {
  await ensureI18n();
  resetHeldRegistrationInviteTokenForTests();
  const html = renderToStaticMarkup(
    wrap(
      createElement(
        AuthContext.Provider,
        { value: guestAuth },
        createElement(RegisterPage),
      ),
      ["/register"],
      { status: "error", mode: null },
    ),
  );
  assert.match(html, /temporarily unavailable/i);
  assert.equal(html.includes("Invitation required"), false);
  assert.equal(html.includes('type="email"'), false);
});

