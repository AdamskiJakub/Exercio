import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface CreateManualBookingDto {
  startTime: string; // ISO string
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string;
}

interface CreateManualBookingResponse {
  id: string;
  instructorId: string;
  startTime: string;
  endTime: string;
  status: 'CONFIRMED';
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  createdAt: string;
}

export function useCreateManualBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations('Booking');

  return useMutation({
    mutationFn: async (data: CreateManualBookingDto) => {
      const response = await apiClient.post<CreateManualBookingResponse>(
        '/bookings/manual',
        data
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings', 'my', 'instructor'] });
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
      
      // Show success message
      toast.success('Rezerwacja manualna utworzona!', {
        description: 'Booking został dodany do Twojego kalendarza.',
      });
    },
    onError: (error: any) => {
      const backendMessage = error.response?.data?.message || '';
      
      let errorMessage = backendMessage;
      if (backendMessage.includes('already booked')) {
        errorMessage = 'Ten slot jest już zajęty';
      } else if (backendMessage) {
        errorMessage = backendMessage;
      } else {
        errorMessage = 'Nie udało się utworzyć rezerwacji';
      }
      
      toast.error('Błąd tworzenia rezerwacji', {
        description: errorMessage,
      });
    },
  });
}
