"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils/api-url";

/**
 * Upload a file using native fetch instead of axios.
 *
 * WHY NATIVE FETCH:
 * The axios CSRF interceptor in api.ts auto-fetches a CSRF token before every
 * state-changing request that lacks an Authorization header. On mobile browsers
 * (iOS Safari, Android Chrome), this sequential CSRF fetch + the subsequent
 * multipart/form-data POST can fail with status 0 / size 0 due to:
 *   - CORS preflight issues specific to multipart/form-data on mobile
 *   - Race conditions in the axios interceptor's async CSRF token fetch
 *   - Cloudflare WAF handling multipart requests differently on mobile
 *
 * Since upload endpoints are protected by JwtAuthGuard, and the JWT is stored
 * in an httpOnly cookie (access_token), the cookie is sent automatically with
 * credentials: "include". No Authorization header or CSRF token needed.
 *
 * See: backend/src/main.ts skipCsrfProtection (line 188-193)
 */
async function uploadWithFetch(url: string, formData: FormData): Promise<any> {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  return response.json();
}

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const data = await uploadWithFetch("/upload/profile-photo", formData);
      return data.url as string;
    },
  });
}

export function useUploadGalleryPhotos() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const data = await uploadWithFetch("/upload/gallery", formData);
      return data.urls as string[];
    },
  });
}
