import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import type { FollowedEnterprise, FollowedInstructor } from "@/types";

// ─── Enterprise Follow (client/instructor follows a company) ───

export function useMyFollowedEnterprises() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["follow", "enterprise", "my"],
    queryFn: async () => {
      const res = await apiClient.get<FollowedEnterprise[]>(
        "/follow/enterprise/my",
      );
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useIsFollowingEnterprise(enterpriseId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["follow", "enterprise", "check", enterpriseId],
    queryFn: async () => {
      const res = await apiClient.get<{ isFollowing: boolean }>(
        `/follow/enterprise/check/${enterpriseId}`,
      );
      return res.data.isFollowing;
    },
    enabled: isAuthenticated && !!enterpriseId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useEnterpriseFollowerCount(enterpriseId: string) {
  return useQuery({
    queryKey: ["follow", "enterprise", "count", enterpriseId],
    queryFn: async () => {
      const res = await apiClient.get<{ count: number }>(
        `/follow/enterprise/${enterpriseId}/count`,
      );
      return res.data.count;
    },
    enabled: !!enterpriseId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFollowEnterprise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      enterpriseId,
      isFollowing,
    }: {
      enterpriseId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        await apiClient.delete(`/follow/enterprise/${enterpriseId}`);
      } else {
        await apiClient.post(`/follow/enterprise/${enterpriseId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", "enterprise"] });
    },
    onError: (error) => {
      console.error("[useFollow] Failed to toggle enterprise follow:", error);
    },
  });
}

// ─── Instructor Follow (enterprise follows an instructor) ───

export function useMyFollowedInstructors() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["follow", "instructor", "my"],
    queryFn: async () => {
      const res = await apiClient.get<FollowedInstructor[]>(
        "/follow/instructor/my",
      );
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useIsFollowingInstructor(instructorProfileId: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ["follow", "instructor", "check", instructorProfileId],
    queryFn: async () => {
      const res = await apiClient.get<{ isFollowing: boolean }>(
        `/follow/instructor/check/${instructorProfileId}`,
      );
      return res.data.isFollowing;
    },
    enabled: isAuthenticated && !!instructorProfileId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useInstructorFollowerCount(instructorProfileId: string) {
  return useQuery({
    queryKey: ["follow", "instructor", "count", instructorProfileId],
    queryFn: async () => {
      const res = await apiClient.get<{ count: number }>(
        `/follow/instructor/${instructorProfileId}/count`,
      );
      return res.data.count;
    },
    enabled: !!instructorProfileId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useToggleFollowInstructor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      instructorProfileId,
      isFollowing,
    }: {
      instructorProfileId: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        await apiClient.delete(`/follow/instructor/${instructorProfileId}`);
      } else {
        await apiClient.post(`/follow/instructor/${instructorProfileId}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow", "instructor"] });
    },
    onError: (error) => {
      console.error("[useFollow] Failed to toggle instructor follow:", error);
    },
  });
}
