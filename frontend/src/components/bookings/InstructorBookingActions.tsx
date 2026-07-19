"use client";

import { Check, X, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { PortalTooltip } from "@/components/ui/portal-tooltip";
import { cn } from "@/lib/utils";
import type { Booking } from "@/hooks/useMyBookings";

interface InstructorBookingActionsProps {
  booking: Booking;
  onConfirm: (bookingId: string) => void;
  onReject: (booking: Booking) => void;
  onCompleteClick: (booking: Booking) => void;
  isConfirmPending: boolean;
  isCompletePending: boolean;
}

export function InstructorBookingActions({
  booking,
  onConfirm,
  onReject,
  onCompleteClick,
  isConfirmPending,
  isCompletePending,
}: InstructorBookingActionsProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;

  const canConfirm = booking.status === "PENDING";
  const canComplete = booking.status === "CONFIRMED";
  // [TEMP DISABLED for testing] Time-based guard for completing sessions
  // const devBypass = process.env.NEXT_PUBLIC_DEV_BYPASS_SESSION_TIME === "true";
  // const isBeforeEndTime =
  //   canComplete &&
  //   booking.endTime &&
  //   new Date() < new Date(booking.endTime) &&
  //   !devBypass;

  if (!canConfirm && !canComplete) return null;

  return (
    <div className="flex flex-col gap-2 w-full">
      {canConfirm && (
        <>
          <Button
            size="sm"
            onClick={() => onConfirm(booking.id)}
            disabled={isConfirmPending}
            className="bg-green-500 hover:bg-green-600 text-white h-8 px-3 w-full"
          >
            <Check className="w-4 h-4 mr-1" />
            {t("acceptBooking")}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onReject(booking)}
            disabled={isConfirmPending}
            className="h-8 px-3 w-full"
          >
            <X className="w-4 h-4 mr-1" />
            {t("rejectBooking")}
          </Button>
        </>
      )}
      {canComplete && (
        <div className="relative">
          <Button
            size="sm"
            onClick={() => onCompleteClick(booking)}
            disabled={isCompletePending}
            className="h-8 px-3 w-full bg-blue-500 hover:bg-blue-600 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            {t("completeBooking")}
          </Button>
        </div>
      )}
    </div>
  );
}
