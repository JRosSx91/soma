import { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  fetchCurrentUser,
} from '../client/auth-api.js';
import {
  clearStoredToken,
  getStoredToken,
  UNAUTHORIZED_EVENT,
} from '../client/api.js';
import type {
  AuthState,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from '../types.js';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * On mount, if there's a stored token, validate it by fetching the
   * current user from the backend. If the token is invalid, the API
   * client emits the unauthorized event and we clear local state.
   */
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((u) => {
        setUser(u);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /**
   * Listen for unauthorized events emitted by the API client.
   * When a 401 happens (e.g. expired token), clear the session.
   */
  useEffect(() => {
    const handler = () => {
      clearStoredToken();
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, handler);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handler);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setError(null);
    try {
      // loginApi stores the token internally and returns a partial
      // user. We discard that partial and refetch the full user from
      // /me to keep a single source of truth for the User shape.
      await loginApi(credentials);
      const fullUser = await fetchCurrentUser();
      setUser(fullUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    }
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    setError(null);
    try {
      await registerApi(credentials);
      const fullUser = await fetchCurrentUser();
      setUser(fullUser);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
    setError(null);
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}