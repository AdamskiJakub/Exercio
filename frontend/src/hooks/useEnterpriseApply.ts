"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CreateEnterpriseLeadDto } from "@/types/enterprise";

export function useEnterpriseApply() {
  return useMutation({
    mutationFn: async (dto: CreateEnterpriseLeadDto) => {
      const { data } = await apiClient.post("/enterprise/apply", dto);
      return data;
    },
  });
}
