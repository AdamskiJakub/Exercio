import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useClearHistory() {
  const queryClient = useQueryClient();
  const t = useTranslations("Booking");

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete("/bookings/history");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(t("historyCleared") || "History cleared");
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message;
      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error(t("clearHistoryError") || "Failed to clear history");
      }
    },
  });
}
