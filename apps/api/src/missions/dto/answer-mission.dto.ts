import { IsString, Length } from "class-validator";

export class AnswerMissionDto {
  @IsString()
  @Length(1, 191)
  optionId!: string;
}
