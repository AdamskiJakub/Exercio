/**
 * Media utilities for handling image and video URLs
 */

import { API_BASE_URL, IS_DEVELOPMENT } from './api-url';

export { IS_DEVELOPMENT };

/**
 * Convert relative upload paths to full URLs
 * @param url - The URL to convert (can be relative like /uploads/... or absolute)
 * @returns Full URL or undefined if no URL provided
 */
export function getMediaUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  
  // Already a full URL or blob URL
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Normalize slashes to prevent double slashes or missing slashes
  const normalizedBaseUrl = API_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const normalizedPath = url.startsWith('/') ? url : `/${url}`; // Ensure leading slash
  
  // Relative path - prepend normalized API base URL
  return `${normalizedBaseUrl}${normalizedPath}`;
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
    pathname = url.split('#')[0].split('?')[0];
  }
  
  const normalizedPath = pathname.toLowerCase();
  // Only mp4 and webm are supported by backend
  return normalizedPath.endsWith('.mp4') || normalizedPath.endsWith('.webm');
}
