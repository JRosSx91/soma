export type RegistrationMode = "open" | "invite";

export class RegistrationModeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RegistrationModeError";
  }
}

/**
 * AUTH_REGISTRATION_MODE=open|invite.
 * Production requires the variable to be set explicitly. Both values are
 * valid; unpublished legal notices still block production registration.
 * Non-production defaults to open when unset. Unknown values never fall through.
 */
export function resolveRegistrationMode(
  env: NodeJS.ProcessEnv = process.env,
): RegistrationMode {
  const raw = (env.AUTH_REGISTRATION_MODE ?? "").trim().toLowerCase();
  const isProd = env.NODE_ENV === "production";

  if (!raw) {
    if (isProd) {
      throw new RegistrationModeError(
        "AUTH_REGISTRATION_MODE must be set to \"open\" or \"invite\" in production",
      );
    }
    return "open";
  }

  if (raw === "open" || raw === "invite") {
    return raw;
  }

  throw new RegistrationModeError(
    `AUTH_REGISTRATION_MODE is invalid (${JSON.stringify(raw)}); use "open" or "invite"`,
  );
}

export const REGISTRATION_UNAVAILABLE_CODE = "AUTH_REGISTRATION_UNAVAILABLE";
export const REGISTRATION_UNAVAILABLE_MESSAGE = "Registration is unavailable";
