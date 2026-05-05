import {
  IsDateString,
  IsEnum,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { UsageFrequency } from '@prisma/client';

export class UpsertUsageDto {
  @IsString()
  substanceId!: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  yearStarted!: number;

  @IsDateString()
  lastUseDate!: string;

  @IsEnum(UsageFrequency)
  frequency!: UsageFrequency;
}