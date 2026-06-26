import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";

interface ConfirmBookingParams {
  bookingId: string;
}

interface RejectBookingParams {
  bookingId: string;
  reason: string;
}

interface CompleteBookingParams {
  bookingId: string;
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations("Booking");
  const locale = useLocale();

  return useMutation({
    mutationFn: async ({ bookingId }: ConfirmBookingParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/confirm`, {
        language: locale,
      });
      return response.data;
    },
    onSuccess: () => {
      // invalidate general bookings and instructor-specific lists and available slots
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "my", "instructor"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast.success(t("bookingConfirmed") || "Booking confirmed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm booking");
    },
  });
}

export function useRejectBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations("Booking");
  const locale = useLocale();

  return useMutation({
    mutationFn: async ({ bookingId, reason }: RejectBookingParams) => {
      const response = await apiClient.patch(`/bookings/${bookingId}/cancel`, {
        cancelledBy: "instructor",
        cancellationReason: reason,
        language: locale,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "my", "instructor"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      toast.success(t("bookingRejected") || "Booking rejected");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to reject booking");
    },
  });
}

export function useAcceptManualBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations("Booking");
  const locale = useLocale();

  return useMutation({
    mutationFn: async ({ bookingId }: ConfirmBookingParams) => {
      const response = await apiClient.patch(
        `/bookings/${bookingId}/accept-manual`,
        { language: locale },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "my", "client"],
      });
      toast.success(t("bookingAccepted") || "Booking accepted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept booking");
    },
  });
}

export function useCompleteBooking() {
  const queryClient = useQueryClient();
  const t = useTranslations("Booking");
  const locale = useLocale();

  return useMutation({
    mutationFn: async ({ bookingId }: CompleteBookingParams) => {
      const response = await apiClient.patch(
        `/bookings/${bookingId}/complete`,
        {
          language: locale,
        },
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({
        queryKey: ["bookings", "my", "instructor"],
      });
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
      queryClient.invalidateQueries({ queryKey: ["reviews", "pending"] });
      toast.success(t("bookingCompleted") || "Booking marked as completed");
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to complete booking",
      );
    },
  });
}
