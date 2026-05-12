'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface UpdateInstructorProfileData {
  bio?: string | null;
  tagline?: string | null;
  specializations?: string[];
  tags?: string[];
  goals?: string[];
  location?: string | null;
  city?: string | null;
  hourlyRate?: number | null;
  hourlyRateHidden?: boolean;
  packageDealsEnabled?: boolean;
  packageDealsDescription?: string | null;
  photoUrl?: string | null;
  gallery?: string[];
  yearsExperience?: number | null;
  availability?: string | null;
  languages?: string[];
  isDraft?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  contactMessage?: string | null;
}

interface UseUpdateInstructorProfileOptions {
  showToast?: boolean;
}

export function useUpdateInstructorProfile(options: UseUpdateInstructorProfileOptions = { showToast: false }) {
  const queryClient = useQueryClient();
  const t = useTranslations('Dashboard.profileForm');

  return useMutation({
    mutationFn: async ({ profileId, data }: { profileId: string; data: UpdateInstructorProfileData }) => {
      const response = await apiClient.patch(`/instructor-profiles/${profileId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      if (options.showToast) {
        toast.success(t('updateSuccess'));
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || t('updateError');
      if (options.showToast) {
        toast.error(message);
      }
    },
  });
}