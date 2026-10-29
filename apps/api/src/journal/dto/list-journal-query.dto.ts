import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
} from "class-validator";
import {
  IsJournalCivilDateConstraint,
  toBooleanOrPassthrough,
  toIntOrPassthrough,
} from "./journal-field-validators.js";

export const JOURNAL_LIST_DEFAULT_LIMIT = 20;
export const JOURNAL_LIST_MAX_LIMIT = 50;

export class ListJournalQueryDto {
  @IsOptional()
  @IsString()
  @Validate(IsJournalCivilDateConstraint)
  from?: string;

  @IsOptional()
  @IsString()
  @Validate(IsJournalCivilDateConstraint)
  to?: string;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Transform(toIntOrPassthrough)
  @IsInt()
  @Min(1)
  @Max(JOURNAL_LIST_MAX_LIMIT)
  limit?: number;

  @IsOptional()
  @Transform(toBooleanOrPassthrough)
  @IsBoolean()
  highlighted?: boolean;

  @IsOptional()
  @Transform(toBooleanOrPassthrough)
  @IsBoolean()
  learning?: boolean;
}
