import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute.js';
import { TrophyToastStack } from '../features/achievements/index.js';

/**
 * Layout for all authenticated routes. Wraps children in
 * ProtectedRoute (auth guard) and mounts the trophy toast stack
 * once at the top of the auth tree, so trophy notifications appear
 * regardless of which page the user is on.
 */
export function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
      <TrophyToastStack />
    </ProtectedRoute>
  );
}