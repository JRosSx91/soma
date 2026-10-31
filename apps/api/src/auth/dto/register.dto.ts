import {
  Equals,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from "class-validator";
import { BiologicalSex } from "@prisma/client";
import {
  LEGAL_ADULT_AGE_VERSION,
  LEGAL_PRIVACY_VERSION,
  LEGAL_TERMS_VERSION,
} from "@soma/shared-types";

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

  /**
   * Civil date of birth (YYYY-MM-DD). Used only to check majority of age.
   * The account stores the derived year, not this date.
   */
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  birthDate!: string;

  /** Optional; Prisma Float? / PG DOUBLE PRECISION — decimals allowed. */
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(20)
  @Max(400)
  weightKg?: number;

  /**
   * Closed-beta invite plaintext. Optional in the DTO so open mode stays
   * unchanged; invite mode enforces format in AuthService with a generic 403.
   */
  @IsOptional()
  @IsString()
  inviteToken?: string;

  /**
   * Affirmative actions on the current draft documents. Required for new
   * registrations.
   */
  @IsBoolean()
  @Equals(true)
  acceptedTerms!: boolean;

  @IsString()
  @Equals(LEGAL_TERMS_VERSION)
  termsVersion!: string;

  @IsBoolean()
  @Equals(true)
  acceptedPrivacyNotice!: boolean;

  @IsString()
  @Equals(LEGAL_PRIVACY_VERSION)
  privacyNoticeVersion!: string;

  @IsBoolean()
  @Equals(true)
  acceptedAdultAge!: boolean;

  @IsString()
  @Equals(LEGAL_ADULT_AGE_VERSION)
  adultAgeVersion!: string;
}
