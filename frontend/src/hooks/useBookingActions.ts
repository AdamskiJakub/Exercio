import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface ConfirmBookingParams {
  bookingId: string;
}

interface RejectBookingParams {
  bookingId: string;
  reason: string;
}

interface CompleteBookingParams {
  bookingId: string;
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async ({ bookingId }: ConfirmBookingParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/confirm`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(t('bookingConfirmed') || 'Booking confirmed successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm booking');
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async ({ bookingId, reason }: RejectBookingParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, {
        cancelledBy: 'instructor',
        cancellationReason: reason,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(t('bookingRejected') || 'Booking rejected');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async ({ bookingId }: CompleteBookingParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(t('bookingCompleted') || 'Booking marked as completed');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to complete booking');
    },
  });
}
