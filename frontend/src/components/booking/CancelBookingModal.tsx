'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  bookingDetails: {
    time: string;
    date: string;
    clientName?: string;
  };
  isLoading: boolean;
  userRole: 'client' | 'instructor';
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  bookingDetails,
  isLoading,
  userRole,
}: CancelBookingModalProps) {
  const t = useTranslations('Booking');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen && !isLoading);
  useEscapeKey(onClose, isOpen && !isLoading);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // For instructors, reason is required
    if (userRole === 'instructor' && !reason.trim()) {
      setError(t('reasonRequired'));
      return;
    }
    onConfirm(reason);
  };

  const modalContent = (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-red-500/30 rounded-2xl shadow-2xl max-w-md w-full"
        role="dialog"
        aria-labelledby="cancel-booking-title"
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-red-600 to-red-500 p-6 rounded-t-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('closeDayDetails')}
          >
            <X className="size-6" />
          </button>
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-8 text-white" />
            <div>
              <h2 id="cancel-booking-title" className="text-2xl font-bold text-white">
                {t('cancelBookingTitle')}
              </h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-300">
            {userRole === 'instructor' 
              ? t('cancelBookingMessageInstructor')
              : t('cancelBookingMessageClient')}
          </p>

          <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('date')}:</span>
              <span className="text-white font-medium">{bookingDetails.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t('time')}:</span>
              <span className="text-white font-medium">{bookingDetails.time}</span>
            </div>
            {bookingDetails.clientName && userRole === 'instructor' && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('client')}:</span>
                <span className="text-white font-medium">{bookingDetails.clientName}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="cancel-reason" className="text-sm font-medium text-slate-300">
              {t('cancellationReason')} {userRole === 'instructor' && <span className="text-red-500">*</span>} {userRole === 'client' && `(${t('optional')})`}
            </label>
            <textarea
              id="cancel-reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder={t('cancellationReasonPlaceholder')}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
              rows={3}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <p className="text-sm text-slate-400">
            {userRole === 'instructor' 
              ? t('cancelBookingWarningInstructor')
              : t('cancelBookingWarningClient')}
          </p>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-3">
          <Button
            onClick={onClose}
            variant="outline-slate"
            disabled={isLoading}
            className="flex-1 cursor-pointer"
          >
            {t('rejectModal.cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            variant="destructive"
            className="flex-1 cursor-pointer"
          >
            {isLoading ? t('cancelling') : t('confirmCancel')}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
