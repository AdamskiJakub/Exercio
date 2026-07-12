/**
 * Shared API URL resolution utility
 * Ensures consistent behavior across the application
 */

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

/**
 * Resolve the API base URL with consistent fallback behavior
 * - In development: Falls back to localhost:3001
 * - In production: Falls back to a placeholder if NEXT_PUBLIC_API_URL is missing
 *   (actual validation happens at runtime, not during build)
 */
export function resolveApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    return apiUrl;
  }

  if (IS_DEVELOPMENT) {
    return "http://localhost:3001";
  }

  // During build time (Vercel, etc.), NEXT_PUBLIC_* might not be available
  // Return a placeholder - the actual value will be used at runtime
  return "https://api.exercio.app";
}

export const API_BASE_URL = resolveApiBaseUrl();
