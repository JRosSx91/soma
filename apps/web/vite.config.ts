import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Same-origin API proxy for local HTTP.
 *
 * Cross-origin SPA (5173 → 3000) cannot use SameSite=Lax refresh cookies on
 * fetch, and SameSite=None requires Secure (HTTPS). Proxying keeps the
 * browser on http://localhost:5173 so Path=/auth HttpOnly cookies work
 * without weakening CORS or AuthOriginGuard.
 *
 * Production with separate API host should set AUTH_COOKIE_SAMESITE=none,
 * AUTH_COOKIE_SECURE=true, AUTH_COOKIE_CROSS_SITE=true, and VITE_API_URL
 * to the API origin.
 */
const apiProxy = {
  "/auth": { target: "http://localhost:3000", changeOrigin: true },
  "/me": { target: "http://localhost:3000", changeOrigin: true },
  "/health": { target: "http://localhost:3000", changeOrigin: true },
  "/substances": { target: "http://localhost:3000", changeOrigin: true },
} as const;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { ...apiProxy },
  },
  preview: {
    proxy: { ...apiProxy },
  },
});
