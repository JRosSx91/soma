import { isStoredBirthYearAllowed } from "@soma/shared-types";

/**
 * Client-side helpers for PATCH /me/profile/details.
 * Aligns with API UpdateProfileDetailsDto (no silent rounding; no string numbers).
 */

export type BiologicalSexValue = "male" | "female";

export interface ProfileDetailsFields {
  displayName: string;
  biologicalSex: BiologicalSexValue;
  birthYear: number;
  weightKg: number | null;
}

export type ProfileDetailsPatch = {
  displayName?: string;
  biologicalSex?: BiologicalSexValue;
  birthYear?: number;
  weightKg?: number | null;
};

export type ProfileDetailsDraft = {
  displayName: string;
  biologicalSex: BiologicalSexValue;
  birthYear: string;
  /** Raw weight field; empty means clear weight when baseline had a value. */
  weightKg: string;
};

export type ParseWeightResult =
  | { ok: true; value: number | null }
  | { ok: false; reason: "invalid" | "out_of_range" };

/**
 * Accepts a natural decimal (dot or locale comma). Does not coerce arbitrary strings.
 * Empty → null (clear optional weight).
 */
export function parseWeightInput(raw: string): ParseWeightResult {
  const trimmed = raw.trim();
  if (trimmed === "") return { ok: true, value: null };

  // Allow a single decimal separator: '.' or ',' (not both / not thousands groups).
  const commaCount = (trimmed.match(/,/g) ?? []).length;
  const dotCount = (trimmed.match(/\./g) ?? []).length;
  if (commaCount + dotCount > 1) return { ok: false, reason: "invalid" };

  const normalized = trimmed.replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { ok: false, reason: "invalid" };
  }

  const value = Number(normalized);
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    return { ok: false, reason: "invalid" };
  }
  if (value < 20 || value > 400) {
    return { ok: false, reason: "out_of_range" };
  }
  return { ok: true, value };
}

export function draftFromProfile(fields: ProfileDetailsFields): ProfileDetailsDraft {
  return {
    displayName: fields.displayName,
    biologicalSex: fields.biologicalSex,
    birthYear: String(fields.birthYear),
    weightKg: fields.weightKg == null ? "" : String(fields.weightKg),
  };
}

export type BuildPatchResult =
  | { ok: true; patch: ProfileDetailsPatch }
  | { ok: false; errorKey: string };

/**
 * Validates draft and returns only changed fields.
 * Fails with errorKey when invalid or when nothing changed (empty PATCH).
 */
export function buildProfileDetailsPatch(
  baseline: ProfileDetailsFields,
  draft: ProfileDetailsDraft,
  currentYear: number = new Date().getFullYear(),
): BuildPatchResult {
  const displayName = draft.displayName.trim();
  if (!displayName) {
    return { ok: false, errorKey: "errors.displayNameRequired" };
  }

  if (draft.biologicalSex !== "male" && draft.biologicalSex !== "female") {
    return { ok: false, errorKey: "errors.biologicalSexInvalid" };
  }

  const birthYearRaw = draft.birthYear.trim();
  if (!/^\d+$/.test(birthYearRaw)) {
    return { ok: false, errorKey: "errors.birthYearInvalid" };
  }
  const birthYear = Number(birthYearRaw);
  if (
    !Number.isInteger(birthYear) ||
    birthYear < 1900 ||
    birthYear > currentYear ||
    !isStoredBirthYearAllowed(birthYear, baseline.birthYear)
  ) {
    return { ok: false, errorKey: "errors.birthYearInvalid" };
  }

  const weightParsed = parseWeightInput(draft.weightKg);
  if (!weightParsed.ok) {
    return {
      ok: false,
      errorKey:
        weightParsed.reason === "out_of_range"
          ? "errors.weightOutOfRange"
          : "errors.weightInvalid",
    };
  }

  const patch: ProfileDetailsPatch = {};

  if (displayName !== baseline.displayName) {
    patch.displayName = displayName;
  }
  if (draft.biologicalSex !== baseline.biologicalSex) {
    patch.biologicalSex = draft.biologicalSex;
  }
  if (birthYear !== baseline.birthYear) {
    patch.birthYear = birthYear;
  }
  if (weightParsed.value !== baseline.weightKg) {
    patch.weightKg = weightParsed.value;
  }

  if (Object.keys(patch).length === 0) {
    return { ok: false, errorKey: "errors.noChanges" };
  }

  return { ok: true, patch };
}
