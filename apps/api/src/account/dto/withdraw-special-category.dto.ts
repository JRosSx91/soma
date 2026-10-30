import { IsString, MinLength } from "class-validator";

export class WithdrawSpecialCategoryDto {
  @IsString()
  @MinLength(1)
  password!: string;
}
