import { ArrayMaxSize, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UpsertUsageDto } from './upsert-usage.dto.js';

export class UpsertProfileDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertUsageDto)
  @ArrayMaxSize(20)
  usages!: UpsertUsageDto[];
}