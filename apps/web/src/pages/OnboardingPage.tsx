import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSubstances } from "../features/substances/index.js";
import { useUserProfile } from "../features/profile/index.js";
import type { UsageInput } from "../features/profile/index.js";
import {
  persistOnboardingCompletion,
  shouldConfirmClearUsages,
  skipOnboardingWithoutClearingUsages,
} from "../features/profile/index.js";
import { LanguageSelector } from "../components/LanguageSelector.js";

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
  const { data: substances, loading: loadingSubstances } = useSubstances();
  const {
    profile,
    loading: loadingProfile,
    error: profileError,
    refresh,
  } = useUserProfile();
  const [error, setError] = useState<string | null>(null);
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
        throw new Error(
          t("errors.invalidYear", { substance: substance.name }),
        );
      }
      if (state.mode === "abstinent" && !state.lastUseDate) {
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
      });

      lastSuccessfulPut.current = result.lastSuccessfulPut;

      if (!result.ok) {
        if (result.phase === "patch" && result.usagesSaved) {
          setAwaitingStatusRetry(true);
          setError(t("errors.statusFailed"));
        } else {
          // PUT failed — stay out of status-retry; keep draft + prior snapshot.
          setError(t("errors.saveFailed"));
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

  if (loadingSubstances || loadingProfile || !substances) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        {t("common:loading")}
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-soma-bg-base text-soma-fg-primary px-4 gap-4">
        <p className="text-sm text-soma-organ-damaged" role="alert">
          {t("loadError")}
        </p>
        <p className="text-xs text-soma-fg-muted max-w-sm text-center">
          {t("loadErrorHint")}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          className="text-soma-accent hover:underline text-sm"
        >
          {t("retryLoad")}
        </button>
        <button
          type="button"
          onClick={() => navigate("/app", { replace: true })}
          className="text-sm text-soma-fg-muted hover:underline"
        >
          {t("enterAppWithoutSetup")}
        </button>
      </div>
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
    <div className="min-h-screen bg-soma-bg-base text-soma-fg-primary px-4 py-12 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light tracking-wide mb-2">
            {t(isEditingTracking ? "editTitle" : "title")}
          </h1>
          <p className="text-sm text-soma-fg-muted">
            {t(isEditingTracking ? "editSubtitle" : "subtitle")}
          </p>
          <p className="text-xs text-soma-fg-muted mt-3 max-w-lg mx-auto">
            {t(isEditingTracking ? "editPrivacyNote" : "privacyNote")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {substances.map((substance) => {
            const state = formState[substance.id] ?? EMPTY_STATE;

            return (
              <div
                key={substance.id}
                className="bg-soma-bg-surface border border-soma-border-subtle rounded p-4"
              >
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.active}
                    onChange={(e) =>
                      updateField(substance.id, "active", e.target.checked)
                    }
                    className="w-4 h-4"
                    disabled={busy}
                  />
                  <div className="flex-1">
                    <p className="text-soma-fg-primary capitalize">
                      {t(`substances:${substance.id}.name`, {
                        defaultValue: substance.name,
                      })}
                    </p>
                    <p className="text-xs text-soma-fg-muted">
                      {t(`substances:${substance.id}.shortDescription`, {
                        defaultValue: substance.shortDescription,
                      })}
                    </p>
                  </div>
                </label>

                {state.active && (
                  <div className="mt-4 space-y-3 pl-7">
                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t("fields.mode")}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateField(substance.id, "mode", "abstinent")
                          }
                          className={`
                            px-3 py-2 rounded text-sm transition-colors
                            border
                            ${
                              state.mode === "abstinent"
                                ? "border-soma-accent bg-soma-accent/10 text-soma-fg-primary"
                                : "border-soma-border-subtle bg-soma-bg-base text-soma-fg-secondary hover:border-soma-fg-muted"
                            }
                          `}
                        >
                          {t("mode.abstinent")}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            updateField(substance.id, "mode", "active")
                          }
                          className={`
                            px-3 py-2 rounded text-sm transition-colors
                            border
                            ${
                              state.mode === "active"
                                ? "border-soma-accent bg-soma-accent/10 text-soma-fg-primary"
                                : "border-soma-border-subtle bg-soma-bg-base text-soma-fg-secondary hover:border-soma-fg-muted"
                            }
                          `}
                        >
                          {t("mode.active")}
                        </button>
                      </div>
                      <p className="text-xs text-soma-fg-muted mt-2">
                        {state.mode === "abstinent"
                          ? t("mode.abstinentDescription")
                          : t("mode.activeDescription")}
                      </p>
                    </div>

                    {state.mode === "abstinent" && (
                      <div>
                        <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                          {t("fields.lastUseDate")}
                        </label>
                        <input
                          type="date"
                          required
                          max={TODAY}
                          value={state.lastUseDate}
                          disabled={busy}
                          onChange={(e) =>
                            updateField(
                              substance.id,
                              "lastUseDate",
                              e.target.value,
                            )
                          }
                          className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t("fields.yearStarted")}
                      </label>
                      <input
                        type="number"
                        required
                        min={1900}
                        max={new Date().getFullYear()}
                        value={state.yearStarted}
                        disabled={busy}
                        onChange={(e) =>
                          updateField(
                            substance.id,
                            "yearStarted",
                            e.target.value,
                          )
                        }
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-soma-fg-secondary uppercase tracking-wider mb-2">
                        {t("fields.frequency")}
                      </label>
                      <select
                        value={state.frequency}
                        disabled={busy}
                        onChange={(e) =>
                          updateField(
                            substance.id,
                            "frequency",
                            e.target.value as UsageInput["frequency"],
                          )
                        }
                        className="w-full bg-soma-bg-base border border-soma-border-subtle rounded px-3 py-2 text-soma-fg-primary focus:outline-none focus:border-soma-accent"
                      >
                        {FREQUENCY_KEYS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {t(opt.labelKey)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {error && (
            <p className="text-sm text-soma-organ-damaged" role="alert">
              {error}
            </p>
          )}

          {confirmClear ? (
            <div
              className="rounded border border-soma-border-subtle bg-soma-bg-surface p-4 space-y-3"
              role="alertdialog"
              aria-labelledby="clear-usages-title"
            >
              <p
                id="clear-usages-title"
                className="text-sm text-soma-fg-primary"
              >
                {t("clearConfirmTitle")}
              </p>
              <p className="text-xs text-soma-fg-muted">
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
                  className="flex-1 border border-soma-border-subtle rounded px-4 py-2 text-sm hover:border-soma-accent"
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
                  className="flex-1 bg-soma-accent text-soma-bg-base rounded px-4 py-2 text-sm disabled:opacity-50"
                >
                  {submitting ? t("submitting") : t("clearConfirmProceed")}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-soma-accent text-soma-bg-base rounded px-4 py-3 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? t("submitting")
                : awaitingStatusRetry
                  ? t("retryStatus")
                  : t(isEditingTracking ? "editSubmit" : "submit")}
            </button>
          )}
        </form>

        <div className="mt-6 space-y-2 text-center">
          <button
            type="button"
            disabled={skipDisabled}
            onClick={() => void handleSkip()}
            className="text-sm text-soma-accent hover:underline disabled:opacity-50"
          >
            {skipping ? t("skipping") : t("skipAction")}
          </button>
          <p className="text-xs text-soma-fg-muted">{t("skipHint")}</p>
        </div>
      </div>
    </div>
  );
}
