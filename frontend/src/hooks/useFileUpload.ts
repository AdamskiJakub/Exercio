"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils/api-url";
import { getCsrfToken, fetchCsrfToken } from "@/lib/api";

/**
 * Upload a single file using FormData (multipart/form-data).
 *
 * WHY FORMDATA:
 * multipart/form-data is one of the three "simple" CORS content types
 * (along with application/x-www-form-urlencoded and text/plain) that do
 * NOT trigger a CORS preflight (OPTIONS) request. This is critical for
 * mobile browsers where preflight requests often fail due to carrier
 * proxies, firewalls, or network configurations.
 *
 * Previously we sent raw binary with a custom Content-Type (e.g. image/jpeg),
 * which IS NOT a simple content type and always triggers a preflight.
 *
 * The backend uses Multer's FileInterceptor/FilesInterceptor which handles
 * multipart/form-data natively via the standard /upload/profile-photo and
 * /upload/gallery endpoints.
 *
 * @param fieldName - The form field name expected by the Multer interceptor:
 *   - "file" for profile-photo (FileInterceptor('file'))
 *   - "files" for gallery (FilesInterceptor('files'))
 */
async function uploadWithFetch(
  url: string,
  file: File,
  fieldName = "file",
): Promise<any> {
  let response: Response;

  // Build headers - include CSRF token if available (for session-based auth)
  const headers: Record<string, string> = {
    "X-File-Name": encodeURIComponent(file.name),
  };

  // If user is authenticated via JWT cookie, CSRF is skipped on backend.
  // But include the token anyway as a safety net for edge cases.
  let csrfToken = getCsrfToken();
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  // Use FormData to send the file as multipart/form-data.
  // This is a "simple" CORS content type and does NOT trigger a preflight.
  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
  } catch (networkError) {
    // "Failed to fetch" / TypeError is thrown for network-level failures:
    //   - CORS preflight failure
    //   - Network offline / timeout
    //   - DNS resolution failure
    //   - SSL/TLS handshake error (e.g. invalid cert on mobile)
    //   - Connection refused / reset
    //
    // The browser hides the exact reason from JavaScript for security.
    // We include a code prefix so the UI can detect the error type.
    throw new Error("NETWORK_ERROR");
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "(could not read body)";
    }
    throw new Error(`HTTP_${response.status}: ${bodyText.slice(0, 200)}`);
  }

  return response.json();
}

/**
 * Upload multiple files by sending them one by one.
 * Gallery endpoint uses FilesInterceptor('files') so we send with fieldName="files".
 */
async function uploadMultipleWithFetch(
  url: string,
  files: File[],
): Promise<any> {
  // Send first file to get the array response
  const firstResult = await uploadWithFetch(url, files[0], "files");
  const urls = firstResult.urls
    ? [...firstResult.urls]
    : firstResult.url
      ? [firstResult.url]
      : [];

  // Send remaining files
  for (let i = 1; i < files.length; i++) {
    const result = await uploadWithFetch(url, files[i], "files");
    if (result.urls) {
      urls.push(...result.urls);
    } else if (result.url) {
      urls.push(result.url);
    }
  }

  return { urls };
}

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const data = await uploadWithFetch("/upload/profile-photo", file);
      return data.url as string;
    },
  });
}

export function useUploadGalleryPhotos() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const data = await uploadMultipleWithFetch("/upload/gallery", files);
      return data.urls as string[];
    },
  });
}
