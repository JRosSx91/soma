import type { FeedbackReport } from "@prisma/client";
import type { FeedbackItem } from "@soma/shared-types";

export function toFeedbackItem(row: FeedbackReport): FeedbackItem {
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}
