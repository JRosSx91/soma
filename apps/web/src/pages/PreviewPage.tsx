import { Navigate } from "react-router-dom";

/**
 * Historical entry for the public Soma 2.0 DEMO.
 * The shell is now mounted directly at `/preview` in App.tsx.
 */
export function PreviewPage() {
  return <Navigate to="/preview" replace />;
}
