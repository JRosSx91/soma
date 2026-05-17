import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { UsageFrequency, UsageStatus } from '@prisma/client';

export class UpsertUsageDto {
  @IsString()
  substanceId!: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  yearStarted!: number;

  /**
   * Required when `status` is 'abstinent'. Must be null/absent when
   * `status` is 'active' — if you're still using, there is no
   * meaningful "last use date".
   */
  @ValidateIf((o: UpsertUsageDto) => o.status === 'abstinent')
  @IsDateString()
  lastUseDate?: string | null;

  @IsEnum(UsageFrequency)
  frequency!: UsageFrequency;

  /**
   * Whether the user is in abstinence (default) or actively consuming.
   * Defaults to 'abstinent' for backwards compatibility — clients that
   * don't send this field behave as before.
   */
  @IsOptional()
  @IsEnum(UsageStatus)
  status?: UsageStatus;
}