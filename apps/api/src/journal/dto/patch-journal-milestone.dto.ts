import { IsIn, IsOptional, IsString, MaxLength, Validate, ValidateIf } from "class-validator";
import {
  IsJournalCivilDateConstraint,
  JOURNAL_MILESTONE_KIND_IDS,
  JOURNAL_MILESTONE_NOTE_MAX,
} from "./journal-field-validators.js";

export class PatchJournalMilestoneDto {
  @ValidateIf((_, value) => value !== undefined)
  @IsIn([...JOURNAL_MILESTONE_KIND_IDS])
  kind?: string;

  @ValidateIf((_, value) => value !== undefined)
  @Validate(IsJournalCivilDateConstraint)
  occurredOn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(JOURNAL_MILESTONE_NOTE_MAX)
  note?: string | null;
}
