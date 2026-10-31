import {
  canConfirmDeleteAccount,
  isWrongPasswordDeleteError,
  submitDeleteAccount,
} from "./delete-account.js";

export const canConfirmWithdrawConsent = canConfirmDeleteAccount;
export const submitWithdrawConsent = submitDeleteAccount;
export { isWrongPasswordDeleteError };
