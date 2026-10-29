/**
 * FBK-01A: private feedback contracts.
 * No Prisma, HTTP, React, XP, emails, or public voting (FBK-02).
 * Responses must not include userId or fingerprint.
 */

export const FEEDBACK_CATEGORY_IDS = ["bug", "suggestion", "general"] as const;
export type FeedbackCategoryId = (typeof FEEDBACK_CATEGORY_IDS)[number];

export const FEEDBACK_STATUS_IDS = [
  "open",
  "in_review",
  "resolved",
  "closed",
] as const;
export type FeedbackStatusId = (typeof FEEDBACK_STATUS_IDS)[number];

export const FEEDBACK_TITLE_MIN = 3;
export const FEEDBACK_TITLE_MAX = 80;
export const FEEDBACK_BODY_MIN = 20;
export const FEEDBACK_BODY_MAX = 4000;

/** Identical-copy window. Not a unique DB constraint. */
export const FEEDBACK_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;

export const FEEDBACK_LIST_DEFAULT_LIMIT = 20;
export const FEEDBACK_LIST_MAX_LIMIT = 50;

export interface CreateFeedbackRequest {
  readonly category: FeedbackCategoryId;
  readonly title: string;
  readonly body: string;
}

/** Owner-facing row. Internal fields stay off this type. */
export interface FeedbackItem {
  readonly id: string;
  readonly category: FeedbackCategoryId;
  readonly title: string;
  readonly body: string;
  readonly status: FeedbackStatusId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FeedbackListQuery {
  readonly limit?: number;
  readonly cursor?: string;
}

export interface FeedbackListResponse {
  readonly items: readonly FeedbackItem[];
  readonly nextCursor: string | null;
}

export function isFeedbackCategoryId(value: string): value is FeedbackCategoryId {
  return (FEEDBACK_CATEGORY_IDS as readonly string[]).includes(value);
}

export function isFeedbackStatusId(value: string): value is FeedbackStatusId {
  return (FEEDBACK_STATUS_IDS as readonly string[]).includes(value);
}

export function normalizeFeedbackText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function isFeedbackTitleLength(value: string): boolean {
  const n = [...value].length;
  return n >= FEEDBACK_TITLE_MIN && n <= FEEDBACK_TITLE_MAX;
}

export function isFeedbackBodyLength(value: string): boolean {
  const n = [...value].length;
  return n >= FEEDBACK_BODY_MIN && n <= FEEDBACK_BODY_MAX;
}

export function isCreateFeedbackRequest(value: unknown): value is CreateFeedbackRequest {
  if (value == null || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.category === "string" &&
    isFeedbackCategoryId(row.category) &&
    typeof row.title === "string" &&
    isFeedbackTitleLength(row.title) &&
    typeof row.body === "string" &&
    isFeedbackBodyLength(row.body)
  );
}

export function feedbackDuplicateKey(
  category: FeedbackCategoryId,
  title: string,
  body: string,
): string {
  return `${category}\n${normalizeFeedbackText(title).toLowerCase()}\n${normalizeFeedbackText(body).toLowerCase()}`;
}
