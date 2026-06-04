'use client';

import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface GuestCancelParams {
  bookingId: string;
  token: string;
  cancellationReason?: string;
  language?: 'pl' | 'en';
}

export function useGuestCancelBooking() {
  return useMutation({
    mutationFn: async (params: GuestCancelParams) => {
      const response = await apiClient.post('/bookings/guest-cancel', {
        bookingId: params.bookingId,
        token: params.token,
        cancellationReason: params.cancellationReason,
        language: params.language,
      });
      return response.data;
    },
  });
}