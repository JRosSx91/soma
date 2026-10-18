import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { BiologicalSex } from "@prisma/client";

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsEnum(BiologicalSex)
  biologicalSex!: BiologicalSex;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear!: number;

  /** Optional; Prisma Float? / PG DOUBLE PRECISION — decimals allowed. */
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(20)
  @Max(400)
  weightKg?: number;
}
