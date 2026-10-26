import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsString,
  MinLength,
} from "class-validator";

/** Catalog is 106 items; cap batches above that to reject oversized payloads. */
export const ACHIEVEMENT_IDS_MAX_BATCH = 120;

/**
 * Shared body for inbox-read and celebrate. Unknown keys are rejected by
 * ValidationPipe `forbidNonWhitelisted` (e.g. a forged `userId`).
 */
export class AchievementIdsDto {
  @IsArray()
  @ArrayMaxSize(ACHIEVEMENT_IDS_MAX_BATCH)
  @ArrayUnique()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  achievementIds!: string[];
}
