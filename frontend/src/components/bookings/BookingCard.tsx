"use client";

import { Calendar, Clock, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_CONFIG } from "./booking-status";
import { InstructorBookingActions } from "./InstructorBookingActions";
import { ClientBookingActions } from "./ClientBookingActions";
import { getMediaUrl } from "@/lib/utils/media";
import Link from "next/link";
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

  const isClientView = role === "client";
  const instructor = booking.instructorUser;
  const instructorProfile = instructor?.instructorProfile;
  const primarySpecialization = instructorProfile?.specializations?.[0];

  const otherPerson = isClientView
    ? instructor
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

  const instructorLink = instructor?.username
    ? (`/instructors/${instructor.username}` as const)
    : null;

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors">
      {/* Instructor header (client view) - clickable */}
      {isClientView && instructorLink ? (
        <Link
          href={instructorLink}
          className="flex items-center gap-3 mb-3 rounded-lg hover:bg-slate-700/50 -mx-1 px-1 py-1 transition-colors duration-200 group"
        >
          <div className="size-12 rounded-full overflow-hidden bg-slate-700 shrink-0">
            {instructorProfile?.photoUrl ? (
              <img
                src={getMediaUrl(instructorProfile.photoUrl)}
                alt={displayName ?? ""}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center text-slate-400 text-lg font-semibold">
                {(displayName ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-white font-semibold truncate group-hover:text-orange-400 transition-colors">
                  {displayName}
                </span>
              </div>
              {primarySpecialization && (
                <p className="text-sm text-slate-400 truncate">
                  {primarySpecialization}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end shrink-0">
              {instructorProfile?.sessionPrice != null && (
                <span className="text-sm text-orange-400 font-medium whitespace-nowrap">
                  {instructorProfile.sessionPrice} zł
                </span>
              )}
              {instructorProfile?.sessionDuration && (
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {instructorProfile.sessionDuration} min
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-orange-400 transition-colors" />
            </div>
          </div>
        </Link>
      ) : (
        /* Simple name (instructor view - client name) - not clickable */
        <div className="flex items-center gap-2 mb-3">
          <div className="size-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-sm font-semibold shrink-0">
            {(displayName ?? "?").charAt(0).toUpperCase()}
          </div>
          <span className="text-white font-medium truncate">{displayName}</span>
          {!booking.client && (
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded shrink-0">
              {t("guest")}
            </span>
          )}
        </div>
      )}

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
          <p className="text-sm text-slate-300 line-clamp-2">{booking.notes}</p>
        </div>
      )}

      {/* Cancellation Info */}
      {booking.status === "CANCELLED" && booking.cancellationReason && (
        <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
          <span className="font-medium">{t("cancellationReason")}: </span>
          {booking.cancellationReason}
        </div>
      )}

      {/* Status & Actions */}
      <div className="flex flex-col items-end gap-2 mt-3">
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
  );
}
