"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export interface RecentlyViewedInstructor {
  id: string;
  userId: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  photoUrl: string | null;
  tagline: string | null;
  city: string | null;
  specializations: string[];
  viewedAt: string;
}

export function useRecentlyViewed() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["profile-views", "my-recent"],
    queryFn: async () => {
      const res = await apiClient.get<RecentlyViewedInstructor[]>(
        "/profile-views/my-recent",
      );
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useTrackProfileView() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instructorProfileId: string) => {
      await apiClient.post(`/profile-views/${instructorProfileId}`);
    },
    onSuccess: () => {
      // Invalidate so the dashboard picks up the new view without F5
      queryClient.invalidateQueries({
        queryKey: ["profile-views", "my-recent"],
      });
    },
  });
}
