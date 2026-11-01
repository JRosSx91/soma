import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubstances } from "../features/substances/index.js";
import {
  logOnboardingLoadInDev,
  resolveOnboardingLoadView,
} from "../features/onboarding/lib/onboarding-load-state.js";
import { useUserProfile } from "../features/profile/index.js";
import type { UsageInput } from "../features/profile/index.js";
import {
  isSpecialCategoryWriteBlocked,
  needsSpecialCategoryConsent,
  persistOnboardingCompletion,
  shouldConfirmClearUsages,
  skipOnboardingWithoutClearingUsages,
  SpecialCategoryConsentCard,
} from "../features/profile/index.js";
import { achievementSync } from "../features/achievements/sync/achievement-sync.js";
import {
  OnboardingShell,
  onboardingCardActiveClass,
  onboardingCardClass,
  onboardingCardIdleClass,
  onboardingDetailsClosedClass,
  onboardingDetailsClass,
  onboardingDetailsOpenClass,
  onboardingLabelClass,
  onboardingSegmentActiveClass,
  onboardingSegmentButtonClass,
  onboardingSegmentIdleClass,
  onboardingSegmentTrackClass,
} from "../features/onboarding/components/OnboardingShell.js";
import {
  authFieldClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  authSubtitleClass,
  authTitleClass,
} from "../features/auth/components/AuthShell.js";
import { previewFocus } from "../features/recovery-dashboard/focus.js";

type UsageMode = "abstinent" | "active";

interface SubstanceFormState {
  active: boolean;
  mode: UsageMode;
  yearStarted: string;
  lastUseDate: string;
  frequency: UsageInput["frequency"];
}

const FREQUENCY_KEYS: Array<{
  value: UsageInput["frequency"];
  labelKey: string;
}> = [
  { value: "daily", labelKey: "frequency.daily" },
  { value: "weekly", labelKey: "frequency.weekly" },
  { value: "monthly", labelKey: "frequency.monthly" },
  { value: "occasional", labelKey: "frequency.occasional" },
];

const TODAY = new Date().toISOString().split("T")[0];

const EMPTY_STATE: SubstanceFormState = {
  active: false,
  mode: "abstinent",
  yearStarted: "",
  lastUseDate: "",
  frequency: "daily",
};

function toDateInputValue(isoDate: string): string {
  return isoDate.split("T")[0];
}

