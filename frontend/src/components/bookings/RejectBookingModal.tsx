'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useRejectBooking } from '@/hooks/useBookingActions';
import { ConfirmModal } from '@/components/ui/confirm-modal';

interface RejectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  clientName: string;
}

export function RejectBookingModal({
  isOpen,
  onClose,
  bookingId,
  clientName,
}: RejectBookingModalProps) {
  const t = useTranslations('Booking.rejectModal');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const rejectBooking = useRejectBooking();

  const handleReject = async () => {
    if (!reason.trim()) {
      setError(t('reasonRequired'));
      return;
    }

    try {
      await rejectBooking.mutateAsync({
        bookingId,
        reason: reason.trim(),
      });
      onClose();
      setReason('');
      setError('');
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    if (!rejectBooking.isPending) {
      onClose();
      setReason('');
      setError('');
    }
  };

  return (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleClose}
      onConfirm={handleReject}
      title={t('title')}
      description={t('description')}
      confirmText={t('confirm')}
      cancelText={t('cancel')}
      isLoading={rejectBooking.isPending}
      variant="danger"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reason" className="text-white">
            {t('reasonLabel')} <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError('');
            }}
            placeholder={t('reasonPlaceholder')}
            className="min-h-30 bg-slate-900 border-slate-700 text-white"
            disabled={rejectBooking.isPending}
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-sm text-blue-400">
            <span className="font-medium">{clientName}</span> otrzyma powiadomienie z powodem odrzucenia.
          </p>
        </div>
      </div>
    </ConfirmModal>
  );
}
