"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { normalizeApiError } from "@/lib/utils/error-handlers";

export function useBecomeInstructor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const { setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  const onSubmit = async (phone: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post("/users/become-instructor", {
        phone,
      });

      // Update auth store with new role
      setAuth(response.data.user);

      // Clear stale queries (e.g. instructor-profile/me will now return data)
      queryClient.clear();

      // Redirect to profile edit (onboarding)
      router.push("/dashboard/profile/edit");
    } catch (err: any) {
      setError(normalizeApiError(err, "Failed to become instructor"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    onSubmit,
  };
}
