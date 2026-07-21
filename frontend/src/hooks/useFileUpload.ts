"use client";

import { useMutation } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/utils/api-url";

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/upload/profile-photo`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
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

      const response = await fetch(`${API_BASE_URL}/upload/gallery`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      return data.urls as string[];
    },
  });
}
