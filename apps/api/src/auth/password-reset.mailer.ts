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
 * Mailer port for password-reset delivery.
 *
 * AUTH_PASSWORD_RESET_MAILER:
 * - unset / `memory` outside production → MemoryPasswordResetMailer (dev-capture)
 * - `log` outside production → LoggingPasswordResetMailer (dev-log)
 * - `disabled` → explicit no-send (safe in production; no token churn)
 * - `resend` → ResendPasswordResetMailer when RESEND_API_KEY + PASSWORD_RESET_FROM_EMAIL
 *   are set; otherwise falls back to disabled (no invented secrets)
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
      "Password reset mailer is not configured. Set AUTH_PASSWORD_RESET_MAILER=disabled or a real provider (e.g. resend).",
    );
  }
}

/** Default outbound timeout for Resend HTTP (ms). Overridable for tests. */
export const RESEND_SEND_TIMEOUT_MS = 15_000;

/**
 * Resend transactional adapter (native fetch — no SDK dependency).
 * Activated only when AUTH_PASSWORD_RESET_MAILER=resend and both
 * RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL are non-empty.
 * Never logs the API key, reset URL, or response body.
 */
@Injectable()
export class ResendPasswordResetMailer extends PasswordResetMailer {
  readonly kind = "provider" as const;
  private readonly logger = new Logger(ResendPasswordResetMailer.name);

  canAcceptSend(): boolean {
    return Boolean(this.apiKey() && this.fromAddress());
  }

  private apiKey(): string | undefined {
    const key = process.env.RESEND_API_KEY?.trim();
    return key || undefined;
  }

  private fromAddress(): string | undefined {
    const from = process.env.PASSWORD_RESET_FROM_EMAIL?.trim();
    return from || undefined;
  }

  private timeoutMs(): number {
    const raw = process.env.RESEND_SEND_TIMEOUT_MS;
    if (raw === undefined || raw === "") return RESEND_SEND_TIMEOUT_MS;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : RESEND_SEND_TIMEOUT_MS;
  }

  async sendPasswordReset(payload: PasswordResetMailPayload): Promise<void> {
    const apiKey = this.apiKey();
    const from = this.fromAddress();
    if (!apiKey || !from) {
      throw new Error(
        "Resend mailer is missing RESEND_API_KEY or PASSWORD_RESET_FROM_EMAIL",
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs());

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          from,
          to: [payload.to],
          subject: "Reset your Soma password",
          text: [
            "Use this link to reset your Soma password. It expires in 30 minutes.",
            "",
            payload.resetUrl,
            "",
            "If you did not request this, you can ignore this email.",
          ].join("\n"),
        }),
      });

      // Drain body without inspecting/logging (may contain provider echoes).
      await response.arrayBuffer().catch(() => undefined);

      if (!response.ok) {
        this.logger.error(
          `Resend rejected password-reset send (status=${response.status})`,
        );
        throw new Error(`Resend send failed with status ${response.status}`);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        this.logger.error("Resend password-reset send timed out");
        throw new Error("Resend send timed out");
      }
      if (err instanceof Error && /^Resend send failed/.test(err.message)) {
        throw err;
      }
      this.logger.error("Resend password-reset send failed (network)");
      throw new Error("Resend send failed (network)");
    } finally {
      clearTimeout(timer);
    }
  }
}

export function createPasswordResetMailer(): PasswordResetMailer {
  const mode = (process.env.AUTH_PASSWORD_RESET_MAILER ?? "").toLowerCase();
  const isProd = process.env.NODE_ENV === "production";

  if (mode === "disabled") {
    return new DisabledPasswordResetMailer();
  }
  if (mode === "resend") {
    const resend = new ResendPasswordResetMailer();
    // Incomplete credentials → safe no-send (do not invent secrets).
    if (!resend.canAcceptSend()) {
      return new DisabledPasswordResetMailer();
    }
    return resend;
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
        `Set AUTH_PASSWORD_RESET_MAILER=disabled, or AUTH_PASSWORD_RESET_MAILER=resend ` +
        `with RESEND_API_KEY and PASSWORD_RESET_FROM_EMAIL.`,
    );
  }
}

export const PASSWORD_RESET_MAILER = Symbol("PASSWORD_RESET_MAILER");
