import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/index.js";
import { AppBootScreen } from "./AppBootScreen.js";
import { unauthenticatedDestination } from "../features/auth/lib/unauthenticated-destination.js";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Wraps routes that require authentication.
 * - While the auth context is loading (e.g. validating a stored token
 *   on mount), shows the shared boot screen.
 * - If there's no authenticated user, redirects to /login.
 * - Otherwise renders the protected children.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, sessionNotice } = useAuth();

  if (loading) {
    return <AppBootScreen />;
  }

  if (!user) {
    return <Navigate to={unauthenticatedDestination(sessionNotice)} replace />;
  }

  return <>{children}</>;
}
