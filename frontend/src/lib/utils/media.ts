/**
 * Media utilities for handling image and video URLs
 */

import { API_BASE_URL, IS_DEVELOPMENT } from "./api-url";

export { IS_DEVELOPMENT };

/**
 * Convert relative upload paths to full URLs
 * @param url - The URL to convert (can be relative like /uploads/... or absolute)
 * @returns Full URL or undefined if no URL provided
 */
export function getMediaUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;

  // Already a full URL or blob URL
  if (
    url.startsWith("blob:") ||
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // Normalize slashes to prevent double slashes or missing slashes
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, ""); // Remove trailing slashes
  const normalizedPath = url.startsWith("/") ? url : `/${url}`; // Ensure leading slash

  // Relative path - prepend normalized API base URL
  return `${normalizedBaseUrl}${normalizedPath}`;
}

/**
 * Normalize a website URL for use in an <a href>.
 * Prepends "https://" when the protocol is missing, so values like
 * "www.example.com" don't get treated as relative URLs by the browser.
 * @param url - The URL to normalize (e.g. "www.example.com" or "https://example.com")
 * @returns A URL safe to use in an href, or undefined if no URL provided
 */
const SAFE_URL_PROTOCOLS = /^(https?|mailto|tel):/i;

export function normalizeWebsiteUrl(
  url: string | null | undefined,
): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  // Protocol-relative URLs (e.g. "//example.com") inherit http/https and are safe.
  // Normalize to an explicit https:// scheme to avoid "https:////example.com".
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  // If it already has a protocol, only allow safe ones (http, https, mailto, tel).
  // Reject dangerous schemes like javascript:, data:, vbscript: to avoid XSS.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return SAFE_URL_PROTOCOLS.test(trimmed) ? trimmed : undefined;
  }
  return `https://${trimmed}`;
}

/**
 * Check if a file is a video based on URL
 * Strips query strings and fragments, normalizes case
 */
export function isVideoUrl(url: string): boolean {
  let pathname = url;
  try {
    // Try parsing as full URL
    pathname = new URL(url, API_BASE_URL).pathname;
  } catch {
    // Fallback: strip query string and fragment manually
    pathname = url.split("#")[0].split("?")[0];
  }

  const normalizedPath = pathname.toLowerCase();
  // Only mp4 and webm are supported by backend
  return normalizedPath.endsWith(".mp4") || normalizedPath.endsWith(".webm");
}
