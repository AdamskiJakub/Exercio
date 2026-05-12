'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { useRouter } from '@/i18n/routing';

export function useDeleteAccount() {
  const { logout } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete('/users/me');
      return response.data;
    },
    onSuccess: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        // Ignore logout errors - account is already deleted
      }
      logout();
      router.push('/');
    },
  });
}
