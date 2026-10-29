import { BadRequestException } from "@nestjs/common";

export interface FeedbackListCursor {
  createdAt: string;
  id: string;
}

export function encodeFeedbackCursor(cursor: FeedbackListCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeFeedbackCursor(raw: string): FeedbackListCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("createdAt" in parsed) ||
    !("id" in parsed)
  ) {
    throw new BadRequestException("Invalid cursor");
  }
  const createdAt = (parsed as { createdAt: unknown }).createdAt;
  const id = (parsed as { id: unknown }).id;
  if (
    typeof createdAt !== "string" ||
    Number.isNaN(Date.parse(createdAt)) ||
    typeof id !== "string" ||
    id.length === 0
  ) {
    throw new BadRequestException("Invalid cursor");
  }
  return { createdAt, id };
}
