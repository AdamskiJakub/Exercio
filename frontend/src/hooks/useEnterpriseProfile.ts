"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { EnterpriseProfile } from "@/types/enterprise";

export function useEnterpriseProfile(slug: string) {
  return useQuery({
    queryKey: ["enterprise-profile", slug],
    queryFn: async () => {
      const { data } = await apiClient.get<EnterpriseProfile>(
        `/enterprise/${slug}`,
      );
      return data;
    },
    enabled: !!slug,
  });
}

export function useMyEnterpriseProfile() {
  return useQuery({
    queryKey: ["my-enterprise-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<EnterpriseProfile>("/enterprise/me");
      return data;
    },
  });
}

export function useEnterpriseRating(enterpriseId: string) {
  return useQuery({
    queryKey: ["enterprise-rating", enterpriseId],
    queryFn: async () => {
      const { data } = await apiClient.get<{
        average: number;
        total: number;
      } | null>(`/enterprise/${enterpriseId}/rating`);
      return data;
    },
    enabled: !!enterpriseId,
  });
}
