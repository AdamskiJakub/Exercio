import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { API_BASE_URL } from "./utils/api-url";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ── CSRF Token Management ────────────────────────────────────────────────────
// The backend uses Double Submit Cookie pattern for CSRF protection.
// The CSRF token is stored in a non-httpOnly cookie (x-csrf-token) set by the
// backend on api.exercio.app. Since the frontend runs on a different origin
// (dev.exercio.app / exercio.app), JavaScript cannot read the cookie via
// document.cookie (cross-origin cookie isolation).
//
// Instead, the frontend fetches the CSRF token from the response body of
// GET /auth/csrf-token and stores it in memory. This in-memory value is then
// sent back as the X-CSRF-Token header for all state-changing requests.
//
// JWT-authenticated requests (Authorization: Bearer header) are automatically
// exempt from CSRF checks on the backend, so we only need to add the header
// when no Bearer token is present (i.e., session-based auth via cookies).

let csrfTokenValue: string | null = null;

/**
 * Store the CSRF token in memory (called after fetching from /auth/csrf-token).
 */
export function setCsrfToken(token: string | null) {
  csrfTokenValue = token;
}

/**
 * Get the current in-memory CSRF token.
 */
export function getCsrfToken(): string | null {
  return csrfTokenValue;
}

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!config.headers["Content-Type"] && !isFormData) {
    config.headers["Content-Type"] = "application/json";
  }

  // Add CSRF token for state-changing requests (POST, PUT, PATCH, DELETE)
  // when no Authorization header is present (session-based auth via cookies).
  // JWT-authenticated requests are immune to CSRF and are skipped.
  if (
    config.method &&
    ["post", "put", "patch", "delete"].includes(config.method) &&
    !config.headers["Authorization"]
  ) {
    const token = getCsrfToken();
    if (token) {
      config.headers["X-CSRF-Token"] = token;
    }
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isAuthEndpoint =
        error.config?.url?.includes("/auth/login") ||
        error.config?.url?.includes("/auth/register") ||
        error.config?.url?.includes("/auth/verify-email");

      if (!isAuthEndpoint) {
        console.log(
          "[API 401] URL:",
          error.config?.url,
          "method:",
          error.config?.method,
        );
        console.log("[API 401] Current auth state:", useAuthStore.getState());

        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          setTimeout(() => {
            if (!useAuthStore.getState().isAuthenticated) {
              const segments = window.location.pathname
                .split("/")
                .filter(Boolean);
              const locale = segments[0] || "pl";
              console.log(
                "[API 401] Redirecting to login from:",
                window.location.pathname,
              );
              window.location.href = `/${locale}/login`;
            }
          }, 100);
        }
      }
    }

    // Handle CSRF errors - if we get a 403 with CSRF error code,
    // try to refresh the CSRF token by fetching a new one
    if (
      error.response?.status === 403 &&
      error.response?.data?.code === "CSRF_TOKEN_INVALID"
    ) {
      console.warn("[API 403] CSRF token invalid, attempting to refresh...");
      // The next request will automatically get a new token from the cookie
      // after the backend sets a new one on the next GET request
    }

    return Promise.reject(error);
  },
);
