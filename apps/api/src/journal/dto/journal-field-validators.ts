import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from "class-validator";
import {
  JOURNAL_EMOTION_IDS,
  JOURNAL_MILESTONE_KIND_IDS,
  JOURNAL_MILESTONE_NOTE_MAX,
  JOURNAL_TRIGGER_IDS,
  JOURNAL_WELLBEING_MAX,
  JOURNAL_WELLBEING_MIN,
  isCivilDateString,
  isJournalOccurredOnInRange,
} from "@soma/shared-types";
import { hasSignificantJournalContent } from "../journal.mapper.js";

export const JOURNAL_TITLE_MAX = 120;
export const JOURNAL_BODY_MAX = 8_000;
export const JOURNAL_TAG_MAX = 5;

const SUBSTANCE_IDS = [
  "alcohol",
  "nicotine",
  "cannabis",
  "cocaine",
  "caffeine",
] as const;

export function toIntOrPassthrough({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return value;
}

export function toBooleanOrPassthrough({ value }: { value: unknown }): unknown {
  if (value === "true") return true;
  if (value === "false") return false;
  return value;
}

@ValidatorConstraint({ name: "isJournalCivilDate", async: false })
export class IsJournalCivilDateConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    return typeof value === "string" && isJournalOccurredOnInRange(value);
  }

  defaultMessage(): string {
    return "occurredOn must be a YYYY-MM-DD civil date between 1970-01-01 and UTC tomorrow";
  }
}

/** List `from`/`to` window bounds — not an entry occurredOn write. */
@ValidatorConstraint({ name: "isJournalQueryCivilDate", async: false })
export class IsJournalQueryCivilDateConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown): boolean {
    return typeof value === "string" && isCivilDateString(value);
  }

  defaultMessage(): string {
    return "from and to must be YYYY-MM-DD civil dates";
  }
}

@ValidatorConstraint({ name: "journalListRangeOrder", async: false })
export class JournalListRangeOrderConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const query = args.object as { from?: string; to?: string };
    if (!query.from || !query.to) return true;
    return query.from <= query.to;
  }

  defaultMessage(): string {
    return "from must be on or before to";
  }
}

@ValidatorConstraint({ name: "journalHasSignificantContent", async: false })
export class JournalHasSignificantContentConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    return hasSignificantJournalContent(
      args.object as {
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
      },
    );
  }

  defaultMessage(): string {
    return "At least one significant field is required (mood, sleep, energy, anxiety, cravingIntensity, wellbeingRating, emotions, triggers, title, or body)";
  }
}

export function OptionalWellbeing() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    Transform(toIntOrPassthrough)(target, propertyKey);
    IsInt()(target, propertyKey);
    Min(JOURNAL_WELLBEING_MIN)(target, propertyKey);
    Max(JOURNAL_WELLBEING_MAX)(target, propertyKey);
  };
}

export function OptionalScale() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    Transform(toIntOrPassthrough)(target, propertyKey);
    IsInt()(target, propertyKey);
    Min(1)(target, propertyKey);
    Max(5)(target, propertyKey);
  };
}

export function OptionalTagList(catalog: readonly string[]) {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    IsArray()(target, propertyKey);
    ArrayMaxSize(JOURNAL_TAG_MAX)(target, propertyKey);
    ArrayUnique()(target, propertyKey);
    IsIn([...catalog], { each: true })(target, propertyKey);
  };
}

export function OptionalTitle() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    IsString()(target, propertyKey);
    MaxLength(JOURNAL_TITLE_MAX)(target, propertyKey);
  };
}

export function OptionalBody() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    IsString()(target, propertyKey);
    MaxLength(JOURNAL_BODY_MAX)(target, propertyKey);
  };
}

export function OptionalCravingSubstance() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined && value !== null)(
      target,
      propertyKey,
    );
    IsIn([...SUBSTANCE_IDS])(target, propertyKey);
  };
}

export function OptionalFlag() {
  return function (target: object, propertyKey: string): void {
    ValidateIf((_, value) => value !== undefined)(target, propertyKey);
    Transform(toBooleanOrPassthrough)(target, propertyKey);
    IsBoolean()(target, propertyKey);
  };
}

export {
  JOURNAL_EMOTION_IDS,
  JOURNAL_MILESTONE_KIND_IDS,
  JOURNAL_MILESTONE_NOTE_MAX,
  JOURNAL_TRIGGER_IDS,
  Validate,
};
