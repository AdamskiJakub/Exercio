'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import type { MonthlyCalendarPreviewProps } from '@/types/availability';

export function MonthlyCalendarPreview({ schedule, sessionDuration = 60, exceptions = [] }: MonthlyCalendarPreviewProps) {
  const t = useTranslations('Dashboard.availability');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const generateTimeSlots = (day: Date): { slots: string[], hasException: boolean } => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayOfWeek = getDay(day);
    
    const exception = exceptions.find(e => {
      const exceptionDate = format(new Date(e.date), 'yyyy-MM-dd');
      return exceptionDate === dateStr;
    });
    
    if (exception) {
      if (!exception.isAvailable || !exception.startTime || !exception.endTime) {
        return { slots: [], hasException: true };
      }
      
      const slots: string[] = [];
      const [startHour, startMin] = exception.startTime.split(':').map(Number);
      const [endHour, endMin] = exception.endTime.split(':').map(Number);
      
      let currentTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      while (currentTime < endTime) {
        const hour = Math.floor(currentTime / 60);
        const min = currentTime % 60;
        slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
        currentTime += sessionDuration;
      }
      
      return { slots, hasException: true };
    }
    
    const adjustedDayOfWeek = dayOfWeek === 0 ? 0 : dayOfWeek;
    const daySchedule = schedule.find(d => d.dayOfWeek === adjustedDayOfWeek);
    if (!daySchedule || !daySchedule.isAvailable) return { slots: [], hasException: false };

    const slots: string[] = [];
    const [startHour, startMin] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMin] = daySchedule.endTime.split(':').map(Number);
    
    let currentTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    while (currentTime < endTime) {
      const hour = Math.floor(currentTime / 60);
      const min = currentTime % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      currentTime += sessionDuration;
    }

    return { slots, hasException: false };
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-4">
      {/* Header with Month Navigation */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-white font-semibold text-lg">
            {t('calendarPreview')}: {format(currentMonth, 'LLLL yyyy', { locale: dateLocale })}
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            {t('calendarDescription')}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t('previousMonth')}
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t('nextMonth')}
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {(locale === 'pl' 
          ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        ).map((day) => (
          <div key={day} className="text-center text-xs font-medium text-slate-400 py-2">
            {day}
          </div>
        ))}

        {/* Empty cells for padding */}
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}

        {/* Calendar Days */}
        {daysInMonth.map((day) => {
          const { slots, hasException } = generateTimeSlots(day);
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          const hasSlots = slots.length > 0;

          return (
            <div
              key={day.toISOString()}
              className={`aspect-square border rounded-lg p-1 overflow-hidden ${
                hasSlots
                  ? hasException 
                    ? 'bg-purple-500/10 border-purple-500/30' 
                    : 'bg-green-500/10 border-green-500/30'
                  : 'bg-slate-800/50 border-slate-700'
              } ${isToday ? 'ring-2 ring-orange-500' : ''} ${hasException && hasSlots ? 'ring-1 ring-purple-400' : ''}`}
            >
              <div className={`text-xs font-medium mb-1 ${
                hasSlots 
                  ? hasException ? 'text-purple-400' : 'text-green-400' 
                  : 'text-slate-500'
              }`}>
                {format(day, 'd')}
              </div>
              
              {hasSlots ? (
                <div className="space-y-0.5 overflow-y-auto max-h-20">
                  {slots.slice(0, 3).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`text-[9px] rounded px-1 py-0.5 text-center ${
                        hasException
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {slot}
                    </div>
                  ))}
                  {slots.length > 3 && (
                    <div 
                      className="text-[8px] text-slate-400 text-center"
                      title={t('moreSlotsTooltip', { count: slots.length - 3 })}
                    >
                      +{slots.length - 3} {t('moreSlots')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[9px] text-slate-600 text-center mt-1">
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 text-xs text-slate-400 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span>{t('availableLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500/20 border border-purple-500/30 rounded ring-1 ring-purple-400"></div>
          <span>{t('exceptions')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-800/50 border border-slate-700 rounded"></div>
          <span>{t('unavailableLabel')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 ring-2 ring-orange-500 rounded"></div>
          <span>{t('todayLabel')}</span>
        </div>
      </div>
    </div>
  );
}
