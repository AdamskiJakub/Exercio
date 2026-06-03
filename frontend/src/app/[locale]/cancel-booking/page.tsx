'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { AlertTriangle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGuestCancelBooking } from '@/hooks/useGuestCancelBooking';

export default function CancelBookingPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations('CancelBooking');
  const commonT = useTranslations('Common');

  const bookingId = searchParams.get('bookingId') || '';
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const cancelMutation = useGuestCancelBooking();

  const handleCancel = () => {
    if (!bookingId || !token) return;

    cancelMutation.mutate(
      {
        bookingId,
        token,
        cancellationReason: reason || undefined,
        language: locale === 'en' ? 'en' : 'pl',
      },
      {
        onSuccess: () => setConfirmed(true),
      },
    );
  };

  // Invalid or missing params
  if (!bookingId || !token) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-8 text-center">
          <XCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">{t('invalidLink')}</h1>
          <p className="text-slate-400">{t('invalidLinkDescription')}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (confirmed) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-green-500/30 rounded-2xl max-w-md w-full p-8 text-center">
          <div className="size-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="size-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{t('success')}</h1>
          <p className="text-slate-400">{t('successDescription')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (cancelMutation.isError) {
    const errorMessage =
      (cancelMutation.error as any)?.response?.data?.message || t('error');

    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-red-500/30 rounded-2xl max-w-md w-full p-8 text-center">
          <XCircle className="size-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">{t('errorTitle')}</h1>
          <p className="text-slate-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Confirmation step
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="size-8 text-red-500" />
          <h1 className="text-xl font-bold text-white">{t('title')}</h1>
        </div>

        <p className="text-slate-300 mb-6">{t('description')}</p>

        <div className="space-y-2 mb-6">
          <label htmlFor="cancel-reason" className="text-sm font-medium text-slate-400">
            {t('reasonLabel')} <span className="text-slate-500">({t('optional')})</span>
          </label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('reasonPlaceholder')}
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
            rows={3}
            disabled={cancelMutation.isPending}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            variant="destructive"
            className="flex-1 cursor-pointer"
          >
            {cancelMutation.isPending ? commonT('loading') : t('confirmButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}