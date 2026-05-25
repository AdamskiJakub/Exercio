'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { X, Clock, User, Mail, FileText, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';
import { useUpdateBookingNotes } from '@/hooks/useUpdateBookingNotes';
import { useCancelBooking } from '@/hooks/useCancelBooking';
import { useAcknowledgeCancellation } from '@/hooks/useAcknowledgeCancellation';
import { CancelBookingModal } from './CancelBookingModal';
import { useAuthStore } from '@/stores/auth-store';
import type { DaySlots } from '@/types/booking';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: DaySlots;
  onNotesUpdated?: () => void;
}

export function DayDetailsModal({
  isOpen,
  onClose,
  dayData,
  onNotesUpdated,
}: DayDetailsModalProps) {
  const t = useTranslations('Booking');
  const updateNotes = useUpdateBookingNotes();
  const cancelBooking = useCancelBooking();
  const acknowledgeCancellation = useAcknowledgeCancellation();
  const { user } = useAuthStore();

  const [editingBookingId, setEditingBookingId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{
    id: string;
    time: string;
    clientName?: string;
  } | null>(null);

  // Only enable click outside when cancel modal is NOT open
  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen && !cancelModalOpen);
  useEscapeKey(onClose, isOpen && !cancelModalOpen);

  // Prevent body scroll when modal is open
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleEditNotes = (bookingId: string, currentNotes?: string) => {
    setEditingBookingId(bookingId);
    setNotesText(currentNotes || '');
  };

  const handleSaveNotes = async () => {
    if (!editingBookingId) return;
    
    try {
      await updateNotes.mutateAsync({
        bookingId: editingBookingId,
        notes: notesText,
      });

      setEditingBookingId(null);
      setNotesText('');
      
      // Trigger callback to refresh data
      if (onNotesUpdated) {
        onNotesUpdated();
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingBookingId(null);
    setNotesText('');
  };

  const handleCancelBooking = (bookingId: string, time: string, clientName?: string) => {
    setBookingToCancel({ id: bookingId, time, clientName });
    setCancelModalOpen(true);
  };

  const handleAcknowledge = async (bookingId: string) => {
    try {
      await acknowledgeCancellation.mutateAsync(bookingId);
      
      // Trigger callback to refresh data
      if (onNotesUpdated) {
        onNotesUpdated();
      }
    } catch (error) {
      console.error('Failed to acknowledge cancellation:', error);
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!bookingToCancel) return;

    try {
      await cancelBooking.mutateAsync({
        bookingId: bookingToCancel.id,
        cancelledBy: user?.role === 'CLIENT' ? 'client' : 'instructor',
        cancellationReason: reason || undefined,
      });

      setCancelModalOpen(false);
      setBookingToCancel(null);

      // Trigger callback to refresh data
      if (onNotesUpdated) {
        onNotesUpdated();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef} 
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="day-details-title"
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-orange-500 to-red-500 p-6 shrink-0 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1 cursor-pointer"
            aria-label={t('closeDayDetails')}
          >
            <X className="size-6" />
          </button>
          <h2 id="day-details-title" className="text-2xl font-bold text-white">
            {t('dayDetails')}
          </h2>
          <p className="text-white/80 mt-1">
            {format(dayData.date, 'EEEE, d MMMM yyyy', { locale: pl })}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {dayData.slots.length === 0 ? (
              <p className="text-slate-400 text-center py-8">{t('noSlots')}</p>
            ) : (
              dayData.slots.map((slot, index) => {
                const isEditing = slot.booking && editingBookingId === slot.booking.id;
                
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      slot.booking
                        ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
                        : slot.available
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-slate-700/30 border-slate-600/30'
                    }`}
                  >
                    {/* Time and Status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock className={`size-5 ${
                          slot.booking ? 'text-red-400' : slot.available ? 'text-green-400' : 'text-slate-400'
                        }`} />
                        <span className="text-lg font-semibold text-white">
                          {slot.time}
                        </span>
                        {slot.isException && (
                          <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                            {t('legend.exceptionLabel')}
                          </span>
                        )}
                      </div>
                      <span className={`text-sm font-medium ${
                        slot.booking ? 'text-red-400' : slot.available ? 'text-green-400' : 'text-slate-400'
                      }`}>
                        {slot.booking ? t('slotBooked') : slot.available ? t('slotAvailable') : t('legend.unavailableLabel')}
                      </span>
                    </div>

                    {/* Booking Details */}
                    {slot.booking && (
                      <div className="space-y-3 mt-3 pt-3 border-t border-red-500/20">
                        <div className="flex items-center gap-2 text-slate-300">
                          <User className="size-4 text-red-400" />
                          <span className="font-medium">{slot.booking.clientName}</span>
                        </div>
                        
                        {slot.booking.clientEmail && (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Mail className="size-4" />
                            <span>{slot.booking.clientEmail}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            slot.booking.status === 'CONFIRMED' 
                              ? 'bg-green-500/20 text-green-400'
                              : slot.booking.status === 'PENDING'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : slot.booking.status === 'CANCELLED'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {t(slot.booking.status.toLowerCase())}
                          </span>
                        </div>

                        {/* Cancellation Reason - if cancelled */}
                        {slot.booking.status === 'CANCELLED' && slot.booking.cancellationReason && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <p className="text-xs text-red-400 font-medium mb-1">{t('cancellationReason')}:</p>
                            <p className="text-sm text-slate-300 whitespace-pre-wrap">
                              {slot.booking.cancellationReason}
                            </p>
                          </div>
                        )}

                        {/* Acknowledge Cancellation Button - for instructors only */}
                        {slot.booking.status === 'CANCELLED' && user?.role === 'INSTRUCTOR' && (
                          <div className="mt-4">
                            <Button
                              onClick={() => handleAcknowledge(slot.booking!.id)}
                              disabled={acknowledgeCancellation.isPending}
                              className="w-full bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                            >
                              {acknowledgeCancellation.isPending ? t('acknowledging') || 'Potwierdzam...' : t('acknowledgeButton') || 'OK - Rozumiem'}
                            </Button>
                          </div>
                        )}

                        {/* Notes Section */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-slate-300">
                              <FileText className="size-4" />
                              <span className="font-medium text-sm">{t('notes')}</span>
                            </div>
                            {!isEditing && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleEditNotes(slot.booking!.id, slot.booking!.notes)}
                                className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs cursor-pointer"
                              >
                                {slot.booking.notes ? t('editNotes') : t('addNotes')}
                              </Button>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                                placeholder={t('notesPlaceholder')}
                                className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEdit}
                                  disabled={updateNotes.isPending}
                                  className="border-slate-600 cursor-pointer"
                                >
                                  {t('rejectModal.cancel')}
                                </Button>
                                <Button
                                  onClick={handleSaveNotes}
                                  size="sm"
                                  disabled={updateNotes.isPending}
                                  className="bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer"
                                >
                                  {updateNotes.isPending ? t('saving') : t('saveNotes')}
                                </Button>
                              </div>
                            </div>
                          ) : slot.booking.notes ? (
                            <p className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg whitespace-pre-wrap">
                              {slot.booking.notes}
                            </p>
                          ) : (
                            <p className="text-sm text-slate-500 italic">
                              {t('noNotesYet') || 'Brak notatek'}
                            </p>
                          )}
                        </div>

                        {/* Cancel Session Button - Full Width Below Notes */}
                        {(slot.booking.status === 'PENDING' || slot.booking.status === 'CONFIRMED') && (
                          <div className="mt-4 pt-4 border-t border-red-500/20">
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelBooking(
                                slot.booking!.id,
                                slot.time,
                                slot.booking!.clientName
                              )}
                              className="w-full cursor-pointer"
                            >
                              <XCircle className="size-4 mr-2" />
                              {t('cancelSession')}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-6 pt-0">
          <Button
            onClick={onClose}
            variant="outline-slate"
            className="w-full border-slate-700 hover:bg-slate-700 cursor-pointer py-4"
          >
            {t('closeDayDetails')}
          </Button>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setBookingToCancel(null);
          }}
          onConfirm={handleConfirmCancel}
          bookingDetails={{
            time: bookingToCancel.time,
            date: format(dayData.date, 'd MMMM yyyy', { locale: pl }),
            clientName: bookingToCancel.clientName,
          }}
          isLoading={cancelBooking.isPending}
          userRole={user?.role === 'CLIENT' ? 'client' : 'instructor'}
        />
      )}
    </div>
  );

  return createPortal(modalContent, document.body);
}
