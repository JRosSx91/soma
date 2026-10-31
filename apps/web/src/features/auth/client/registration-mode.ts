import { apiRequest } from "./api.js";

export type RegistrationMode = "invite" | "open";

export type RegistrationModeState =
  | { status: "loading"; mode: null }
  | { status: "ready"; mode: RegistrationMode }
  | { status: "error"; mode: null };

export async function fetchRegistrationMode(): Promise<RegistrationMode> {
  const body = await apiRequest<{ mode?: unknown }>("/auth/registration-mode", {
    method: "GET",
    anonymous: true,
    skipRefresh: true,
  });
  if (body.mode === "invite" || body.mode === "open") {
    return body.mode;
  }
  throw new Error("registration-mode-invalid");
}
