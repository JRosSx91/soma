import {
  civilDateToUtcDate,
  isCivilDateString,
  utcDateToCivilDate,
} from "@soma/shared-types";
import { BadRequestException } from "@nestjs/common";

export interface JournalListCursor {
  occurredOn: string;
  createdAt: string;
  id: string;
}

export function encodeJournalCursor(cursor: JournalListCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeJournalCursor(raw: string): JournalListCursor {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    throw new BadRequestException("Invalid cursor");
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("occurredOn" in parsed) ||
    !("createdAt" in parsed) ||
    !("id" in parsed)
  ) {
    throw new BadRequestException("Invalid cursor");
  }
  const occurredOn = (parsed as { occurredOn: unknown }).occurredOn;
  const createdAt = (parsed as { createdAt: unknown }).createdAt;
  const id = (parsed as { id: unknown }).id;
  if (
    typeof occurredOn !== "string" ||
    !isCivilDateString(occurredOn) ||
    typeof createdAt !== "string" ||
    Number.isNaN(Date.parse(createdAt)) ||
    typeof id !== "string" ||
    id.length === 0
  ) {
    throw new BadRequestException("Invalid cursor");
  }
  utcDateToCivilDate(civilDateToUtcDate(occurredOn));
  return { occurredOn, createdAt, id };
}
