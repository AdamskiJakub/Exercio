import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { ApiAvailabilitySlot } from "@/types/availability";

/**
 * Fetch the logged-in instructor's weekly availability schedule.
 * Returns an array of configured availability slots (empty if none configured).
 */
export function useMyWeeklyAvailability(options?: { enabled?: boolean }) {
  return useQuery<ApiAvailabilitySlot[]>({
    queryKey: ["myWeeklyAvailability"],
    queryFn: async () => {
      const response = await apiClient.get("/availability/weekly");
      return response.data;
    },
    enabled: options?.enabled ?? true,
  });
}
