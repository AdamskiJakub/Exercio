'use client';

import { useTranslations } from 'next-intl';

export function BookingLegend() {
  const t = useTranslations('Booking.legend');

  return (
    <div className="mt-6 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
      <h3 className="text-sm font-semibold text-white mb-3">{t('title')}</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="size-4 bg-green-500/20 border border-green-500 rounded"></div>
          <span className="text-slate-300">{t('availableLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 bg-red-500/20 border border-red-500 rounded"></div>
          <span className="text-slate-300">{t('bookedLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 bg-purple-500/20 border-2 border-purple-500 rounded"></div>
          <span className="text-slate-300">{t('exceptionLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 bg-slate-700 border border-slate-600 rounded"></div>
          <span className="text-slate-300">{t('unavailableLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="size-4 border-2 border-orange-500 rounded"></div>
          <span className="text-slate-300">{t('todayLabel')}</span>
        </div>
      </div>
    </div>
  );
}
