import { IsOptional, IsString } from "class-validator";

export class ListFeedbackQueryDto {
  @IsOptional()
  @IsString()
  cursor?: string;
}
