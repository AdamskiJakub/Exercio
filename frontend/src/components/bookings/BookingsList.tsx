"use client";

import { useState } from "react";
import { Booking } from "@/hooks/useMyBookings";
import { format } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { BookingCard } from "./BookingCard";
import { RejectBookingModal } from "./RejectBookingModal";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { CancelBookingModal } from "@/components/booking/CancelBookingModal";
import {
  useConfirmBooking,
  useCompleteBooking,
  useAcceptManualBooking,
} from "@/hooks/useBookingActions";
import { useCancelBooking } from "@/hooks/useCancelBooking";

interface BookingsListProps {
  bookings: Booking[];
  role: "client" | "instructor";
}

export function BookingsList({ bookings, role }: BookingsListProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const confirmBooking = useConfirmBooking();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();
  const acceptManualBooking = useAcceptManualBooking();

  if (bookings.length === 0) {
    return null;
  }

  const handleConfirm = async (bookingId: string) => {
    await confirmBooking.mutateAsync({ bookingId });
  };

  const handleReject = (booking: Booking) => {
    setSelectedBooking(booking);
    setRejectModalOpen(true);
  };

  const handleCompleteClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCompleteModalOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (selectedBooking) {
      await completeBooking.mutateAsync({ bookingId: selectedBooking.id });
      setCompleteModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleCancelClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelModalOpen(true);
  };

  const handleCancelConfirm = async (reason: string) => {
    if (selectedBooking) {
      await cancelBooking.mutateAsync({
        bookingId: selectedBooking.id,
        cancelledBy: role === "client" ? "client" : "instructor",
        cancellationReason: reason || undefined,
      });
      setCancelModalOpen(false);
      setSelectedBooking(null);
    }
  };

  const handleAcceptManual = async (bookingId: string) => {
    await acceptManualBooking.mutateAsync({ bookingId });
  };

  const getClientName = (booking: Booking) => {
    return booking.client?.firstName
      ? `${booking.client.firstName} ${booking.client.lastName || ""}`.trim()
      : booking.guestName || booking.guestEmail || "Klient";
  };

  return (
    <>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            role={role}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onCompleteClick={handleCompleteClick}
            onCancelClick={handleCancelClick}
            onAcceptManual={handleAcceptManual}
            isConfirmPending={confirmBooking.isPending}
            isCompletePending={completeBooking.isPending}
            isCancelPending={cancelBooking.isPending}
            isAcceptPending={acceptManualBooking.isPending}
          />
        ))}
      </div>

      {/* Reject Modal */}
      {selectedBooking && (
        <RejectBookingModal
          isOpen={rejectModalOpen}
          onClose={() => {
            setRejectModalOpen(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          clientName={getClientName(selectedBooking)}
        />
      )}

      {/* Complete Confirmation Modal */}
      <ConfirmModal
        isOpen={completeModalOpen}
        onClose={() => {
          setCompleteModalOpen(false);
          setSelectedBooking(null);
        }}
        onConfirm={handleCompleteConfirm}
        title={t("completeModal.title") || "Ukończ sesję"}
        description={
          t("completeModal.description") ||
          "Czy na pewno chcesz oznaczyć tę sesję jako ukończoną? Tej operacji nie można cofnąć."
        }
        confirmText={t("completeModal.confirm") || "Ukończ sesję"}
        cancelText={t("completeModal.cancel") || "Anuluj"}
        isLoading={completeBooking.isPending}
        variant="default"
      />

      {/* Cancel Booking Modal */}
      {selectedBooking && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedBooking(null);
          }}
          onConfirm={handleCancelConfirm}
          bookingDetails={{
            time: format(new Date(selectedBooking.startTime), "HH:mm"),
            date: format(new Date(selectedBooking.startTime), "d MMMM yyyy", {
              locale: dateLocale,
            }),
            clientName:
              role === "client" ? undefined : getClientName(selectedBooking),
          }}
          isLoading={cancelBooking.isPending}
          userRole={role}
        />
      )}
    </>
  );
}
