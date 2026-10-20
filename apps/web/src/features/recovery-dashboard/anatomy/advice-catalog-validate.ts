import type { OrganId, SubstanceId } from "@soma/shared-types";
import {
  adviceCategories,
  adviceEditorialStatuses,
  adviceReferenceStatuses,
  isAdvicePublishable,
} from "./advice-catalog.ts";
import {
  advicePresentationPriorities,
  type DraftAdviceRecord,
} from "./advice-drafts.ts";
import { narrativePhases } from "./narrative-catalog.ts";

/**
 * Integrity checks for the unpublished advice sidecar.
 * Does not author clinical copy, infer from atlas associations, or publish.
 */

const CANONICAL_SUBSTANCE_IDS = [
  "alcohol",
  "nicotine",
  "cannabis",
  "cocaine",
  "caffeine",
] as const satisfies readonly SubstanceId[];

const CANONICAL_ORGAN_IDS = [
  "liver",
  "heart",
  "lungs",
  "bronchi",
  "kidneys",
  "stomach",
  "pancreas",
  "brain-prefrontal-cortex",
  "brain-hippocampus",
  "brain-vta",
  "brain-nucleus-accumbens",
  "brain-amygdala",
  "skin",
  "testes",
  "ovaries",
  "intestines",
  "spleen",
  "oral-mucosa",
  "nasal-mucosa",
  "teeth",
  "eyes",
] as const satisfies readonly OrganId[];

const FORBIDDEN_DAY_KEYS = ["fromDay", "toDay", "days"] as const;

export const adviceCatalogIssueCodes = [
  "empty_id",
  "duplicate_id",
  "unknown_substance",
  "unknown_phase",
  "unknown_organ",
  "unknown_category",
  "unknown_editorial_status",
  "unknown_reference_status",
  "verified_without_source",
  "personalized",
  "publishable_in_draft_lane",
  "missing_i18n",
  "invalid_presentation_priority",
  "numeric_day_field",
] as const;

export type AdviceCatalogIssueCode = (typeof adviceCatalogIssueCodes)[number];

export interface AdviceCatalogIssue {
  code: AdviceCatalogIssueCode;
  recordId?: string;
  detail: string;
}

export interface DraftAdviceI18nBundle {
  en: unknown;
  es: unknown;
}

