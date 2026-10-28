import type { JournalEntry, JournalPersonalMilestone } from "@prisma/client";
import { utcDateToCivilDate } from "@soma/shared-types";

export interface JournalEntryResponse {
  id: string;
  occurredOn: string;
  createdAt: string;
  updatedAt: string;
  mood: number | null;
  sleep: number | null;
  energy: number | null;
  anxiety: number | null;
  cravingIntensity: number | null;
  cravingSubstanceId: string | null;
  wellbeingRating: number | null;
  title: string | null;
  body: string | null;
  highlighted: boolean;
  learning: boolean;
  emotionIds: string[];
  triggerIds: string[];
}

export interface JournalMilestoneResponse {
  id: string;
  kind: string;
  occurredOn: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export function toJournalEntryResponse(row: JournalEntry): JournalEntryResponse {
  return {
    id: row.id,
    occurredOn: utcDateToCivilDate(row.occurredOn),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    mood: row.mood,
    sleep: row.sleep,
    energy: row.energy,
    anxiety: row.anxiety,
    cravingIntensity: row.cravingIntensity,
    cravingSubstanceId: row.cravingSubstanceId,
    wellbeingRating: row.wellbeingRating,
    title: row.title,
    body: row.body,
    highlighted: row.highlighted,
    learning: row.learning,
    emotionIds: row.emotionIds,
    triggerIds: row.triggerIds,
  };
}

export function toJournalMilestoneResponse(
  row: JournalPersonalMilestone,
): JournalMilestoneResponse {
  return {
    id: row.id,
    kind: row.kind,
    occurredOn: utcDateToCivilDate(row.occurredOn),
    note: row.note,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function hasSignificantJournalContent(fields: {
  mood?: number | null;
  sleep?: number | null;
  energy?: number | null;
  anxiety?: number | null;
  cravingIntensity?: number | null;
  wellbeingRating?: number | null;
  title?: string | null;
  body?: string | null;
  emotionIds?: string[] | null;
  triggerIds?: string[] | null;
}): boolean {
  const scales = [
    fields.mood,
    fields.sleep,
    fields.energy,
    fields.anxiety,
    fields.cravingIntensity,
    fields.wellbeingRating,
  ];
  if (scales.some((value) => typeof value === "number")) return true;
  if (Array.isArray(fields.emotionIds) && fields.emotionIds.length > 0) {
    return true;
  }
  if (Array.isArray(fields.triggerIds) && fields.triggerIds.length > 0) {
    return true;
  }
  if (typeof fields.title === "string" && fields.title.trim().length > 0) {
    return true;
  }
  if (typeof fields.body === "string" && fields.body.trim().length > 0) {
    return true;
  }
  return false;
}

export function normalizeOptionalText(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