export function OnboardingPage() {
  const { t } = useTranslation(["onboarding", "substances", "common"]);
  const navigate = useNavigate();
  const {
    data: substances,
    loading: loadingSubstances,
    retry: retrySubstances,
  } = useSubstances();
  const {
    profile,
    loading: loadingProfile,
    error: profileError,
    refresh,
  } = useUserProfile();
  const loadView = resolveOnboardingLoadView({
    catalogLoading: loadingSubstances,
    catalog: substances,
    profileLoading: loadingProfile,
    profile,
    profileError,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<{
    substanceId: string;
    field: "yearStarted" | "lastUseDate";
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [awaitingStatusRetry, setAwaitingStatusRetry] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [formState, setFormState] = useState<
    Record<string, SubstanceFormState>
  >({});
  const [initialized, setInitialized] = useState(false);
  const inFlight = useRef(false);
  /** Last PUT payload the backend accepted (wire shape), for retry compare. */
  const lastSuccessfulPut = useRef<UsageInput[] | null>(null);
  /** Fingerprint of the empty-clear intent that the user confirmed. */
  const confirmedClearFingerprint = useRef<string | null>(null);
  /** Exact validated payload frozen at confirmation time (avoids races). */
  const confirmedClearUsages = useRef<UsageInput[] | null>(null);

  useEffect(() => {
    logOnboardingLoadInDev(loadView);
  }, [loadView]);

  useEffect(() => {
    if (initialized || !profile || !substances) return;

    const initial: Record<string, SubstanceFormState> = {};
    for (const usage of profile.usages) {
      initial[usage.substanceId] = {
        active: true,
        mode: usage.status,
        yearStarted: String(usage.yearStarted),
        lastUseDate: usage.lastUseDate
          ? toDateInputValue(usage.lastUseDate)
          : "",
        frequency: usage.frequency,
      };
    }
    setFormState(initial);
    setInitialized(true);
  }, [profile, substances, initialized]);

  const updateField = (
    substanceId: string,
    field: keyof SubstanceFormState,
    value: string | boolean,
  ) => {
    // Form edits invalidate a prior clear-all confirmation.
    setConfirmClear(false);
    confirmedClearFingerprint.current = null;
    confirmedClearUsages.current = null;
    setFieldError(null);
    setFormState((prev) => ({
      ...prev,
      [substanceId]: {
        ...(prev[substanceId] ?? EMPTY_STATE),
        [field]: value,
      },
    }));
  };

  const buildUsagesFromForm = (): UsageInput[] => {
    const usages: UsageInput[] = [];
    for (const substance of substances ?? []) {
      const state = formState[substance.id];
      if (!state || !state.active) continue;

      const yearStarted = parseInt(state.yearStarted, 10);
      if (Number.isNaN(yearStarted)) {
        setFieldError({ substanceId: substance.id, field: "yearStarted" });
        throw new Error(
          t("errors.invalidYear", { substance: substance.name }),
        );
      }
      if (state.mode === "abstinent" && !state.lastUseDate) {
        setFieldError({ substanceId: substance.id, field: "lastUseDate" });
        throw new Error(
          t("errors.lastUseDateRequired", { substance: substance.name }),
        );
      }

      usages.push({
        substanceId: substance.id,
        yearStarted,
        lastUseDate: state.mode === "abstinent" ? state.lastUseDate : null,
        frequency: state.frequency,
        status: state.mode,
      });
    }
    return usages;
  };

  const persistedUsageCount = (): number => {
    if (lastSuccessfulPut.current !== null) {
      return lastSuccessfulPut.current.length;
    }
    return profile?.usages.length ?? 0;
  };

  const usagesFingerprint = (usages: UsageInput[]): string =>
    JSON.stringify(
      usages
        .map((u) => ({
          substanceId: u.substanceId,
          yearStarted: u.yearStarted,
          lastUseDate: u.status === "active" ? null : u.lastUseDate,
          frequency: u.frequency,
          status: u.status,
        }))
        .sort((a, b) => a.substanceId.localeCompare(b.substanceId)),
    );

  const persistUsagesAndComplete = async (usages: UsageInput[]) => {
    if (inFlight.current) return;
    setSubmitting(true);
    inFlight.current = true;
    try {
      const result = await persistOnboardingCompletion(usages, {
        lastSuccessfulPut: lastSuccessfulPut.current,
        awaitingStatusRetry,
        onUsagesPersisted: () => achievementSync.invalidate(),
      });

      lastSuccessfulPut.current = result.lastSuccessfulPut;

      if (!result.ok) {
        if (result.phase === "patch" && result.usagesSaved) {
          setAwaitingStatusRetry(true);
          setFieldError(null);
          setError(t("errors.statusFailed"));
        } else {
          // PUT failed — stay out of status-retry; keep draft + prior snapshot.
          setFieldError(null);
          setError(
            isSpecialCategoryWriteBlocked(result.error)
              ? t("errors.consentRequired")
              : t("errors.saveFailed"),
          );
        }
        return;
      }

      setAwaitingStatusRetry(false);
      setConfirmClear(false);
      confirmedClearFingerprint.current = null;
      confirmedClearUsages.current = null;
      navigate("/app", { replace: true });
    } catch {
      // Keep draft; do not invent completed.
      setFieldError(null);
      setError(t("errors.saveFailed"));
    } finally {
      setSubmitting(false);
      inFlight.current = false;
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current || !profile) return;
    setError(null);
    setFieldError(null);

    try {
      const usages = buildUsagesFromForm();
      const fingerprint = usagesFingerprint(usages);

      if (shouldConfirmClearUsages(persistedUsageCount(), usages.length)) {
        const confirmedForThis =
          confirmClear &&
          confirmedClearFingerprint.current === fingerprint &&
          confirmedClearUsages.current !== null;
        if (!confirmedForThis) {
          setConfirmClear(true);
          confirmedClearFingerprint.current = fingerprint;
          confirmedClearUsages.current = usages;
          return;
        }
        // Persist the frozen confirmed payload, not a later form drift.
        const frozenClearUsages = confirmedClearUsages.current;
        if (!frozenClearUsages) return;
        await persistUsagesAndComplete(frozenClearUsages);
        return;
      }

      await persistUsagesAndComplete(usages);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errors.saveFailed"));
    }
  };

  const handleSkip = async () => {
    if (inFlight.current || !profile) return;
    setError(null);
    setFieldError(null);
    setSkipping(true);
    inFlight.current = true;
    try {
      // Never PUT usages:[] — preserves any existing SubstanceUsage rows.
      const result = await skipOnboardingWithoutClearingUsages();
      if (!result.ok) {
        setError(t("errors.skipFailed"));
        return;
      }
      navigate("/app", { replace: true });
    } catch {
      setError(t("errors.skipFailed"));
    } finally {
      setSkipping(false);
      inFlight.current = false;
    }
  };

  if (loadView === "loading") {
    return (
      <OnboardingShell>
        <p className="text-sm text-soma-ink-secondary" role="status">
          {t("common:loading")}
        </p>
      </OnboardingShell>
    );
  }

  if (loadView === "catalogError") {
    return (
      <OnboardingShell>
        <div className="space-y-4">
          <p className="text-sm text-soma-organ-damaged" role="alert">
            {t("catalogLoadError")}
          </p>
          <p className="text-xs text-soma-ink-muted">
            {t("catalogLoadErrorHint")}
          </p>
          <button
            type="button"
            onClick={retrySubstances}
            className={authPrimaryButtonClass}
          >
            {t("retryLoad")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/app", { replace: true })}
            className={`${authLinkClass} text-sm`}
          >
            {t("enterAppWithoutSetup")}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (loadView === "profileError" || !profile) {
    return (
      <OnboardingShell>
        <div className="space-y-4">
          <p className="text-sm text-soma-organ-damaged" role="alert">
            {t("loadError")}
          </p>
          <p className="text-xs text-soma-ink-muted">
            {t("loadErrorHint")}
          </p>
          <button
            type="button"
            onClick={() => void refresh()}
            className={authPrimaryButtonClass}
          >
            {t("retryLoad")}
          </button>
          <button
            type="button"
            onClick={() => navigate("/app", { replace: true })}
            className={`${authLinkClass} text-sm`}
          >
            {t("enterAppWithoutSetup")}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (!substances) {
    return (
      <OnboardingShell>
        <div className="space-y-4">
          <p className="text-sm text-soma-organ-damaged" role="alert">
            {t("catalogLoadError")}
          </p>
          <p className="text-xs text-soma-ink-muted">
            {t("catalogLoadErrorHint")}
          </p>
          <button
            type="button"
            onClick={retrySubstances}
            className={authPrimaryButtonClass}
          >
            {t("retryLoad")}
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (needsSpecialCategoryConsent(profile)) {
    return (
      <OnboardingShell>
        <div className="space-y-4">
          <SpecialCategoryConsentCard
            withdrawn={profile.specialCategoryConsentWithdrawn === true}
            declineBusy={skipping}
            onGranted={() => {
              void refresh();
            }}
            onDecline={() => {
              void handleSkip();
            }}
          />
          {error ? (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </OnboardingShell>
    );
  }

  // Lock the form while saving/skipping; during clear-confirm keep fields
  // editable but block skip so it cannot be confused with a delete.
  const busy = submitting || skipping;
  const skipDisabled = busy || confirmClear;
  // Returning from Account with existing tracking / completed|skipped intent.
  const isEditingTracking =
    profile.onboardingStatus === "completed" ||
    profile.onboardingStatus === "skipped" ||
    profile.usages.length > 0;

  return (
    <OnboardingShell brandTo={isEditingTracking ? "/app/account" : "/app"}>
      <div>
        <div className="mb-8">
          <h1 className={authTitleClass}>
            {t(isEditingTracking ? "editTitle" : "title")}
          </h1>
          <p className={authSubtitleClass}>
            {t(isEditingTracking ? "editSubtitle" : "subtitle")}
          </p>
          <p className="mt-3 max-w-lg text-xs text-soma-ink-muted">
            {t(isEditingTracking ? "editPrivacyNote" : "privacyNote")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {substances.map((substance) => {
            const state = formState[substance.id] ?? EMPTY_STATE;
            const yearId = `onboarding-${substance.id}-year-started`;
            const dateId = `onboarding-${substance.id}-last-use-date`;
            const frequencyId = `onboarding-${substance.id}-frequency`;
            const modeLabelId = `onboarding-${substance.id}-mode-label`;
            const yearInvalid =
              fieldError?.substanceId === substance.id &&
              fieldError.field === "yearStarted";
            const dateInvalid =
              fieldError?.substanceId === substance.id &&
              fieldError.field === "lastUseDate";

            return (
              <div
                key={substance.id}
                className={`${onboardingCardClass} ${
                  state.active
                    ? onboardingCardActiveClass
                    : onboardingCardIdleClass
                }`}
              >
                <label
                  htmlFor={`onboarding-${substance.id}-active`}
                  className="flex cursor-pointer items-start gap-3"
                >
                  <input
                    id={`onboarding-${substance.id}-active`}
                    type="checkbox"
                    checked={state.active}
                    onChange={(e) =>
                      updateField(substance.id, "active", e.target.checked)
                    }
                    className={`${previewFocus} mt-1 h-5 w-5 shrink-0 accent-[#68D8C0]`}
                    disabled={busy}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-medium capitalize tracking-wide text-soma-ink">
                      {t(`substances:${substance.id}.name`, {
                        defaultValue: substance.name,
                      })}
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed text-soma-ink-muted">
                      {t(`substances:${substance.id}.shortDescription`, {
                        defaultValue: substance.shortDescription,
                      })}
                    </p>
                  </div>
                </label>

                <div
                  className={`${onboardingDetailsClass} ${
                    state.active
                      ? onboardingDetailsOpenClass
                      : onboardingDetailsClosedClass
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
                      <div>
                        <p
                          id={modeLabelId}
                          className={onboardingLabelClass}
                        >
                          {t("fields.mode")}
                        </p>
                        <div
                          className={onboardingSegmentTrackClass}
                          role="group"
                          aria-labelledby={modeLabelId}
                        >
                          <button
                            type="button"
                            disabled={busy || !state.active}
                            aria-pressed={state.mode === "abstinent"}
                            onClick={() =>
                              updateField(substance.id, "mode", "abstinent")
                            }
                            className={`${onboardingSegmentButtonClass} ${
                              state.mode === "abstinent"
                                ? onboardingSegmentActiveClass
                                : onboardingSegmentIdleClass
                            }`}
                          >
                            {t("mode.abstinent")}
                          </button>
                          <button
                            type="button"
                            disabled={busy || !state.active}
                            aria-pressed={state.mode === "active"}
                            onClick={() =>
                              updateField(substance.id, "mode", "active")
                            }
                            className={`${onboardingSegmentButtonClass} ${
                              state.mode === "active"
                                ? onboardingSegmentActiveClass
                                : onboardingSegmentIdleClass
                            }`}
                          >
                            {t("mode.active")}
                          </button>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-soma-ink-muted">
                          {state.mode === "abstinent"
                            ? t("mode.abstinentDescription")
                            : t("mode.activeDescription")}
                        </p>
                      </div>

                      {state.mode === "abstinent" && (
                        <div>
                          <label
                            htmlFor={dateId}
                            className={onboardingLabelClass}
                          >
                            {t("fields.lastUseDate")}
                          </label>
                          <input
                            id={dateId}
                            type="date"
                            required={state.active}
                            max={TODAY}
                            value={state.lastUseDate}
                            disabled={busy || !state.active}
                            aria-invalid={dateInvalid ? true : undefined}
                            aria-describedby={
                              dateInvalid ? "onboarding-form-error" : undefined
                            }
                            onChange={(e) =>
                              updateField(
                                substance.id,
                                "lastUseDate",
                                e.target.value,
                              )
                            }
                            className={authFieldClass}
                          />
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={yearId}
                            className={onboardingLabelClass}
                          >
                            {t("fields.yearStarted")}
                          </label>
                          <input
                            id={yearId}
                            type="number"
                            required={state.active}
                            min={1900}
                            max={new Date().getFullYear()}
                            value={state.yearStarted}
                            disabled={busy || !state.active}
                            aria-invalid={yearInvalid ? true : undefined}
                            aria-describedby={
                              yearInvalid ? "onboarding-form-error" : undefined
                            }
                            onChange={(e) =>
                              updateField(
                                substance.id,
                                "yearStarted",
                                e.target.value,
                              )
                            }
                            className={authFieldClass}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={frequencyId}
                            className={onboardingLabelClass}
                          >
                            {t("fields.frequency")}
                          </label>
                          <select
                            id={frequencyId}
                            value={state.frequency}
                            disabled={busy || !state.active}
                            onChange={(e) =>
                              updateField(
                                substance.id,
                                "frequency",
                                e.target.value as UsageInput["frequency"],
                              )
                            }
                            className={`${authFieldClass} scheme-dark`}
                          >
                            {FREQUENCY_KEYS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {t(opt.labelKey)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {error && (
            <p
              id="onboarding-form-error"
              className="text-sm text-soma-organ-damaged"
              role="alert"
            >
              {error}
            </p>
          )}

          {confirmClear ? (
            <div
              className={`${onboardingCardClass} space-y-3`}
              role="alertdialog"
              aria-labelledby="clear-usages-title"
              aria-describedby="clear-usages-body"
            >
              <p
                id="clear-usages-title"
                className="text-sm text-soma-ink"
              >
                {t("clearConfirmTitle")}
              </p>
              <p id="clear-usages-body" className="text-xs text-soma-ink-muted">
                {t("clearConfirmBody")}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => {
                    setConfirmClear(false);
                    confirmedClearFingerprint.current = null;
                    confirmedClearUsages.current = null;
                  }}
                  className={`${authSecondaryButtonClass} sm:flex-1`}
                >
                  {t("clearConfirmCancel")}
                </button>
                <button
                  type="button"
                  disabled={submitting || inFlight.current}
                  onClick={() => {
                    // Use the payload frozen at confirmation; reject if the
                    // live form drifted (fingerprint mismatch).
                    try {
                      const frozen = confirmedClearUsages.current;
                      if (!frozen) {
                        setConfirmClear(false);
                        return;
                      }
                      const live = buildUsagesFromForm();
                      if (
                        usagesFingerprint(live) !==
                          confirmedClearFingerprint.current ||
                        !shouldConfirmClearUsages(
                          persistedUsageCount(),
                          frozen.length,
                        )
                      ) {
                        setConfirmClear(false);
                        confirmedClearFingerprint.current = null;
                        confirmedClearUsages.current = null;
                        return;
                      }
                      void persistUsagesAndComplete(frozen);
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : t("errors.saveFailed"),
                      );
                    }
                  }}
                  className={`${authPrimaryButtonClass} sm:flex-1`}
                >
                  {submitting ? t("submitting") : t("clearConfirmProceed")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={busy}
              aria-busy={submitting || undefined}
              className={authPrimaryButtonClass}
            >
              {submitting
                ? t("submitting")
                : awaitingStatusRetry
                  ? t("retryStatus")
                  : t(isEditingTracking ? "editSubmit" : "submit")}
            </button>
          )}
        </form>

        <div className="mt-8 space-y-2 border-t border-white/10 pt-6 text-center">
          <button
            type="button"
            disabled={skipDisabled}
            aria-busy={skipping || undefined}
            onClick={() => void handleSkip()}
            className={`${authLinkClass} text-sm disabled:opacity-50`}
          >
            {skipping ? t("skipping") : t("skipAction")}
          </button>
          <p className="text-xs text-soma-ink-muted">{t("skipHint")}</p>
        </div>
      </div>
    </OnboardingShell>
  );
}
