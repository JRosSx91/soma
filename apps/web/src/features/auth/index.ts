export { AuthProvider } from "./context/AuthContext.js";
export { useAuth } from "./hooks/useAuth.js";
export type {
  AuthUser,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
  AuthStatus,
} from "./types.js";
export { ApiError } from "./client/api.js";
export {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "./client/access-token.js";
export { translateAuthError } from "./lib/translate-error.js";
export { mergeAuthUserFromProfile } from "./lib/merge-auth-user.js";
export type { ProfileUserSnapshot } from "./lib/merge-auth-user.js";
