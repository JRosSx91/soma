import { BiologicalSex } from "@prisma/client";
import { Transform } from "class-transformer";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsString,
  Max,
  Min,
  MinLength,
  Validate,
  ValidateIf,
  ValidatorConstraint,
  type ValidationArguments,
  type ValidatorConstraintInterface,
} from "class-validator";

function toIntOrPassthrough({ value }: { value: unknown }): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return value;
}

@ValidatorConstraint({ name: "atLeastOneProfileDetail", async: false })
class AtLeastOneProfileDetailConstraint
  implements ValidatorConstraintInterface
{
  validate(_: unknown, args: ValidationArguments): boolean {
    const o = args.object as UpdateProfileDetailsDto;
    return (
      o.displayName !== undefined ||
      o.biologicalSex !== undefined ||
      o.birthYear !== undefined ||
      o.weightKg !== undefined
    );
  }

  defaultMessage(): string {
    return "At least one editable field is required (displayName, biologicalSex, birthYear, or weightKg)";
  }
}

/**
 * Partial update of editable User profile fields (PATCH /me/profile/details).
 *
 * - Omitted fields are left unchanged (property absent / undefined).
 * - Empty body is rejected (at least one editable field required).
 * - `null` is only valid for `weightKg` (optional column).
 * - Non-whitelisted keys are rejected by ValidationPipe `forbidNonWhitelisted`.
 *
 * Weight: finite number in [20, 400], decimals OK (Float? / DOUBLE PRECISION).
 * Strings are not coerced.
 */
export class UpdateProfileDetailsDto {
  /**
   * Presence sentinel — validated against the whole object so `{}` is 400.
   * Not part of the public API surface (stripped by whitelist if somehow set).
   */
  @Validate(AtLeastOneProfileDetailConstraint)
  private readonly _atLeastOne?: undefined;

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @MinLength(1)
  displayName?: string;

  @ValidateIf((_, value) => value !== undefined)
  @IsEnum(BiologicalSex)
  biologicalSex?: BiologicalSex;

  @ValidateIf((_, value) => value !== undefined)
  @Transform(toIntOrPassthrough)
  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear())
  birthYear?: number;

  /** Explicit null clears weight; omit to leave unchanged. */
  @ValidateIf((_, value) => value !== undefined && value !== null)
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(20)
  @Max(400)
  weightKg?: number | null;
}
