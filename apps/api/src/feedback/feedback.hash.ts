import { createHash } from "node:crypto";
import {
  feedbackDuplicateKey,
  type FeedbackCategoryId,
} from "@soma/shared-types";

export function feedbackFingerprint(
  category: FeedbackCategoryId,
  title: string,
  body: string,
): string {
  return createHash("sha256")
    .update(feedbackDuplicateKey(category, title, body), "utf8")
    .digest("hex");
}
