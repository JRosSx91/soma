import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { LanguageSelector } from "../components/LanguageSelector.js";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, translateAuthError } from "../features/auth/index.js";
import {
  fetchUserProfile,
  outcomeFromProfileFetch,
  skipOnboardingWithoutClearingUsages,
} from "../features/profile/index.js";

type Gate =
  | { mode: "form" }
  | { mode: "resolving" }
  | { mode: "pending" }
  | { mode: "unknown" };

export function LoginPage() {
  const { t } = useTranslation(["auth", "common"]);
  const { login, user, loading, sessionNotice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [gate, setGate] = useState<Gate>({ mode: "form" });
  /** Avoids duplicate GET under StrictMode remount for the same user. */
  const resolvedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      resolvedUserId.current = null;
      setGate({ mode: "form" });
      return;
    }
    if (loading) return;
    if (resolvedUserId.current === user.id) return;

    let cancelled = false;
    setGate({ mode: "resolving" });
    setError(null);

    void fetchUserProfile()
      .then((profile) => {
        if (cancelled) return;
        resolvedUserId.current = user.id;
        const outcome = outcomeFromProfileFetch({ ok: true, profile });
        if (outcome.kind === "pending") {
          setGate({ mode: "pending" });
        } else if (outcome.kind === "app") {
          navigate("/app", { replace: true });
        } else {
          setGate({ mode: "unknown" });
        }
      })
      .catch(() => {
        if (cancelled) return;
        // Do not invent a status or PATCH. Educational app remains reachable.
        resolvedUserId.current = user.id;
        setGate({ mode: "unknown" });
      });

    return () => {
      cancelled = true;
    };
  }, [user, loading, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      // Clear so the effect re-resolves for this session (StrictMode-safe).
      resolvedUserId.current = null;
      setGate({ mode: "resolving" });
      // Destination is decided by the effect once `user` is committed.
    } catch (err) {
      setError(translateAuthError(err, t, "errors.loginFailed"));
      setGate({ mode: "form" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnterWithoutTracking = async () => {
    setError(null);
    setSkipping(true);
    try {
      const result = await skipOnboardingWithoutClearingUsages();
      if (!result.ok) {
        setError(t("login.pendingSkipFailed"));
        return;
      }
      navigate("/app", { replace: true });
    } catch {
      setError(t("login.pendingSkipFailed"));
    } finally {
      setSkipping(false);
    }
  };

  const handleRetryStatus = () => {
    if (!user) return;
    resolvedUserId.current = null;
    setError(null);
    setGate({ mode: "resolving" });
    // Re-trigger effect by clearing then setting — force re-run:
    void fetchUserProfile()
      .then((profile) => {
        resolvedUserId.current = user.id;
        const outcome = outcomeFromProfileFetch({ ok: true, profile });
        if (outcome.kind === "pending") setGate({ mode: "pending" });
        else if (outcome.kind === "app") navigate("/app", { replace: true });
        else setGate({ mode: "unknown" });
      })
      .catch(() => {
        resolvedUserId.current = user.id;
        setGate({ mode: "unknown" });
      });
  };

  if (loading || gate.mode === "resolving") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        {t("login.pendingLoading")}
      </div>
    );
  }

  if (user && gate.mode === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-light tracking-wide">{t("appName")}</h1>
            <p className="text-sm text-soma-fg-secondary mt-3">
              {t("login.pendingTitle")}
            </p>
            <p className="text-xs text-soma-fg-muted mt-2">
              {t("login.pendingBody")}
            </p>
          </div>
          {error && (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={skipping}
            onClick={() => navigate("/onboarding", { replace: true })}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {t("login.pendingContinueSetup")}
          </button>
          <button
            type="button"
            disabled={skipping}
            onClick={() => void handleEnterWithoutTracking()}
            className="w-full border border-soma-border-subtle text-soma-fg-primary rounded px-4 py-2 hover:border-soma-accent transition-colors disabled:opacity-50"
          >
            {skipping
              ? t("login.pendingSkipping")
              : t("login.pendingEnterApp")}
          </button>
        </div>
      </div>
    );
  }

  if (user && gate.mode === "unknown") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4">
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
        <div className="w-full max-w-sm space-y-4">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-light tracking-wide">{t("appName")}</h1>
            <p className="text-sm text-soma-fg-secondary mt-3">
              {t("login.statusUnknownTitle")}
            </p>
            <p className="text-xs text-soma-fg-muted mt-2">
              {t("login.statusUnknownBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app", { replace: true })}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity"
          >
            {t("login.enterAppEducational")}
          </button>
          <button
            type="button"
            onClick={handleRetryStatus}
            className="w-full border border-soma-border-subtle text-soma-fg-primary rounded px-4 py-2 hover:border-soma-accent transition-colors"
          >
            {t("login.retryStatus")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-wide">{t("appName")}</h1>
          <p className="text-xs text-soma-fg-muted mt-2">
            {t("login.subtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t("login.email")}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
              {t("login.password")}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-soma-bg-surface border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
              autoComplete="current-password"
            />
            <p className="mt-2 text-right text-xs">
              <Link
                to="/forgot-password"
                className="text-soma-fg-muted hover:text-soma-accent hover:underline"
              >
                {t("login.forgotPassword")}
              </Link>
            </p>
          </div>

          {sessionNotice === "session_expired" && !error ? (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {t("errors.sessionExpired")}
            </p>
          ) : null}
          {error && (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-fg-muted">
          {t("login.noAccount")}{" "}
          <Link to="/register" className="text-soma-accent hover:underline">
            {t("login.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
}
