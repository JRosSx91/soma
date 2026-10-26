import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth/index.ts";
import { AchievementSyncProvider } from "./features/achievements/index.ts";
import "./i18n/config.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AchievementSyncProvider>
        <App />
      </AchievementSyncProvider>
    </AuthProvider>
  </StrictMode>,
);
