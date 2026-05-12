'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';

interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { updateUser: updateAuthUser } = useAuthStore();

  return useMutation({
    mutationFn: async (data: UpdateUserData) => {
      const response = await apiClient.patch('/users/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      updateAuthUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      });

      queryClient.invalidateQueries({ queryKey: ['instructor-profile'] });
    },
  });
}
