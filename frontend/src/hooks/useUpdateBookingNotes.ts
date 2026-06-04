'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface UpdateNotesParams {
  bookingId: string;
  notes: string;
}

export function useUpdateBookingNotes() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async ({ bookingId, notes }: UpdateNotesParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/notes`, {
        notes,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('notesUpdated') || 'Notes updated successfully');
      // Invalidate queries to refresh calendar and booking lists
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('notesUpdateError') || 'Failed to update notes');
    },
  });
}
