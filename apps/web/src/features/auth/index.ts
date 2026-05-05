export { AuthProvider } from './context/AuthContext.js';
export { useAuth } from './hooks/useAuth.js';
export type {
  AuthUser,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
} from './types.js';
export { ApiError } from './client/api.js';