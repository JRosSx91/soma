import { Injectable, Logger } from "@nestjs/common";

export interface PasswordResetMailPayload {
  /** Destination address (already normalized). */
  to: string;
  /** Full HTTPS/HTTP reset URL including the opaque token query param. */
  resetUrl: string;
}

/**
 * Delivery capability of a mailer implementation.
 *
 * - `dev-capture` / `dev-log`: local/test only; forbidden in production bootstrap
 * - `disabled`: explicit opt-out; does not send; safe in production
 * - `unconfigured`: misconfiguration; forbidden in production bootstrap
 * - `provider`: real transactional provider (delivery 2+)
 */
export type PasswordResetMailerKind =
  | "dev-capture"
  | "dev-log"
  | "disabled"
  | "unconfigured"
  | "provider";

/**
 * Delivery-1 mailer port. Delivery 2 plugs Resend / SES / Postmark as `provider`
 * behind the same interface.
 *
 * AUTH_PASSWORD_RESET_MAILER:
 * - unset / `memory` outside production → MemoryPasswordResetMailer (dev-capture)
 * - `log` outside production → LoggingPasswordResetMailer (dev-log)
 * - `disabled` → explicit no-send (safe in production; no token churn)
 * - unset / `memory` / `log` / `none` in production → rejected at bootstrap
 */
export abstract class PasswordResetMailer {
  abstract readonly kind: PasswordResetMailerKind;

  /**
   * True when this mailer may accept an outbound reset message for the
   * purpose of issuing a live reset token. Dev capture counts as accepting
   * in non-production only (enforced by assertPasswordResetMailerForRuntime).
   */
  abstract canAcceptSend(): boolean;

  abstract sendPasswordReset(payload: PasswordResetMailPayload): Promise<void>;
}

/** In-memory capture for unit/integration tests and local development. */
@Injectable()
export class MemoryPasswordResetMailer extends PasswordResetMailer {
  readonly kind = "dev-capture" as const;
  readonly sent: PasswordResetMailPayload[] = [];

  canAcceptSend(): boolean {
    return true;
  }

  async sendPasswordReset(payload: PasswordResetMailPayload): Promise<void> {
    this.sent.push({ ...payload });
  }

  last(): PasswordResetMailPayload | undefined {
    return this.sent[this.sent.length - 1];
  }

  clear(): void {
    this.sent.length = 0;
  }
}

/**
 * Dev logger. Full reset URLs are never logged in production (and this mailer
 * must not be selected in production — see assertPasswordResetMailerForRuntime).
 */
@Injectable()
export class LoggingPasswordResetMailer extends PasswordResetMailer {
  readonly kind = "dev-log" as const;
  private readonly logger = new Logger(LoggingPasswordResetMailer.name);

  canAcceptSend(): boolean {
    return true;
  }

  async sendPasswordReset(payload: PasswordResetMailPayload): Promise<void> {
    const allowDevLog =
      process.env.NODE_ENV !== "production" &&
      process.env.AUTH_PASSWORD_RESET_DEV_LOG === "true";

    if (allowDevLog) {
      this.logger.warn(
        `DEV password-reset URL for ${payload.to}: ${payload.resetUrl}`,
      );
      return;
    }

    this.logger.log(
      `Password-reset message accepted for delivery pipeline (recipient redacted; URL redacted)`,
    );
  }
}

/** Explicit opt-out: does not send and must not mint reset tokens. */
@Injectable()
export class DisabledPasswordResetMailer extends PasswordResetMailer {
  readonly kind = "disabled" as const;

  canAcceptSend(): boolean {
    return false;
  }

  async sendPasswordReset(_payload: PasswordResetMailPayload): Promise<void> {
    throw new Error(
      "Password reset mailer is disabled (AUTH_PASSWORD_RESET_MAILER=disabled)",
    );
  }
}

/**
 * Misconfiguration stub. must not be used in production (bootstrap throws).
 */
@Injectable()
export class UnconfiguredPasswordResetMailer extends PasswordResetMailer {
  readonly kind = "unconfigured" as const;

  canAcceptSend(): boolean {
    return false;
  }

  async sendPasswordReset(_payload: PasswordResetMailPayload): Promise<void> {
    throw new Error(
      "Password reset mailer is not configured. Set AUTH_PASSWORD_RESET_MAILER=disabled or a real provider (delivery 2).",
    );
  }
}

export function createPasswordResetMailer(): PasswordResetMailer {
  const mode = (process.env.AUTH_PASSWORD_RESET_MAILER ?? "").toLowerCase();
  const isProd = process.env.NODE_ENV === "production";

  if (mode === "disabled") {
    return new DisabledPasswordResetMailer();
  }
  if (mode === "memory" || (!isProd && mode === "")) {
    return new MemoryPasswordResetMailer();
  }
  if (mode === "log") {
    return new LoggingPasswordResetMailer();
  }
  if (mode === "none" || (isProd && mode === "")) {
    return new UnconfiguredPasswordResetMailer();
  }
  return new UnconfiguredPasswordResetMailer();
}

/**
 * Call at module bootstrap. Production must not run with silent
 * memory/log/none mailers that look like they send mail.
 */
export function assertPasswordResetMailerForRuntime(
  mailer: PasswordResetMailer,
): void {
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd) return;

  if (
    mailer.kind === "dev-capture" ||
    mailer.kind === "dev-log" ||
    mailer.kind === "unconfigured"
  ) {
    throw new Error(
      `Password reset mailer kind "${mailer.kind}" is not allowed in production. ` +
        `Set AUTH_PASSWORD_RESET_MAILER=disabled until a real provider is wired (delivery 2), ` +
        `or configure a provider implementation.`,
    );
  }
}

export const PASSWORD_RESET_MAILER = Symbol("PASSWORD_RESET_MAILER");
