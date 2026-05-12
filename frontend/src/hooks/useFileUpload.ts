'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export function useUploadProfilePhoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Let browser set Content-Type with boundary automatically
      const response = await apiClient.post('/upload/profile-photo', formData);
      
      return response.data.url as string;
    },
    // Note: onError removed - let callers handle errors to avoid duplicate toasts
  });
}

export function useUploadGalleryPhotos() {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      
      // Let browser set Content-Type with boundary automatically
      const response = await apiClient.post('/upload/gallery', formData);
      
      return response.data.urls as string[];
    },
    // Note: onError removed - let callers handle errors to avoid duplicate toasts
  });
}
