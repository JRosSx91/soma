import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage.js";
import { RegisterPage } from "./pages/RegisterPage.js";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage.js";
import { ResetPasswordPage } from "./pages/ResetPasswordPage.js";
import { OnboardingPage } from "./pages/OnboardingPage.js";
import { LandingV2Page } from "./features/landing-v2/LandingV2Page.js";
import { NotFoundPage } from "./pages/NotFoundPage.js";
import { PreviewShell } from "./features/recovery-dashboard/components/PreviewShell.js";
import { PreviewHome } from "./features/recovery-dashboard/components/PreviewHome.js";
import { RecoveryPage } from "./features/recovery-dashboard/pages/RecoveryPage.js";
import { ExplorePage } from "./features/recovery-dashboard/pages/ExplorePage.js";
import { AnatomyExplorerPage } from "./features/recovery-dashboard/pages/AnatomyExplorerPage.js";
import { AchievementsPage as Soma2AchievementsPage } from "./features/recovery-dashboard/pages/AchievementsPage.js";
import { JournalPage } from "./features/recovery-dashboard/pages/JournalPage.js";
import { MissionsPage } from "./features/recovery-dashboard/pages/MissionsPage.js";
import { ExpeditionPage } from "./features/recovery-dashboard/pages/ExpeditionPage.js";
import { AccountPage } from "./features/recovery-dashboard/pages/AccountPage.js";
import { FeedbackPage } from "./features/recovery-dashboard/pages/FeedbackPage.js";
import { SupportPage } from "./features/recovery-dashboard/pages/SupportPage.js";
import { ProtectedLayout } from "./components/ProtectedLayout.js";
import { useAuth } from "./features/auth/index.js";
import { rootRouteView } from "./features/auth/lib/root-route-view.js";
import { DocumentSeo } from "./seo/DocumentSeo.js";
import { RegistrationModeProvider } from "./features/auth/context/RegistrationModeContext.js";
import {
  CookiesPage,
  LegalNoticePage,
  PrivacyPage,
  TermsPage,
} from "./features/legal/LegalDocumentPage.js";

/**
 * Public `/` (PERF-01B): paint the landing while AuthProvider restores the
 * session. Do not wait on `/auth/refresh` for anonymous first content.
 * Protected routes keep the shared boot screen while auth is checking.
 */
function RootRoute() {
  const { user, loading, sessionNotice } = useAuth();

  if (rootRouteView({ loading, user, sessionNotice }) === "login-gate") {
    // Authenticated users resolve onboarding via LoginPage (pending invite vs /app).
    return <Navigate to="/login" replace />;
  }

  return <LandingV2Page />;
}

/** Shared Soma 2.0 page tree — same elements under `/app` and `/preview`. */
const soma2Pages = (
  <>
    <Route index element={<PreviewHome />} />
    <Route path="recovery" element={<RecoveryPage />} />
    <Route path="explore" element={<ExplorePage />} />
    <Route path="missions" element={<MissionsPage />} />
    <Route path="expedition" element={<ExpeditionPage />} />
    <Route path="anatomy" element={<AnatomyExplorerPage />} />
    <Route path="achievements" element={<Soma2AchievementsPage />} />
    <Route path="journal" element={<JournalPage />} />
    <Route path="support" element={<SupportPage />} />
    <Route path="feedback" element={<FeedbackPage />} />
    <Route path="account" element={<AccountPage />} />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <RegistrationModeProvider>
      <DocumentSeo />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/landing-2" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/legal" element={<LegalNoticePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/preview">
          <Route element={<PreviewShell base="/preview" />}>
            {soma2Pages}
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Authenticated routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/app">
            <Route element={<PreviewShell base="/app" />}>
              {soma2Pages}
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/app-legacy" element={<Navigate to="/app" replace />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          {/* Compatible entry: Soma 1.0 URL, same auth gate, Logros 2.0 destination. */}
          <Route
            path="/achievements"
            element={<Navigate to="/app/achievements" replace />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </RegistrationModeProvider>
    </BrowserRouter>
  );
}

export default App;
