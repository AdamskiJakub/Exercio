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
