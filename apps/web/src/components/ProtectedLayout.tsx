import { Outlet } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute.js";

/**
 * Layout for authenticated routes. Achievement toasts are no longer mounted
 * here: LIVE celebrations live in the /app shell, and the inbox bell is the
 * persistent surface for unlocks.
 */
export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
