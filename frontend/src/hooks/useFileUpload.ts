"use client";

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE_URL } from "@/lib/utils/api-url";

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

/**
 * Extract the bare R2 filename (last path segment) from a stored URL or key.
 * e.g. "https://api.exercio.app/upload/abc123.jpg" -> "abc123.jpg"
 * If the value is already a bare filename, it is returned unchanged.
 */
export function extractUploadKey(urlOrKey: string): string {
  const trimmed = urlOrKey.trim();
  if (!trimmed) return "";
  const segments = trimmed.split("/");
  return segments[segments.length - 1] || "";
}

/**
 * Delete an uploaded file from R2 by its stored URL or key.
 * Fire-and-forget friendly: resolves even if the file was already gone.
 */
export async function deleteUploadedFile(urlOrKey: string): Promise<void> {
  const key = extractUploadKey(urlOrKey);
  if (!key) return;
  try {
    await uploadClient.delete(`/upload/${encodeURIComponent(key)}`);
  } catch (error: any) {
    // Deleting a non-existent file is not fatal - log and continue.
    console.warn(`[upload] Failed to delete file from R2: ${key}`, error);
  }
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
