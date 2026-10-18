import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { UpsertUsageDto } from "./upsert-usage.dto.js";

/**
 * Full-replace body for PUT /me/profile.
 *
 * - `usages` is required (must be present).
 * - `null` / omitted → 400 (must not clear tracking silently).
 * - `[]` → explicit clear of all SubstanceUsage rows.
 * - Partial arrays replace the entire set (clients must read-modify-write).
 */
export class UpsertProfileDto {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertUsageDto)
  @ArrayMaxSize(20)
  usages!: UpsertUsageDto[];
}
