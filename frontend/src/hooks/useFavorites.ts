"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { FavoriteInstructor } from "@/types";

export function useMyFavorites() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["favorites", "my"],
    queryFn: async () => {
      const res = await apiClient.get<FavoriteInstructor[]>("/favorites/my");
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useIsFavorited(instructorProfileId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["favorites", "check", instructorProfileId],
    queryFn: async () => {
      const res = await apiClient.get<{ isFavorited: boolean }>(
        `/favorites/check/${instructorProfileId}`,
      );
      return res.data.isFavorited;
    },
    enabled: isAuthenticated && !!instructorProfileId,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instructorProfileId,
      isFavorited,
    }: {
      instructorProfileId: string;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        await apiClient.delete(`/favorites/${instructorProfileId}`);
      } else {
        await apiClient.post(`/favorites/${instructorProfileId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
