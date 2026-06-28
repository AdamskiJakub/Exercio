"use client";

import { Check, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import type { Booking } from "@/hooks/useMyBookings";

interface ClientBookingActionsProps {
  booking: Booking;
  onCancelClick: (booking: Booking) => void;
  onAcceptManual?: (bookingId: string) => void;
  isCancelPending: boolean;
  isAcceptPending: boolean;
}

export function ClientBookingActions({
  booking,
  onCancelClick,
  onAcceptManual,
  isCancelPending,
  isAcceptPending,
}: ClientBookingActionsProps) {
  const t = useTranslations("Booking");

  // Client's own PENDING booking: only show Cancel
  if (booking.status === "PENDING") {
    return (
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onCancelClick(booking)}
        disabled={isCancelPending}
        className="h-8 px-3 md:w-full"
      >
        <XCircle className="w-4 h-4 mr-1" />
        {t("cancelSession")}
      </Button>
    );
  }

  // Manual booking (instructor-created, CONFIRMED): client can Accept or Reject
  if (booking.status === "CONFIRMED" && booking.isManualBooking) {
    return (
      <>
        <Button
          size="sm"
          onClick={() => onAcceptManual?.(booking.id)}
          disabled={isAcceptPending}
          className="bg-green-500 md:w-full hover:bg-green-600 text-white h-8 px-3"
        >
          <Check className="w-4 h-4 mr-1" />
          {t("acceptBooking")}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onCancelClick(booking)}
          disabled={isCancelPending}
          className="h-8 px-3 md:w-full"
        >
          <XCircle className="w-4 h-4 mr-1" />
          {t("rejectBooking")}
        </Button>
      </>
    );
  }

  // Regular CONFIRMED booking (client-initiated, instructor confirmed): only Cancel
  if (booking.status === "CONFIRMED" && !booking.isManualBooking) {
    return (
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onCancelClick(booking)}
        disabled={isCancelPending}
        className="h-8 px-3 md:w-full"
      >
        <XCircle className="w-4 h-4 mr-1" />
        {t("cancelSession")}
      </Button>
    );
  }

  return null;
}
