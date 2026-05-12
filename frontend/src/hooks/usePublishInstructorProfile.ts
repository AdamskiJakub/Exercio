'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface UsePublishInstructorProfileOptions {
  showToast?: boolean;
}

export function usePublishInstructorProfile(options: UsePublishInstructorProfileOptions = { showToast: true }) {
  const queryClient = useQueryClient();
  const t = useTranslations('Dashboard.profileForm');

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await apiClient.patch(`/instructor-profiles/${profileId}/publish`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      if (options.showToast) {
        toast.success(t('profilePublished'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('profilePublishFailed');
      if (options.showToast) {
        toast.error(message);
      }
    },
  });
}
