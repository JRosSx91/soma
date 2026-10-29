import { IsIn, IsOptional, IsString, MaxLength, Validate } from "class-validator";
import {
  IsJournalCivilDateConstraint,
  JOURNAL_MILESTONE_KIND_IDS,
  JOURNAL_MILESTONE_NOTE_MAX,
} from "./journal-field-validators.js";

export class CreateJournalMilestoneDto {
  @IsIn([...JOURNAL_MILESTONE_KIND_IDS])
  kind!: string;

  @IsString()
  @Validate(IsJournalCivilDateConstraint)
  occurredOn!: string;

  @IsOptional()
  @IsString()
  @MaxLength(JOURNAL_MILESTONE_NOTE_MAX)
  note?: string | null;
}
