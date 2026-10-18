import { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  restoreSession,
  fetchCurrentUser,
} from "../client/auth-api.js";
import { SESSION_REVOKED_EVENT } from "../client/api.js";
import { clearLegacyAuthStorage } from "../client/access-token.js";
import type {
  AuthState,
  AuthStatus,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "../types.js";

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<{ remoteRevoked: boolean }>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      clearLegacyAuthStorage();
      try {
        const restored = await restoreSession();
        if (cancelled) return;

        if (!restored) {
          setUser(null);
          setStatus("anonymous");
          return;
        }

        const fullUser = await fetchCurrentUser();
        if (cancelled) return;

        if (!fullUser) {
          setUser(null);
          setStatus("anonymous");
          return;
        }

        setUser(fullUser);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      setUser(null);
      setStatus("anonymous");
      setSessionNotice("session_expired");
    };
    window.addEventListener(SESSION_REVOKED_EVENT, handler);
    return () => window.removeEventListener(SESSION_REVOKED_EVENT, handler);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    setSessionNotice(null);
    try {
      await loginApi(credentials);
      const fullUser = await fetchCurrentUser();
      if (!fullUser) {
        throw new Error("Login succeeded but user profile could not be loaded");
      }
      setUser(fullUser);
      setStatus("authenticated");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      setStatus("anonymous");
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setError(null);
    setSessionNotice(null);
    try {
      await registerApi(credentials);
      const fullUser = await fetchCurrentUser();
      if (!fullUser) {
        throw new Error(
          "Registration succeeded but user profile could not be loaded",
        );
      }
      setUser(fullUser);
      setStatus("authenticated");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";
      setError(message);
      setStatus("anonymous");
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setError(null);
    setSessionNotice(null);
    // Clear local state first so a late refresh cannot resurrect the session.
    setUser(null);
    setStatus("anonymous");
    const result = await logoutApi();
    return result;
  }, []);

  const loading = status === "checking";

  const value: AuthContextValue = {
    user,
    loading,
    status,
    error,
    sessionNotice,
    hasAccessToken: status === "authenticated",
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
