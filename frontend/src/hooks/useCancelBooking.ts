'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CancelBookingParams {
  bookingId: string;
  cancelledBy: 'client' | 'instructor';
  cancellationReason?: string;
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async ({ bookingId, cancelledBy, cancellationReason }: CancelBookingParams) => {
      const lang = document.documentElement.lang || 'pl';
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, {
        cancelledBy,
        cancellationReason,
        language: lang
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('bookingCancelled') || 'Booking cancelled successfully');
      // Invalidate queries to refresh calendar and booking lists
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message;
      // Use backend error message if available, otherwise use translation
      toast.error(message || t('cancelError'));
    },
  });
}
