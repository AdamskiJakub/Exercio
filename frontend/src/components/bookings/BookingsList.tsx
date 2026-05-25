'use client';

import { useState } from 'react';
import { Booking } from '@/hooks/useMyBookings';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Check, X } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useConfirmBooking, useCompleteBooking } from '@/hooks/useBookingActions';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { RejectBookingModal } from './RejectBookingModal';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';

interface BookingsListProps {
  bookings: Booking[];
  role: 'client' | 'instructor';
}

export function BookingsList({ bookings, role }: BookingsListProps) {
  const t = useTranslations('Booking');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const confirmBooking = useConfirmBooking();
  const completeBooking = useCompleteBooking();
  const cancelBooking = useCancelBooking();

  if (bookings.length === 0) {
    return null;
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'CANCELLED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return t('confirmed');
      case 'PENDING':
        return t('pending');
      case 'CANCELLED':
        return t('cancelled');
      case 'COMPLETED':
        return t('completed');
      default:
        return status;
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-500/10 text-green-500';
      case 'PENDING':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-slate-500/10 text-slate-500';
    }
  };

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
        cancelledBy: role === 'client' ? 'client' : 'instructor',
        cancellationReason: reason || undefined,
      });
      setCancelModalOpen(false);
      setSelectedBooking(null);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {bookings.map((booking) => {
          const otherPerson = role === 'client' 
            ? booking.instructorUser 
            : booking.client || { firstName: booking.guestName, lastName: '', email: booking.guestEmail };

          const displayName = otherPerson.firstName 
            ? `${otherPerson.firstName} ${otherPerson.lastName || ''}`.trim()
            : otherPerson.email;

          const canConfirm = role === 'instructor' && booking.status === 'PENDING';
          const canComplete = role === 'instructor' && booking.status === 'CONFIRMED';
          const canCancel = (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

          return (
            <div
              key={booking.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1 space-y-2">
                  {/* User Info */}
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-white font-medium">{displayName}</span>
                    {!booking.client && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                        {t('guest')}
                      </span>
                    )}
                  </div>

                  {/* Date & Time */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {format(new Date(booking.startTime), 'EEEE, d MMMM yyyy', { locale: dateLocale })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500 mb-1">{t('notes')}:</p>
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {booking.notes}
                      </p>
                    </div>
                  )}

                  {/* Cancellation Info */}
                  {booking.status === 'CANCELLED' && booking.cancellationReason && (
                    <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-400">
                      <span className="font-medium">{t('cancellationReason')}: </span>
                      {booking.cancellationReason}
                    </div>
                  )}
                </div>

                {/* Status & Actions */}
                <div className="flex flex-col items-end gap-2">
                  {/* Status Badge - Hidden for instructor when actions are available */}
                  {!(role === 'instructor' && (canConfirm || canComplete)) && (
                    <div className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm whitespace-nowrap",
                      getStatusColor(booking.status)
                    )}>
                      {getStatusIcon(booking.status)}
                      {getStatusText(booking.status)}
                    </div>
                  )}

                  {/* Action Buttons for Instructor */}
                  {role === 'instructor' && (canConfirm || canComplete) && (
                    <div className="flex gap-2">
                      {canConfirm && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleConfirm(booking.id)}
                            disabled={confirmBooking.isPending}
                            className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {t('acceptBooking')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(booking)}
                            disabled={confirmBooking.isPending}
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-8 px-3"
                          >
                            <X className="w-4 h-4 mr-1" />
                            {t('rejectBooking')}
                          </Button>
                        </>
                      )}
                      {canComplete && (
                        <Button
                          size="sm"
                          onClick={() => handleCompleteClick(booking)}
                          disabled={completeBooking.isPending}
                          className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-3"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {t('completeBooking')}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Cancel Button for Clients */}
                  {role === 'client' && canCancel && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleCancelClick(booking)}
                      disabled={cancelBooking.isPending}
                      className="h-8 px-3"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      {t('cancelSession')}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
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
          clientName={
            selectedBooking.client?.firstName 
              ? `${selectedBooking.client.firstName} ${selectedBooking.client.lastName || ''}`.trim()
              : selectedBooking.guestName || selectedBooking.guestEmail || 'Klient'
          }
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
        title={t('completeModal.title') || 'Ukończ sesję'}
        description={t('completeModal.description') || 'Czy na pewno chcesz oznaczyć tę sesję jako ukończoną? Tej operacji nie można cofnąć.'}
        confirmText={t('completeModal.confirm') || 'Ukończ sesję'}
        cancelText={t('completeModal.cancel') || 'Anuluj'}
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
            time: format(new Date(selectedBooking.startTime), 'HH:mm'),
            date: format(new Date(selectedBooking.startTime), 'd MMMM yyyy', { locale: pl }),
            clientName: role === 'client' 
              ? undefined 
              : (selectedBooking.client?.firstName 
                  ? `${selectedBooking.client.firstName} ${selectedBooking.client.lastName || ''}`.trim()
                  : selectedBooking.guestName || selectedBooking.guestEmail || 'Klient'),
          }}
          isLoading={cancelBooking.isPending}
          userRole={role}
        />
      )}
    </>
  );
}
