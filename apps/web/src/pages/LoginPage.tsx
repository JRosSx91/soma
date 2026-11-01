import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth, translateAuthError } from "../features/auth/index.js";
import { useRegistrationMode } from "../features/auth/context/RegistrationModeContext.js";
import { unauthenticatedDestination } from "../features/auth/lib/unauthenticated-destination.js";
import { AuthPasswordField } from "../features/auth/components/AuthPasswordField.js";
import {
  AuthShell,
  authFieldClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  authSubtitleClass,
  authTitleClass,
} from "../features/auth/components/AuthShell.js";
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
  const registrationMode = useRegistrationMode();
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
      <AuthShell>
        <p className="text-sm text-soma-ink-secondary" role="status">
          {loading && !user
            ? t("login.sessionChecking")
            : t("login.pendingLoading")}
        </p>
      </AuthShell>
    );
  }

  if (!user && unauthenticatedDestination(sessionNotice) === "/") {
    return <Navigate to="/" replace />;
  }

  if (user && gate.mode === "pending") {
    return (
      <AuthShell>
        <div className="space-y-4">
          <div className="mb-4">
            <h1 className="text-3xl font-light tracking-wide text-soma-ink">
              {t("appName")}
            </h1>
            <p className="mt-3 text-sm text-soma-ink-secondary">
              {t("login.pendingTitle")}
            </p>
            <p className="mt-2 text-xs text-soma-ink-muted">
              {t("login.pendingBody")}
            </p>
          </div>
          {error && (
            <p
              id="login-pending-error"
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {error}
            </p>
          )}
          <button
            type="button"
            disabled={skipping}
            onClick={() => navigate("/onboarding", { replace: true })}
            className={authPrimaryButtonClass}
          >
            {t("login.pendingContinueSetup")}
          </button>
          <button
            type="button"
            disabled={skipping}
            aria-busy={skipping || undefined}
            onClick={() => void handleEnterWithoutTracking()}
            className={authSecondaryButtonClass}
          >
            {skipping
              ? t("login.pendingSkipping")
              : t("login.pendingEnterApp")}
          </button>
        </div>
      </AuthShell>
    );
  }

  if (user && gate.mode === "unknown") {
    return (
      <AuthShell>
        <div className="space-y-4">
          <div className="mb-4">
            <h1 className="text-3xl font-light tracking-wide text-soma-ink">
              {t("appName")}
            </h1>
            <p className="mt-3 text-sm text-soma-ink-secondary">
              {t("login.statusUnknownTitle")}
            </p>
            <p className="mt-2 text-xs text-soma-ink-muted">
              {t("login.statusUnknownBody")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/app", { replace: true })}
            className={authPrimaryButtonClass}
          >
            {t("login.enterAppEducational")}
          </button>
          <button
            type="button"
            onClick={handleRetryStatus}
            className={authSecondaryButtonClass}
          >
            {t("login.retryStatus")}
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>{t("login.title")}</h1>
          <p className={authSubtitleClass}>{t("login.subtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("login.email")}
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={authFieldClass}
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-xs uppercase tracking-wider text-soma-ink-secondary"
            >
              {t("login.password")}
            </label>
            <AuthPasswordField
              id="login-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <p className="mt-2 text-right text-xs">
              <Link to="/forgot-password" className={authLinkClass}>
                {t("login.forgotPassword")}
              </Link>
            </p>
          </div>

          {sessionNotice === "session_expired" && !error ? (
            <p
              id="login-session-notice"
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {t("errors.sessionExpired")}
            </p>
          ) : null}
          {error && (
            <p
              id="login-form-error"
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting || undefined}
            className={authPrimaryButtonClass}
          >
            {submitting ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-soma-ink-muted">
          {registrationMode.status === "ready" &&
          registrationMode.mode === "open" ? (
            <>
              {t("login.noAccount")}{" "}
              <Link to="/register" className={authLinkClass}>
                {t("login.createOne")}
              </Link>
            </>
          ) : null}
          {registrationMode.status === "ready" &&
          registrationMode.mode === "invite"
            ? t("login.inviteOnly")
            : null}
          {registrationMode.status === "error"
            ? t("login.registrationUnavailable")
            : null}
        </p>
      </div>
    </AuthShell>
  );
}
