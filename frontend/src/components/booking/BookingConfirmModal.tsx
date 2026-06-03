'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { X, Calendar, Clock, DollarSign } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useClickOutside, useEscapeKey } from '@/lib/hooks';
import { useAuthStore } from '@/stores/auth-store';
import { InstructorInfoCard } from './InstructorInfoCard';
import { GuestBookingForm } from './GuestBookingForm';
import type { InstructorProfile } from '@/types';

interface BookingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (guestData?: { name: string; email: string; phone: string }) => void;
  selectedDate: Date;
  selectedTime: string;
  instructorProfile: InstructorProfile;
}

export function BookingConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  instructorProfile,
}: BookingConfirmModalProps) {
  const t = useTranslations('Booking');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  const { isAuthenticated } = useAuthStore();
  const modalRef = useClickOutside<HTMLDivElement>(onClose, isOpen);
  useEscapeKey(onClose, isOpen);

  // Guest form data and validation
  const [guestData, setGuestData] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [isGuestFormValid, setIsGuestFormValid] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isAuthenticated) {
      if (!isGuestFormValid || !guestData) {
        return;
      }
      onConfirm(guestData);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        ref={modalRef} 
        className="bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="booking-modal-title"
        aria-describedby="booking-modal-description"
      >
        {/* Header */}
        <div className="relative bg-linear-to-r from-orange-500 to-red-500 p-6 shrink-0 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            aria-label={t('cancel')}
          >
            <X className="size-6" />
          </button>
          <h2 id="booking-modal-title" className="text-2xl font-bold text-white">
            {t('confirmBooking')}
          </h2>
          <p id="booking-modal-description" className="sr-only">
            {t('selectDateAndTime')}
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Instructor Info Card */}
          <InstructorInfoCard 
            instructor={instructorProfile}
            label={t('sessionWith')}
          />

          {/* Booking Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="size-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">{t('date')}</p>
                <p className="font-medium">{format(selectedDate, 'd MMMM yyyy', { locale: dateLocale })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <Clock className="size-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">{t('time')}</p>
                <p className="font-medium">{selectedTime}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-300">
              <DollarSign className="size-5 text-orange-500" />
              <div>
                <p className="text-sm text-slate-400">{t('sessionPrice')}</p>
                <p className="font-medium">{instructorProfile.sessionPrice || 0} zł</p>
              </div>
            </div>
          </div>

          {/* Duration Info */}
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
            <p className="text-sm text-orange-400">
              {t('sessionDuration')}: <span className="font-semibold">{instructorProfile.sessionDuration || 60} min</span>
            </p>
          </div>

          {/* Cancellation Policy Hint */}
          {(instructorProfile.minNoticeHours ?? 0) > 0 && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <p className="text-sm text-blue-400">
                {t('cancellationPolicy', { hours: instructorProfile.minNoticeHours ?? 0 })}
              </p>
            </div>
          )}

          {/* Guest Contact Form - Only for non-authenticated users */}
          {!isAuthenticated && (
            <GuestBookingForm 
              onDataChange={(data, isValid) => {
                setGuestData(data);
                setIsGuestFormValid(isValid);
              }}
            />
          )}
        </div>

        {/* Action Buttons - Fixed at bottom */}
        <div className="shrink-0 p-6 pt-0">
          <div className="flex gap-3">
            <Button
              variant="outline-slate"
              onClick={onClose}
              size="xl"
              className="flex-1 sm:flex-none sm:min-w-50"
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleConfirm}
              variant="primary"
              size="xl"
              className="flex-1 sm:flex-none sm:min-w-50"
              disabled={!isAuthenticated && !isGuestFormValid}
            >
              {t('confirmBooking')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
