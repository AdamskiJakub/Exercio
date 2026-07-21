"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/utils/api-url";

/**
 * Upload a single file using a bare axios instance (no CSRF interceptors).
 *
 * WHY BARE AXIOS (not apiClient):
 * The apiClient has a CSRF interceptor that adds X-CSRF-Token header for
 * state-changing requests without Authorization header. This custom header
 * triggers a CORS preflight (OPTIONS) which fails on mobile networks.
 *
 * WHY FORMDATA:
 * multipart/form-data is one of the three "simple" CORS content types
 * (along with application/x-www-form-urlencoded and text/plain) that do
 * NOT trigger a CORS preflight (OPTIONS) request. This is critical for
 * mobile browsers where preflight requests often fail due to carrier
 * proxies, firewalls, or network configurations.
 *
 * NO CUSTOM HEADERS:
 * Custom headers like X-File-Name or X-CSRF-Token trigger CORS preflight.
 * The file name is already embedded in the multipart body by the browser.
 *
 * @param fieldName - The form field name expected by the Multer interceptor:
 *   - "file" for profile-photo (FileInterceptor('file'))
 *   - "files" for gallery (FilesInterceptor('files'))
 */

// Bare axios instance - no interceptors, no CSRF, just withCredentials for JWT cookie
const uploadClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

async function uploadWithAxios(
  url: string,
  file: File,
  fieldName = "file",
): Promise<any> {
  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const response = await uploadClient.post(url, formData);
    return response.data;
  } catch (error: any) {
    // Network error (no response from server)
    if (!error.response) {
      throw new Error("NETWORK_ERROR");
    }

    // Server responded with error status
    const status = error.response.status;
    let bodyText = "";
    try {
      bodyText = JSON.stringify(error.response.data);
    } catch {
      bodyText = "(could not read body)";
    }
    throw new Error(`HTTP_${status}: ${bodyText.slice(0, 200)}`);
  }
}

/**
 * Upload multiple files by sending them one by one.
 * Gallery endpoint uses FilesInterceptor('files') so we send with fieldName="files".
 */
async function uploadMultipleWithAxios(
  url: string,
  files: File[],
): Promise<any> {
  // Send first file to get the array response
  const firstResult = await uploadWithAxios(url, files[0], "files");
  const urls = firstResult.urls
    ? [...firstResult.urls]
    : firstResult.url
      ? [firstResult.url]
      : [];

  // Send remaining files
  for (let i = 1; i < files.length; i++) {
    const result = await uploadWithAxios(url, files[i], "files");
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
      const data = await uploadWithAxios("/upload/profile-photo", file);
      return data.url as string;
    },
  });
}

export function useUploadGalleryPhotos() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const data = await uploadMultipleWithAxios("/upload/gallery", files);
      return data.urls as string[];
    },
  });
}
