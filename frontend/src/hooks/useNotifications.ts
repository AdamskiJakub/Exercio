import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import type { PaginatedNotifications } from "@/types";

export function useMyNotifications(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["notifications", "my", page, limit],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedNotifications>(
        `/notifications?page=${page}&limit=${limit}`,
      );
      return response.data;
    },
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>(
        "/notifications/unread-count",
      );
      return response.data.count;
    },
    refetchInterval: 30_000, // Poll every 30s
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
