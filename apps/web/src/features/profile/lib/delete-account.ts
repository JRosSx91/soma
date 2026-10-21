import { ApiError } from "../../auth/client/api.js";

export function canConfirmDeleteAccount(input: {
  acknowledged: boolean;
  password: string;
  submitting: boolean;
}): boolean {
  return (
    input.acknowledged &&
    input.password.trim().length > 0 &&
    !input.submitting
  );
}

export function isWrongPasswordDeleteError(error: unknown): boolean {
  if (!(error instanceof ApiError) || error.status !== 401) {
    return false;
  }
  if (error.code === "AUTH_INVALID_CREDENTIALS") {
    return true;
  }
  return /invalid credentials/i.test(error.message);
}

export async function submitDeleteAccount(input: {
  acknowledged: boolean;
  password: string;
  inFlight: { current: boolean };
  deleteFn: (password: string) => Promise<void>;
  onSuccess: () => void;
  onWrongPassword: () => void;
  onKeepSessionFailure: () => void;
}): Promise<"ignored" | "success" | "wrong_password" | "failed"> {
  if (
    !canConfirmDeleteAccount({
      acknowledged: input.acknowledged,
      password: input.password,
      submitting: input.inFlight.current,
    })
  ) {
    return "ignored";
  }
  if (input.inFlight.current) {
    return "ignored";
  }

  input.inFlight.current = true;
  try {
    await input.deleteFn(input.password);
    input.onSuccess();
    return "success";
  } catch (err) {
    if (isWrongPasswordDeleteError(err)) {
      input.onWrongPassword();
      return "wrong_password";
    }
    input.onKeepSessionFailure();
    return "failed";
  } finally {
    input.inFlight.current = false;
  }
}
