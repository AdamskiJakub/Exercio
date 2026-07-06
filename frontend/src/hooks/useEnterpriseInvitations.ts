"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { CreateInvitationDto } from "@/types/enterprise";

export function useMyEnterpriseInvitations() {
  return useQuery({
    queryKey: ["my-enterprise-invitations"],
    queryFn: async () => {
      const { data } = await apiClient.get("/me/enterprise-invitations");
      return data;
    },
  });
}

export function useSendInvitation(enterpriseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateInvitationDto) => {
      const { data } = await apiClient.post(
        `/enterprise/${enterpriseId}/invitations`,
        dto,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["enterprise-instructors", enterpriseId],
      });
    },
  });
}

export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data } = await apiClient.patch(
        `/me/enterprise-invitations/${invitationId}/accept`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-enterprise-invitations"],
      });
    },
  });
}

export function useRejectInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invitationId: string) => {
      const { data } = await apiClient.patch(
        `/me/enterprise-invitations/${invitationId}/reject`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-enterprise-invitations"],
      });
    },
  });
}
