import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.js";
import { ResetPasswordPage } from "./pages/ResetPasswordPage.js";
import { OnboardingPage } from "./pages/OnboardingPage.js";
import { AchievementsPage } from "./pages/AchievementsPage.js";
import { LandingPage } from "./pages/LandingPage.js";
import { PreviewShell } from "./features/recovery-dashboard/components/PreviewShell.js";
import { PreviewHome } from "./features/recovery-dashboard/components/PreviewHome.js";
import { RecoveryPage } from "./features/recovery-dashboard/pages/RecoveryPage.js";
import { ExplorePage } from "./features/recovery-dashboard/pages/ExplorePage.js";
import { AnatomyExplorerPage } from "./features/recovery-dashboard/pages/AnatomyExplorerPage.js";
import { AchievementsPage as Soma2AchievementsPage } from "./features/recovery-dashboard/pages/AchievementsPage.js";
import { AccountPage } from "./features/recovery-dashboard/pages/AccountPage.js";
import { useTranslation } from "react-i18next";
import { ProtectedLayout } from "./components/ProtectedLayout.js";
import { useAuth } from "./features/auth/index.js";

// The anatomical viewer preloads its model at module scope. Keep that
// module out of the initial graph so Soma 2.0 (/app, /preview) does not
// download the GLB until /app-legacy is opened.
const MainPage = lazy(() =>
  import("./pages/MainPage.js").then((module) => ({
    default: module.MainPage,
  })),
);

function RootRoute() {
  const { user, loading } = useAuth();
  const { t } = useTranslation("common");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        {t("loading")}
      </div>
    );
  }

  // Authenticated users resolve onboarding via LoginPage (pending invite vs /app).
  // Avoids sending pending sessions straight to /app without a coherent invite.
  return user ? <Navigate to="/login" replace /> : <LandingPage />;
}

const legacyFallback = (
  <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
    Loading…
  </div>
);

/** Shared Soma 2.0 page tree — same elements under `/app` and `/preview`. */
const soma2Pages = (
  <>
    <Route index element={<PreviewHome />} />
    <Route path="recovery" element={<RecoveryPage />} />
    <Route path="explore" element={<ExplorePage />} />
    <Route path="anatomy" element={<AnatomyExplorerPage />} />
    <Route path="achievements" element={<Soma2AchievementsPage />} />
    <Route path="account" element={<AccountPage />} />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/preview" element={<PreviewShell base="/preview" />}>
          {soma2Pages}
        </Route>

        {/* Authenticated routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/app" element={<PreviewShell base="/app" />}>
            {soma2Pages}
          </Route>
          <Route
            path="/app-legacy"
            element={
              <Suspense fallback={legacyFallback}>
                <MainPage />
              </Suspense>
            }
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* Legacy Soma 1.0 achievements + toast-driven unlock surface */}
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
