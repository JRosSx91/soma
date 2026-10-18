import { IsIn } from "class-validator";
import { OnboardingStatus } from "@prisma/client";

/**
 * Explicit onboarding intent update.
 * `pending` is accepted in the DTO so clients can send a full enum,
 * but the service rejects illegal transitions (including → pending
 * from skipped/completed).
 */
export class UpdateOnboardingStatusDto {
  @IsIn(["pending", "skipped", "completed"])
  status!: OnboardingStatus;
}
