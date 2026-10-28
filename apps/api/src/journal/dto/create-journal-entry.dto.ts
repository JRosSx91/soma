import { IsString, Validate } from "class-validator";
import {
  IsJournalCivilDateConstraint,
  JournalHasSignificantContentConstraint,
  JOURNAL_EMOTION_IDS,
  JOURNAL_TRIGGER_IDS,
  OptionalBody,
  OptionalCravingSubstance,
  OptionalFlag,
  OptionalScale,
  OptionalTagList,
  OptionalTitle,
} from "./journal-field-validators.js";

export class CreateJournalEntryDto {
  @Validate(JournalHasSignificantContentConstraint)
  private readonly _significant?: undefined;

  @IsString()
  @Validate(IsJournalCivilDateConstraint)
  occurredOn!: string;

  @OptionalScale()
  mood?: number;

  @OptionalScale()
  sleep?: number;

  @OptionalScale()
  energy?: number;

  @OptionalScale()
  anxiety?: number;

  @OptionalScale()
  cravingIntensity?: number;

  @OptionalCravingSubstance()
  cravingSubstanceId?: string;

  @OptionalTitle()
  title?: string;

  @OptionalBody()
  body?: string;

  @OptionalFlag()
  highlighted?: boolean;

  @OptionalFlag()
  learning?: boolean;

  @OptionalTagList(JOURNAL_EMOTION_IDS)
  emotionIds?: string[];

  @OptionalTagList(JOURNAL_TRIGGER_IDS)
  triggerIds?: string[];
}
