import { IsString, Matches, MinLength } from "class-validator";

/**
 * Token is base64url from 32 random bytes (~43 chars). Bound length to reject
 * junk early without leaking whether a hash matched.
 */
export class ResetPasswordDto {
  @IsString()
  @MinLength(20)
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: "Invalid reset token",
  })
  token!: string;

  @IsString()
  @MinLength(8)
  newPassword!: string;
}
