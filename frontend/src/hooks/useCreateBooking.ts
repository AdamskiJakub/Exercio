import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from 'next-intl';

interface CreateBookingDto {
  instructorId: string;
  startTime: string; // ISO string
  timezoneOffset?: number;
  // Optional guest data for non-authenticated users
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

interface CreateBookingResponse {
  id: string;
  instructorId: string;
  clientId: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      const payload = {
        ...data,
        timezoneOffset: data.timezoneOffset ?? new Date().getTimezoneOffset(),
      };
      const response = await apiClient.post<CreateBookingResponse>(
        '/bookings',
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      
      toast.success(t('bookingSuccess') || 'Rezerwacja została wysłana!', {
        description: t('bookingSuccessDescription') || 'Instruktor otrzymał powiadomienie. Oczekuj na potwierdzenie.',
      });

      if (isAuthenticated) {
        router.push('/dashboard');
      }
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data?.message || '';
      
      let errorMessage = backendMessage;
      if (backendMessage.includes('already booked')) {
        errorMessage = t('slotAlreadyBooked');
      } else if (backendMessage) {
        errorMessage = backendMessage;
      } else {
        errorMessage = t('bookingFailed');
      }
      
      toast.error(t('bookingError'), {
        description: errorMessage,
      });
    },
  });
}