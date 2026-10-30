import {
  LEGAL_NOTICE_STATUS,
  isCurrentRegistrationAcceptance,
  isLegalNoticePublished,
  registrationAcceptanceRecords,
  type RegistrationAcceptanceFields,
} from "@soma/shared-types";
import type { Prisma } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service.js";
import { isProductionEnv } from "../config/production-env.js";
import {
  CodedBadRequestException,
  CodedForbiddenException,
} from "../common/exceptions/coded-exception.js";
import {
  REGISTRATION_UNAVAILABLE_CODE,
  REGISTRATION_UNAVAILABLE_MESSAGE,
} from "./registration-mode.js";

export const AUTH_ACCEPTANCE_REQUIRED_CODE = "AUTH_ACCEPTANCE_REQUIRED";
export const AUTH_ACCEPTANCE_REQUIRED_MESSAGE =
  "Registration acceptance is incomplete";

type AcceptanceDb = PrismaService | Prisma.TransactionClient;

/**
 * Production must not mint real accounts against unpublished legal drafts.
 * Development and tests keep registration so the flow can be exercised.
 */
export function assertProductionAllowsRegistration(
  env: NodeJS.ProcessEnv = process.env,
  legalStatus: string = LEGAL_NOTICE_STATUS,
): void {
  if (!isProductionEnv(env)) return;
  if (isLegalNoticePublished(legalStatus)) return;
  throw new CodedForbiddenException(
    REGISTRATION_UNAVAILABLE_CODE,
    REGISTRATION_UNAVAILABLE_MESSAGE,
  );
}

export function assertRegistrationAcceptance(
  input: Partial<RegistrationAcceptanceFields>,
): void {
  if (!isCurrentRegistrationAcceptance(input)) {
    throw new CodedBadRequestException(
      AUTH_ACCEPTANCE_REQUIRED_CODE,
      AUTH_ACCEPTANCE_REQUIRED_MESSAGE,
    );
  }
}

export async function persistRegistrationAcceptances(
  db: AcceptanceDb,
  userId: string,
  acceptedAt: Date = new Date(),
): Promise<void> {
  await db.registrationAcceptance.createMany({
    data: registrationAcceptanceRecords(acceptedAt).map((row) => ({
      userId,
      purpose: row.purpose,
      documentVersion: row.documentVersion,
      acceptedAt: row.acceptedAt,
    })),
  });
}
