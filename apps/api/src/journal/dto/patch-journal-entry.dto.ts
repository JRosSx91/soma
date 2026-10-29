import { ValidateIf } from "class-validator";
import {
  IsJournalCivilDateConstraint,
  JOURNAL_EMOTION_IDS,
  JOURNAL_TRIGGER_IDS,
  OptionalBody,
  OptionalCravingSubstance,
  OptionalFlag,
  OptionalScale,
  OptionalTagList,
  OptionalTitle,
  OptionalWellbeing,
  Validate,
} from "./journal-field-validators.js";

/**
 * Partial update. Omitted fields stay unchanged. `null` clears nullable
 * content (scales, tags, title, body, cravingSubstanceId).
 */
export class PatchJournalEntryDto {
  @ValidateIf((_, value) => value !== undefined)
  @Validate(IsJournalCivilDateConstraint)
  occurredOn?: string;

  @OptionalScale()
  mood?: number | null;

  @OptionalScale()
  sleep?: number | null;

  @OptionalScale()
  energy?: number | null;

  @OptionalScale()
  anxiety?: number | null;

  @OptionalScale()
  cravingIntensity?: number | null;

  @OptionalWellbeing()
  wellbeingRating?: number | null;

  @OptionalCravingSubstance()
  cravingSubstanceId?: string | null;

  @OptionalTitle()
  title?: string | null;

  @OptionalBody()
  body?: string | null;

  @OptionalFlag()
  highlighted?: boolean;

  @OptionalFlag()
  learning?: boolean;

  @OptionalTagList(JOURNAL_EMOTION_IDS)
  emotionIds?: string[] | null;

  @OptionalTagList(JOURNAL_TRIGGER_IDS)
  triggerIds?: string[] | null;
}
