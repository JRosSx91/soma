import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ApiError, useAuth } from "../../auth/index.js";
import {
  buildProfileDetailsPatch,
  draftFromProfile,
  useUserProfile,
  type ProfileDetailsDraft,
  type ProfileDetailsFields,
} from "../../profile/index.js";
import { DeleteAccountSection } from "../../profile/components/DeleteAccountSection.js";
import { WithdrawConsentSection } from "../../profile/components/WithdrawConsentSection.js";
import { PageHeading } from "../components/PageHeading.js";
import { useShellBase } from "../context/ShellBaseContext.js";
import { previewFocus } from "../focus.js";

function accountFieldFromErrorKey(
  key: string | null,
): "displayName" | "birthYear" | "biologicalSex" | "weightKg" | null {
  switch (key) {
    case "errors.displayNameRequired":
      return "displayName";
    case "errors.birthYearInvalid":
      return "birthYear";
    case "errors.biologicalSexInvalid":
      return "biologicalSex";
    case "errors.weightOutOfRange":
    case "errors.weightInvalid":
      return "weightKg";
    default:
      return null;
  }
}

function fieldsFromProfile(user: ProfileDetailsFields): ProfileDetailsFields {
  return {
    displayName: user.displayName,
    biologicalSex: user.biologicalSex,
    birthYear: user.birthYear,
    weightKg: user.weightKg,
  };
}

/**
 * Soma 2.0 account surface: view/edit personal details via PATCH /me/profile/details.
 * Substance tracking stays on /onboarding (separate PUT).
 */