export function validateDraftAdviceCatalog(
  records: readonly DraftAdviceRecord[],
  i18n: DraftAdviceI18nBundle,
  rawRecords: readonly unknown[] = records,
): readonly AdviceCatalogIssue[] {
  const issues: AdviceCatalogIssue[] = [];
  const seen = new Map<string, number>();

  for (const [index, raw] of rawRecords.entries()) {
    collectForbiddenDayKeys(raw, issues, records[index]?.item.id);
  }

  for (const record of records) {
    const item = record.item;
    const recordId = item.id?.trim() ? item.id : undefined;

    if (!item.id?.trim()) {
      issues.push({
        code: "empty_id",
        detail: "Draft advice items require a non-empty id.",
      });
    } else {
      const previous = seen.get(item.id);
      if (previous !== undefined) {
        issues.push({
          code: "duplicate_id",
          recordId: item.id,
          detail: `Duplicate draft id "${item.id}".`,
        });
      } else {
        seen.set(item.id, 1);
      }
    }

    if (item.personalized !== false) {
      issues.push({
        code: "personalized",
        recordId,
        detail: "Educational advice cannot be personalized.",
      });
    }

    if (!includesString(adviceCategories, item.category)) {
      issues.push({
        code: "unknown_category",
        recordId,
        detail: `Unknown advice category "${String(item.category)}".`,
      });
    }

    if (!includesString(adviceEditorialStatuses, item.editorialStatus)) {
      issues.push({
        code: "unknown_editorial_status",
        recordId,
        detail: `Unknown editorial status "${String(item.editorialStatus)}".`,
      });
    }

    if (!includesString(adviceReferenceStatuses, item.reference.status)) {
      issues.push({
        code: "unknown_reference_status",
        recordId,
        detail: `Unknown reference status "${String(item.reference.status)}".`,
      });
    }

    for (const substanceId of item.substanceIds) {
      if (!includesString(CANONICAL_SUBSTANCE_IDS, substanceId)) {
        issues.push({
          code: "unknown_substance",
          recordId,
          detail: `Unknown substance "${substanceId}".`,
        });
      }
    }

    for (const phase of item.phases) {
      if (!includesString(narrativePhases, phase)) {
        issues.push({
          code: "unknown_phase",
          recordId,
          detail: `Unknown phase "${phase}".`,
        });
      }
    }

    if (item.scope === "organ") {
      for (const organId of item.organIds) {
        if (!includesString(CANONICAL_ORGAN_IDS, organId)) {
          issues.push({
            code: "unknown_organ",
            recordId,
            detail: `Unknown organ "${organId}".`,
          });
        }
      }
    }

    if (item.reference.status === "verified" && !item.reference.source.trim()) {
      issues.push({
        code: "verified_without_source",
        recordId,
        detail: "A verified reference requires a non-empty source citation.",
      });
    }

    if (isAdvicePublishable(item)) {
      issues.push({
        code: "publishable_in_draft_lane",
        recordId,
        detail:
          "Sidecar drafts must not be publication-eligible. Do not set clinically_reviewed and verified together here.",
      });
    }

    if (
      record.presentationPriority !== undefined &&
      !includesString(advicePresentationPriorities, record.presentationPriority)
    ) {
      issues.push({
        code: "invalid_presentation_priority",
        recordId,
        detail: `Unknown presentation priority "${String(record.presentationPriority)}".`,
      });
    }

    collectMissingI18n(item.titleKey, "titleKey", recordId, i18n, issues);
    collectMissingI18n(item.bodyKey, "bodyKey", recordId, i18n, issues);
    if (record.applicabilityNotesKey) {
      collectMissingI18n(
        record.applicabilityNotesKey,
        "applicabilityNotesKey",
        recordId,
        i18n,
        issues,
      );
    }
    if (record.audienceLimitationsKey) {
      collectMissingI18n(
        record.audienceLimitationsKey,
        "audienceLimitationsKey",
        recordId,
        i18n,
        issues,
      );
    }
  }

  return issues;
}

function collectMissingI18n(
  key: string,
  field: string,
  recordId: string | undefined,
  i18n: DraftAdviceI18nBundle,
  issues: AdviceCatalogIssue[],
): void {
  for (const locale of ["en", "es"] as const) {
    if (!readI18nString(i18n[locale], key)) {
      issues.push({
        code: "missing_i18n",
        recordId,
        detail: `Missing ${locale.toUpperCase()} copy for ${field} "${key}".`,
      });
    }
  }
}

function collectForbiddenDayKeys(
  value: unknown,
  issues: AdviceCatalogIssue[],
  recordId: string | undefined,
  path = "",
): void {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    for (const [index, entry] of value.entries()) {
      collectForbiddenDayKeys(entry, issues, recordId, `${path}[${index}]`);
    }
    return;
  }

  for (const [key, nested] of Object.entries(value)) {
    const nextPath = path ? `${path}.${key}` : key;
    if (includesString(FORBIDDEN_DAY_KEYS, key)) {
      issues.push({
        code: "numeric_day_field",
        recordId,
        detail: `Draft records must not use ${key} as a diagnostic window (${nextPath}).`,
      });
    }
    collectForbiddenDayKeys(nested, issues, recordId, nextPath);
  }
}

function readI18nString(tree: unknown, key: string): string | undefined {
  if (tree && typeof tree === "object" && !Array.isArray(tree) && key in tree) {
    const direct = (tree as Record<string, unknown>)[key];
    if (typeof direct === "string" && direct.trim().length > 0) return direct;
  }

  let current: unknown = tree;
  for (const part of key.split(".")) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === "string" && current.trim().length > 0 ? current : undefined;
}

function includesString(values: readonly string[], value: string): boolean {
  return values.includes(value);
}
