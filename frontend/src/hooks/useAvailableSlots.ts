import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { AvailableSlot } from '@/types/booking';

export function useAvailableSlots(instructorId: string, startDate: string, endDate: string) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['availableSlots', instructorId, startDate, endDate],
    queryFn: async () => {
      const timezoneOffset = new Date().getTimezoneOffset();
      const response = await apiClient.get(
        `/bookings/available-slots?instructorId=${instructorId}&startDate=${startDate}&endDate=${endDate}&timezoneOffset=${timezoneOffset}`
      );
      return response.data;
    },
    enabled: !!instructorId,
    refetchInterval: 60 * 1000,
  });
}