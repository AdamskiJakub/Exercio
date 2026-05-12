/**
 * Shared API URL resolution utility
 * Ensures consistent behavior across the application
 */

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

/**
 * Resolve the API base URL with consistent fallback behavior
 * - In development: Falls back to localhost:3001
 * - In production: Throws error if NEXT_PUBLIC_API_URL is missing
 */
export function resolveApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  if (IS_DEVELOPMENT) {
    return 'http://localhost:3001';
  }
  
  throw new Error('NEXT_PUBLIC_API_URL is required in production');
}

export const API_BASE_URL = resolveApiBaseUrl();
