"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface UsePublishEnterpriseProfileOptions {
  showToast?: boolean;
}

export function usePublishEnterpriseProfile(
  options: UsePublishEnterpriseProfileOptions = { showToast: true },
) {
  const queryClient = useQueryClient();
  const t = useTranslations("Dashboard.enterprise");

  return useMutation({
    mutationFn: async (profileId: string) => {
      const response = await apiClient.patch(
        `/enterprise/${profileId}/publish`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-enterprise-profile"] });
      if (options.showToast) {
        toast.success(t("profilePublished"));
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || t("profilePublishFailed");
      if (options.showToast) {
        toast.error(message);
      }
    },
  });
}
