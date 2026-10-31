import {
  FEEDBACK_DUPLICATE_WINDOW_MS,
  feedbackDuplicateKey,
  isFeedbackBodyLength,
  isFeedbackCategoryId,
  isFeedbackStatusId,
  isFeedbackTitleLength,
  type CreateFeedbackRequest,
  type FeedbackCategoryId,
  type FeedbackItem,
  type FeedbackListResponse,
} from "@soma/shared-types";

export type FeedbackFieldError = "category" | "title" | "body";

export interface FeedbackDraft {
  category: FeedbackCategoryId | null;
  title: string;
  body: string;
}

export function trimFeedbackDraft(draft: FeedbackDraft): FeedbackDraft {
  return {
    category: draft.category,
    title: draft.title.trim(),
    body: draft.body.trim(),
  };
}

export function validateFeedbackDraft(draft: FeedbackDraft): FeedbackFieldError[] {
  const trimmed = trimFeedbackDraft(draft);
  const issues: FeedbackFieldError[] = [];
  if (trimmed.category == null || !isFeedbackCategoryId(trimmed.category)) {
    issues.push("category");
  }
  if (!isFeedbackTitleLength(trimmed.title)) issues.push("title");
  if (!isFeedbackBodyLength(trimmed.body)) issues.push("body");
  return issues;
}

export function toCreateFeedbackRequest(
  draft: FeedbackDraft,
): CreateFeedbackRequest | null {
  const trimmed = trimFeedbackDraft(draft);
  if (validateFeedbackDraft(trimmed).length > 0) return null;
  if (trimmed.category == null) return null;
  return {
    category: trimmed.category,
    title: trimmed.title,
    body: trimmed.body,
  };
}

export function parseFeedbackItem(value: unknown): FeedbackItem | null {
  if (value == null || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    row.id.length === 0 ||
    typeof row.category !== "string" ||
    !isFeedbackCategoryId(row.category) ||
    typeof row.title !== "string" ||
    typeof row.body !== "string" ||
    typeof row.status !== "string" ||
    !isFeedbackStatusId(row.status) ||
    typeof row.createdAt !== "string" ||
    Number.isNaN(Date.parse(row.createdAt)) ||
    typeof row.updatedAt !== "string" ||
    Number.isNaN(Date.parse(row.updatedAt))
  ) {
    return null;
  }
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function parseFeedbackList(value: unknown): FeedbackListResponse | null {
  if (value == null || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (!Array.isArray(row.items)) return null;
  if (row.nextCursor !== null && typeof row.nextCursor !== "string") return null;
  const items: FeedbackItem[] = [];
  for (const item of row.items) {
    const parsed = parseFeedbackItem(item);
    if (!parsed) return null;
    items.push(parsed);
  }
  return { items, nextCursor: row.nextCursor };
}

export function appendFeedbackPage(
  existing: readonly FeedbackItem[],
  incoming: readonly FeedbackItem[],
): FeedbackItem[] {
  const seen = new Set(existing.map((row) => row.id));
  const extra = incoming.filter((row) => !seen.has(row.id));
  return extra.length === 0 ? [...existing] : [...existing, ...extra];
}

export function prependFeedbackItem(
  existing: readonly FeedbackItem[],
  item: FeedbackItem,
): FeedbackItem[] {
  return [item, ...existing.filter((row) => row.id !== item.id)];
}

export function publicFeedbackKeys(item: FeedbackItem): string[] {
  return Object.keys(item);
}

/** In-memory DEMO duplicate window. Same 24h rule as LIVE, no HTTP. */
export function findRecentFeedbackDuplicate(
  items: readonly FeedbackItem[],
  request: CreateFeedbackRequest,
  nowMs = Date.now(),
): FeedbackItem | null {
  const key = feedbackDuplicateKey(request.category, request.title, request.body);
  const since = nowMs - FEEDBACK_DUPLICATE_WINDOW_MS;
  for (const row of items) {
    if (Date.parse(row.createdAt) < since) continue;
    if (
      feedbackDuplicateKey(row.category, row.title, row.body) === key
    ) {
      return row;
    }
  }
  return null;
}

export function buildDemoFeedbackItem(
  request: CreateFeedbackRequest,
  now = new Date(),
): FeedbackItem {
  const stamp = now.toISOString();
  return {
    id: `demo-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    category: request.category,
    title: request.title,
    body: request.body,
    status: "open",
    createdAt: stamp,
    updatedAt: stamp,
  };
}
