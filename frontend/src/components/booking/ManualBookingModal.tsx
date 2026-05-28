'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Phone, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';
import { useCreateManualBooking } from '@/hooks/useCreateManualBooking';

interface ManualBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotTime: string;
  displayTime: string;
  displayDate: string;
}

export function ManualBookingModal({
  isOpen,
  onClose,
  slotTime,
  displayTime,
  displayDate,
}: ManualBookingModalProps) {
  const t = useTranslations('Booking');
  const createManualBooking = useCreateManualBooking();

  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    notes: '',
  });

  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen);
  useEscapeKey(onClose, isOpen);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createManualBooking.mutateAsync({
        startTime: slotTime,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        notes: formData.notes || undefined,
      });

      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        notes: '',
      });
      onClose();
    } catch (error) {
      console.error('Failed to create manual booking:', error);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const modalContent = (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        role="dialog"
        aria-labelledby="manual-booking-title"
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-orange-500 to-red-500 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1 cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="size-6" />
          </button>
          <h2 id="manual-booking-title" className="text-2xl font-bold text-white">
            {t('manualBookingTitle')}
          </h2>
          <p className="text-white/80 mt-1">
            {displayDate} · {displayTime}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Guest Name */}
          <div>
            <label htmlFor="guestName" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <User className="size-4" />
              {t('guestNameLabel')}
            </label>
            <input
              id="guestName"
              type="text"
              required
              value={formData.guestName}
              onChange={(e) => handleChange('guestName', e.target.value)}
              placeholder={t('guestNamePlaceholder')}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Guest Email */}
          <div>
            <label htmlFor="guestEmail" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Mail className="size-4" />
              {t('guestEmailLabel')}
            </label>
            <input
              id="guestEmail"
              type="email"
              required
              value={formData.guestEmail}
              onChange={(e) => handleChange('guestEmail', e.target.value)}
              placeholder={t('guestEmailPlaceholder')}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Guest Phone */}
          <div>
            <label htmlFor="guestPhone" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Phone className="size-4" />
              {t('guestPhoneLabel')}
            </label>
            <input
              id="guestPhone"
              type="tel"
              required
              value={formData.guestPhone}
              onChange={(e) => handleChange('guestPhone', e.target.value)}
              placeholder={t('guestPhonePlaceholder')}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <FileText className="size-4" />
              {t('notesManualLabel')}
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder={t('notesManualPlaceholder')}
              rows={3}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline-slate"
              onClick={onClose}
              disabled={createManualBooking.isPending}
              className="flex-1 cursor-pointer"
            >
              {t('cancelButton')}
            </Button>
            <Button
              type="submit"
              disabled={createManualBooking.isPending}
              className="flex-1 bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white cursor-pointer"
            >
              {createManualBooking.isPending ? t('creatingBooking') : t('createBookingButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
