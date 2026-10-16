import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { OnboardingPage } from "./pages/OnboardingPage.js";
import { AchievementsPage } from "./pages/AchievementsPage.js";
import { LandingPage } from "./pages/LandingPage.js";
import { PreviewPage } from "./pages/PreviewPage.js";
import { PreviewHome } from "./features/recovery-dashboard/components/PreviewHome.js";
import { RecoveryPage } from "./features/recovery-dashboard/pages/RecoveryPage.js";
import { ExplorePage } from "./features/recovery-dashboard/pages/ExplorePage.js";
import { AnatomyExplorerPage } from "./features/recovery-dashboard/pages/AnatomyExplorerPage.js";
import { AchievementsPage as PreviewAchievementsPage } from "./features/recovery-dashboard/pages/AchievementsPage.js";
import { ProtectedLayout } from "./components/ProtectedLayout.js";
import { useAuth } from "./features/auth/index.js";

// The anatomical viewer preloads its model at module scope. Keep that
// module out of the initial graph so /preview does not download it.
const MainPage = lazy(() =>
  import("./pages/MainPage.js").then((module) => ({
    default: module.MainPage,
  })),
);

function RootRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
        Loading…
      </div>
    );
  }

  return user ? <Navigate to="/app" replace /> : <LandingPage />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/preview" element={<PreviewPage />}>
          <Route index element={<PreviewHome />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="anatomy" element={<AnatomyExplorerPage />} />
          <Route path="achievements" element={<PreviewAchievementsPage />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<ProtectedLayout />}>
          <Route
            path="/app"
            element={
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center bg-soma-bg-base text-soma-fg-secondary">
                    Loading…
                  </div>
                }
              >
                <MainPage />
              </Suspense>
            }
          />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
