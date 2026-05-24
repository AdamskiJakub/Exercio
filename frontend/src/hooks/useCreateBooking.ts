import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';
import { useAuthStore } from '@/stores/auth-store';

interface CreateBookingDto {
  instructorId: string;
  startTime: string; // ISO string
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

  return useMutation({
    mutationFn: async (data: CreateBookingDto) => {
      const response = await apiClient.post<CreateBookingResponse>(
        '/bookings',
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      
      // Show success message
      toast.success('Rezerwacja została wysłana!', {
        description: 'Instruktor otrzymał powiadomienie. Oczekuj na potwierdzenie.',
      });

      // Redirect only if user is authenticated
      if (isAuthenticated) {
        router.push('/dashboard');
      }
      // For guests, stay on the page or show confirmation message
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Nie udało się utworzyć rezerwacji';
      toast.error('Błąd rezerwacji', {
        description: message,
      });
    },
  });
}
