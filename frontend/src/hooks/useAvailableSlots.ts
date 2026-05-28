import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { AvailableSlot } from '@/types/booking';

export function useAvailableSlots(instructorId: string, startDate: string, endDate: string) {
  return useQuery<AvailableSlot[]>({
    queryKey: ['availableSlots', instructorId, startDate, endDate],
    queryFn: async () => {
      const response = await apiClient.get(`/bookings/available-slots?instructorId=${instructorId}&startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    },
    enabled: !!instructorId, // Only fetch when instructorId is available
    // Refetch every 60 seconds so past slots disappear shortly after time passes
    refetchInterval: 60 * 1000,
  });
}
