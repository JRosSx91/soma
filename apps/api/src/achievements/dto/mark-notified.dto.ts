import { ArrayUnique, IsArray, IsString } from 'class-validator';

export class MarkNotifiedDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  achievementIds!: string[];
}