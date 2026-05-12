'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      const response = await apiClient.patch('/users/me/password', data);
      return response.data;
    },
  });
}
