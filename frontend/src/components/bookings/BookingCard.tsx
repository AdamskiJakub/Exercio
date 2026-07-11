"use client";

import { User, Calendar, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_CONFIG } from "./booking-status";
import { InstructorBookingActions } from "./InstructorBookingActions";
import { ClientBookingActions } from "./ClientBookingActions";
import type { Booking } from "@/hooks/useMyBookings";

interface BookingCardProps {
  booking: Booking;
  role: "client" | "instructor";
  onConfirm: (bookingId: string) => void;
  onReject: (booking: Booking) => void;
  onCompleteClick: (booking: Booking) => void;
  onCancelClick: (booking: Booking) => void;
  onAcceptManual?: (bookingId: string) => void;
  isConfirmPending: boolean;
  isCompletePending: boolean;
  isCancelPending: boolean;
  isAcceptPending: boolean;
}

export function BookingCard({
  booking,
  role,
  onConfirm,
  onReject,
  onCompleteClick,
  onCancelClick,
  onAcceptManual,
  isConfirmPending,
  isCompletePending,
  isCancelPending,
  isAcceptPending,
}: BookingCardProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;

  const otherPerson =
    role === "client"
      ? booking.instructorUser
      : booking.client || {
          firstName: booking.guestName,
          lastName: "",
          email: booking.guestEmail,
        };

  const displayName = otherPerson.firstName
    ? `${otherPerson.firstName} ${otherPerson.lastName || ""}`.trim()
    : otherPerson.email;

  const canConfirm = role === "instructor" && booking.status === "PENDING";
  const canComplete = role === "instructor" && booking.status === "CONFIRMED";
  const showStatusBadge = !(
    role === "instructor" &&
    (canConfirm || canComplete)
  );
  const statusConfig = BOOKING_STATUS_CONFIG[booking.status];

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      <div className="flex sm:flex-row flex-col sm:items-start gap-4">
        <div className="flex-1 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">{displayName}</span>
            {!booking.client && (
              <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                {t("guest")}
              </span>
            )}
          </div>

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>
                {format(new Date(booking.startTime), "EEEE, d MMMM yyyy", {
                  locale: dateLocale,
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(booking.startTime), "HH:mm")} -{" "}
                {format(new Date(booking.endTime), "HH:mm")}
              </span>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="mt-2">
              <p className="text-xs text-slate-500 mb-1">{t("notes")}:</p>
              <p className="text-sm text-slate-300 line-clamp-2">
                {booking.notes}
              </p>
            </div>
          )}

          {/* Cancellation Info */}
          {booking.status === "CANCELLED" && booking.cancellationReason && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
              <span className="font-medium">{t("cancellationReason")}: </span>
              {booking.cancellationReason}
            </div>
          )}
        </div>

        {/* Status & Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Status Badge */}
          {showStatusBadge && (
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap w-full justify-center",
                statusConfig.colorClass,
              )}
            >
              {statusConfig.icon}
              {t(booking.status.toLowerCase())}
            </div>
          )}

          {/* Instructor Actions */}
          {role === "instructor" && (
            <InstructorBookingActions
              booking={booking}
              onConfirm={onConfirm}
              onReject={onReject}
              onCompleteClick={onCompleteClick}
              isConfirmPending={isConfirmPending}
              isCompletePending={isCompletePending}
            />
          )}

          {/* Client Actions */}
          {role === "client" && (
            <ClientBookingActions
              booking={booking}
              onCancelClick={onCancelClick}
              onAcceptManual={onAcceptManual}
              isCancelPending={isCancelPending}
              isAcceptPending={isAcceptPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
