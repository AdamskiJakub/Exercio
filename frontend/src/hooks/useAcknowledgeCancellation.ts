import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export function useAcknowledgeCancellation() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async (bookingId: string) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/acknowledge`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(t('cancellationAcknowledged') || 'Cancellation acknowledged');
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error(t('acknowledgeError') || 'Failed to acknowledge cancellation');
      }
    },
  });
}