export function AccountPage() {
  const { t } = useTranslation("account");
  const base = useShellBase();
  const { user: authUser, applyProfileUser } = useAuth();
  const { profile, loading, error, refresh, updateDetails } = useUserProfile({
    enabled: base === "/app",
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<ProfileDetailsDraft | null>(null);
  const [formErrorKey, setFormErrorKey] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const inFlight = useRef(false);

  const personal = profile?.user ?? null;

  useEffect(() => {
    if (!editing && personal) {
      setDraft(draftFromProfile(fieldsFromProfile(personal)));
    }
  }, [personal, editing]);

  const startEdit = () => {
    if (!personal) return;
    setFormErrorKey(null);
    setSuccess(false);
    setDraft(draftFromProfile(fieldsFromProfile(personal)));
    setEditing(true);
  };

  const cancelEdit = () => {
    if (saving) return;
    if (personal) {
      setDraft(draftFromProfile(fieldsFromProfile(personal)));
    }
    setFormErrorKey(null);
    setEditing(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current || !personal || !draft || loading) return;

    setFormErrorKey(null);
    setSuccess(false);

    const built = buildProfileDetailsPatch(
      fieldsFromProfile(personal),
      draft,
    );
    if (!built.ok) {
      setFormErrorKey(built.errorKey);
      return;
    }

    inFlight.current = true;
    setSaving(true);
    try {
      const updated = await updateDetails(built.patch);
      // Sync AuthContext only after backend confirmation (no re-login).
      applyProfileUser(updated.user);
      setEditing(false);
      setSuccess(true);
    } catch (err) {
      // Keep draft so the user does not lose typed values.
      // Do not call applyProfileUser on failure.
      // Never surface raw server/network messages to the UI.
      if (err instanceof ApiError && err.status === 400) {
        setFormErrorKey("errors.validationFailed");
      } else {
        setFormErrorKey("errors.saveFailed");
      }
    } finally {
      setSaving(false);
      inFlight.current = false;
    }
  };

  if (base !== "/app") {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <PageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          demo
        />
        <p className="rounded-2xl border border-soma-line bg-soma-surface px-4 py-6 text-sm text-soma-ink-secondary">
          {t("emailReadonly")}
        </p>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <PageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          demo={false}
        />
        <p className="text-sm text-soma-ink-secondary" role="status">
          {t("loading")}
        </p>
      </div>
    );
  }

  if (error || !profile || !personal) {
    return (
      <div className="flex flex-col gap-6 pb-6">
        <PageHeading
          eyebrow={t("eyebrow")}
          title={t("title")}
          description={t("description")}
          demo={false}
        />
        <p className="text-sm text-soma-organ-damaged" role="alert">
          {t("loadError")}
        </p>
        <button
          type="button"
          onClick={() => void refresh()}
          className={`${previewFocus} w-fit text-sm text-soma-action hover:underline`}
        >
          {t("retryLoad")}
        </button>
      </div>
    );
  }

  const email = personal.email || authUser?.email || "";
  const showDraft = editing && draft;
  const formError = formErrorKey ? t(formErrorKey) : null;
  const errorField = accountFieldFromErrorKey(formErrorKey);
  const fieldErrorId = "account-field-error";
  const formErrorId = "account-form-error";

  return (
    <div className="flex flex-col gap-6 pb-6">
      <PageHeading
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        demo={false}
      />

      {success && !editing ? (
        <p
          className="rounded-xl border border-soma-line bg-soma-surface px-4 py-3 text-sm text-soma-ink"
          role="status"
        >
          {t("saved")}
        </p>
      ) : null}

      <section className="rounded-2xl border border-soma-line bg-soma-surface/80 p-4 sm:p-5">
        {showDraft ? (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                {t("email")}
              </label>
              <p className="mt-1 text-sm text-soma-ink">{email}</p>
              <p className="mt-1 text-xs text-soma-ink-muted">
                {t("emailReadonly")}
              </p>
            </div>

            <div>
              <label
                htmlFor="account-displayName"
                className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted"
              >
                {t("displayName")}
              </label>
              <input
                id="account-displayName"
                value={draft.displayName}
                disabled={saving}
                onChange={(e) =>
                  setDraft({ ...draft, displayName: e.target.value })
                }
                className={`${previewFocus} mt-1 w-full rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-sm text-soma-ink`}
                autoComplete="nickname"
                aria-invalid={errorField === "displayName" ? true : undefined}
                aria-describedby={
                  errorField === "displayName" ? fieldErrorId : undefined
                }
              />
            </div>

            <div>
              <label
                htmlFor="account-birthYear"
                className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted"
              >
                {t("birthYear")}
              </label>
              <input
                id="account-birthYear"
                type="number"
                inputMode="numeric"
                min={1900}
                max={new Date().getFullYear()}
                value={draft.birthYear}
                disabled={saving}
                onChange={(e) =>
                  setDraft({ ...draft, birthYear: e.target.value })
                }
                className={`${previewFocus} mt-1 w-full rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-sm text-soma-ink`}
                aria-invalid={errorField === "birthYear" ? true : undefined}
                aria-describedby={
                  errorField === "birthYear" ? fieldErrorId : undefined
                }
              />
            </div>

            <div>
              <label
                htmlFor="account-biologicalSex"
                className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted"
              >
                {t("biologicalSex")}
              </label>
              <select
                id="account-biologicalSex"
                value={draft.biologicalSex}
                disabled={saving}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    biologicalSex: e.target.value as "male" | "female",
                  })
                }
                className={`${previewFocus} mt-1 w-full rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-sm text-soma-ink`}
                aria-invalid={errorField === "biologicalSex" ? true : undefined}
                aria-describedby={
                  errorField === "biologicalSex" ? fieldErrorId : undefined
                }
              >
                <option value="male">{t("biologicalSexMale")}</option>
                <option value="female">{t("biologicalSexFemale")}</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="account-weightKg"
                className="block text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted"
              >
                {t("weightKg")}
              </label>
              <input
                id="account-weightKg"
                inputMode="decimal"
                value={draft.weightKg}
                disabled={saving}
                onChange={(e) =>
                  setDraft({ ...draft, weightKg: e.target.value })
                }
                placeholder="68.5"
                className={`${previewFocus} mt-1 w-full rounded-xl border border-soma-line bg-soma-raised px-3 py-2 text-sm text-soma-ink placeholder:text-soma-ink-muted`}
                aria-invalid={errorField === "weightKg" ? true : undefined}
                aria-describedby={
                  errorField === "weightKg"
                    ? "account-weight-hint account-field-error"
                    : "account-weight-hint"
                }
              />
              <p
                id="account-weight-hint"
                className="mt-1 text-xs text-soma-ink-muted"
              >
                {t("weightHint")}
              </p>
            </div>

            {formError ? (
              <p
                id={errorField ? fieldErrorId : formErrorId}
                className="text-sm text-soma-organ-damaged"
                role="alert"
              >
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="submit"
                disabled={saving}
                aria-busy={saving || undefined}
                className={`${previewFocus} rounded-xl bg-soma-action px-4 py-2 text-sm font-medium text-[#081018] disabled:opacity-50`}
              >
                {saving ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={cancelEdit}
                className={`${previewFocus} rounded-xl border border-soma-line px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised disabled:opacity-50`}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                  {t("email")}
                </dt>
                <dd className="mt-1 text-sm text-soma-ink">{email}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                  {t("displayName")}
                </dt>
                <dd className="mt-1 text-sm text-soma-ink">
                  {personal.displayName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                  {t("birthYear")}
                </dt>
                <dd className="mt-1 text-sm text-soma-ink">
                  {personal.birthYear}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                  {t("biologicalSex")}
                </dt>
                <dd className="mt-1 text-sm text-soma-ink">
                  {personal.biologicalSex === "female"
                    ? t("biologicalSexFemale")
                    : t("biologicalSexMale")}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-[0.08em] text-soma-ink-muted">
                  {t("weightKg")}
                </dt>
                <dd className="mt-1 text-sm text-soma-ink">
                  {personal.weightKg == null
                    ? t("weightEmpty")
                    : personal.weightKg}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={startEdit}
              className={`${previewFocus} rounded-xl border border-soma-line px-4 py-2 text-sm text-soma-ink hover:bg-soma-raised`}
            >
              {t("edit")}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-soma-line bg-soma-surface/60 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-soma-ink">
          {t("menuFeedback")}
        </h2>
        <p className="mt-1 text-sm text-soma-ink-secondary">
          {t("menuFeedbackHint")}
        </p>
        <Link
          to={`${base}/feedback`}
          className={`${previewFocus} mt-3 inline-flex text-sm text-soma-action hover:underline`}
        >
          {t("menuFeedback")}
        </Link>
      </section>

      {profile?.specialCategoryConsentWithdrawn ? null : (
        <section className="rounded-2xl border border-soma-line bg-soma-surface/60 p-4 sm:p-5">
          <h2 className="text-sm font-semibold text-soma-ink">
            {t("substancesTitle")}
          </h2>
          <p className="mt-1 text-sm text-soma-ink-secondary">
            {t("substancesBody")}
          </p>
          <Link
            to="/onboarding"
            className={`${previewFocus} mt-3 inline-flex text-sm text-soma-action hover:underline`}
          >
            {t("editSubstances")}
          </Link>
        </section>
      )}

      <WithdrawConsentSection
        withdrawn={profile?.specialCategoryConsentWithdrawn === true}
        onWithdrawn={() => {
          void refresh();
        }}
      />

      <DeleteAccountSection />
    </div>
  );
}
