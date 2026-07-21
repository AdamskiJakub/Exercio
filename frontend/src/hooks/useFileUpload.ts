"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils/api-url";

/**
 * Upload a file using native fetch with application/octet-stream body.
 *
 * WHY NOT FORMDATA:
 * On Android, fetch() with FormData (multipart/form-data) triggers a CORS
 * preflight (OPTIONS) which can fail on some mobile browsers. By sending the
 * file as raw binary (application/octet-stream) with filename in a header,
 * the request becomes a "simple" CORS request (no preflight needed).
 *
 * The backend Multer config is bypassed - instead we read the raw body and
 * reconstruct the file manually in UploadService.
 */
async function uploadWithFetch(url: string, file: File): Promise<any> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
      },
      body: file, // Send raw File as body (no FormData wrapper)
      credentials: "include",
    });
  } catch (networkError) {
    const msg =
      networkError instanceof TypeError
        ? `[DEBUG] NetworkError: ${networkError.message}`
        : `[DEBUG] ${String(networkError)}`;
    throw new Error(msg);
  }

  if (!response.ok) {
    let bodyText = "";
    try {
      bodyText = await response.text();
    } catch {
      bodyText = "(could not read body)";
    }
    throw new Error(
      `[DEBUG] HTTP ${response.status}: ${bodyText.slice(0, 200)}`,
    );
  }

  return response.json();
}

/**
 * Upload multiple files by sending them one by one.
 * Gallery endpoint accepts multiple files, but we send individually
 * to avoid multipart/form-data preflight on mobile.
 */
async function uploadMultipleWithFetch(
  url: string,
  files: File[],
): Promise<any> {
  // Send first file to get the array response
  const firstResult = await uploadWithFetch(url, files[0]);
  const urls = firstResult.urls
    ? [...firstResult.urls]
    : firstResult.url
      ? [firstResult.url]
      : [];

  // Send remaining files
  for (let i = 1; i < files.length; i++) {
    const result = await uploadWithFetch(url, files[i]);
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
      const data = await uploadWithFetch("/upload/raw/profile-photo", file);
      return data.url as string;
    },
  });
}

export function useUploadGalleryPhotos() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const data = await uploadMultipleWithFetch("/upload/raw/gallery", files);
      return data.urls as string[];
    },
  });
}
