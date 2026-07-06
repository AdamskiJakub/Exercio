"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { EnterpriseInstructorWithProfile } from "@/types/enterprise";

export function useEnterpriseInstructors(enterpriseId: string) {
  return useQuery({
    queryKey: ["enterprise-instructors", enterpriseId],
    queryFn: async () => {
      const { data } = await apiClient.get<EnterpriseInstructorWithProfile[]>(
        `/enterprise/${enterpriseId}/instructors`,
      );
      return data;
    },
    enabled: !!enterpriseId,
  });
}

export function useSearchInstructors(
  enterpriseId: string,
  query: string,
  city?: string,
) {
  return useQuery({
    queryKey: ["search-instructors", enterpriseId, query, city],
    queryFn: async () => {
      const { data } = await apiClient.get(
        `/enterprise/${enterpriseId}/search-instructors`,
        { params: { q: query, city } },
      );
      return data;
    },
    enabled: !!enterpriseId && query.length >= 2,
  });
}

export function useRemoveInstructor(enterpriseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructorId: string) => {
      await apiClient.delete(
        `/enterprise/${enterpriseId}/instructors/${instructorId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-instructors", enterpriseId],
      });
    },
  });
}
