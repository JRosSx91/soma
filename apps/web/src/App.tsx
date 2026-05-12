import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { OnboardingPage } from './pages/OnboardingPage.js';
import { MainPage } from './pages/MainPage.js';
import { AchievementsPage } from './pages/AchievementsPage.js';
import { LandingPage } from './pages/LandingPage.js';
import { ProtectedLayout } from './components/ProtectedLayout.js';
import { useAuth } from './features/auth/index.js';

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

        {/* Authenticated routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/app" element={<MainPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;