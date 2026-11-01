import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import enOnboarding from "../../../i18n/locales/en/onboarding.json" with { type: "json" };
import esOnboarding from "../../../i18n/locales/es/onboarding.json" with { type: "json" };
import {
  logOnboardingLoadInDev,
  onboardingLoadDebugPayload,
  resolveOnboardingLoadView,
} from "./onboarding-load-state.js";

const page = readFileSync(
  new URL("../../../pages/OnboardingPage.tsx", import.meta.url),
  "utf8",
);
const registerPage = readFileSync(
  new URL("../../../pages/RegisterPage.tsx", import.meta.url),
  "utf8",
);
const app = readFileSync(new URL("../../../App.tsx", import.meta.url), "utf8");
const authContext = readFileSync(
  new URL("../../auth/context/AuthContext.tsx", import.meta.url),
  "utf8",
);
const authApi = readFileSync(
  new URL("../../auth/client/auth-api.ts", import.meta.url),
  "utf8",
);
const substancesHook = readFileSync(
  new URL("../../substances/use-substances.ts", import.meta.url),
  "utf8",
);
const profileHook = readFileSync(
  new URL("../../profile/hooks/useUserProfile.ts", import.meta.url),
  "utf8",
);

test("catalog still loading keeps the spinner even if profile already failed", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: true,
      catalog: null,
      profileLoading: false,
      profile: null,
      profileError: "failed",
    }),
    "loading",
  );
});

test("successful catalog including an empty list is not a catalog error", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: [],
      profileLoading: true,
      profile: null,
      profileError: null,
    }),
    "loading",
  );
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: [{ id: "alcohol" }],
      profileLoading: false,
      profile: { onboardingStatus: "pending" },
      profileError: null,
    }),
    "ready",
  );
});

test("finished catalog fetch with null data is a terminal catalog error, not loading", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: null,
      profileLoading: true,
      profile: null,
      profileError: null,
    }),
    "catalogError",
  );
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: null,
      profileLoading: false,
      profile: { onboardingStatus: "pending" },
      profileError: null,
    }),
    "catalogError",
  );
});

test("profile still loading after a ready catalog keeps the spinner", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: [{ id: "alcohol" }],
      profileLoading: true,
      profile: null,
      profileError: null,
    }),
    "loading",
  );
});

test("finished profile fetch with error is terminal after the catalog is ready", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: [{ id: "alcohol" }],
      profileLoading: false,
      profile: null,
      profileError: "Failed to load profile",
    }),
    "profileError",
  );
});

test("finished profile fetch with null profile and no error is still terminal", () => {
  assert.equal(
    resolveOnboardingLoadView({
      catalogLoading: false,
      catalog: [{ id: "alcohol" }],
      profileLoading: false,
      profile: null,
      profileError: null,
    }),
    "profileError",
  );
});

test("onboarding page uses the load resolver and no longer spins on !substances", () => {
  assert.match(page, /resolveOnboardingLoadView/);
  assert.match(page, /loadView === "catalogError"/);
  assert.match(page, /loadView === "profileError"/);
  assert.doesNotMatch(
    page,
    /if \(loadingSubstances \|\| loadingProfile \|\| !substances\)/,
  );
  assert.match(page, /retrySubstances/);
  assert.match(page, /catalogLoadError/);
  assert.match(page, /needsSpecialCategoryConsent\(profile\)/);
  assert.match(page, /SpecialCategoryConsentCard/);
});

test("catalog retry is user-initiated and does not loop automatically", () => {
  assert.match(substancesHook, /const retry = useCallback/);
  assert.match(substancesHook, /setAttempt\(\(current\) => current \+ 1\)/);
  assert.match(page, /onClick=\{retrySubstances\}/);
  assert.doesNotMatch(substancesHook, /setInterval/);
  assert.doesNotMatch(page, /retrySubstances\(\)/);
});

test("profile hook clears loading after a finished error", () => {
  assert.match(profileHook, /setError\(/);
  assert.match(profileHook, /finally \{\s*setLoading\(false\);/s);
});

test("register still hands a fresh session into /onboarding without changing token storage", () => {
  assert.match(registerPage, /navigate\("\/onboarding", \{ replace: true \}\)/);
  assert.match(registerPage, /completingRegistration/);
  assert.match(authApi, /setAccessToken\(response\.accessToken\)/);
  assert.match(authApi, /fetchCurrentUser/);
  assert.match(authContext, /await registerApi\(credentials\);/);
  assert.match(authContext, /const fullUser = await fetchCurrentUser\(\);/);
  assert.match(app, /path="\/onboarding" element=\{<OnboardingPage \/>\}/);
  assert.match(app, /<Route element=\{<ProtectedLayout \/>\}>/);
});

test("dev load debug payload has no token, cookie, or identity fields", () => {
  const payload = onboardingLoadDebugPayload("catalogError");
  assert.deepEqual(payload, {
    source: "onboarding-load",
    kind: "catalogError",
  });
  const keys = Object.keys(payload).sort();
  assert.deepEqual(keys, ["kind", "source"]);
  assert.equal(typeof logOnboardingLoadInDev, "function");
  assert.match(page, /logOnboardingLoadInDev\(loadView\)/);
});

test("catalog error copy exists in english and spanish and shares Retry", () => {
  assert.equal(
    enOnboarding.catalogLoadError,
    "Could not load the substance list. Check your connection and try again.",
  );
  assert.equal(
    enOnboarding.catalogLoadErrorHint,
    "Your account and consents are unchanged. Tracking is not edited until the list loads.",
  );
  assert.equal(enOnboarding.retryLoad, "Retry");
  assert.equal(
    esOnboarding.catalogLoadError,
    "No se ha podido cargar la lista de sustancias. Comprueba la conexión e inténtalo de nuevo.",
  );
  assert.equal(
    esOnboarding.catalogLoadErrorHint,
    "Tu cuenta y tus consentimientos no se modifican. El seguimiento no se edita hasta que la lista cargue.",
  );
  assert.equal(esOnboarding.retryLoad, "Reintentar");
});
