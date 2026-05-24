'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { MonthlyCalendarPreviewProps } from '@/types/availability';

export function MonthlyCalendarPreview({ schedule, sessionDuration = 60, exceptions = [] }: MonthlyCalendarPreviewProps) {
  const t = useTranslations('Dashboard.availability');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    
    // Compare using date-only strings to avoid timezone issues
    const exception = exceptions.find(e => {
      const exceptionDateOnly = e.date.split('T')[0];
      return exceptionDateOnly === dateStr;
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

      while (currentTime + sessionDuration <= endTime) {
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

    while (currentTime + sessionDuration <= endTime) {
      const hour = Math.floor(currentTime / 60);
      const min = currentTime % 60;
      slots.push(`${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`);
      currentTime += sessionDuration;
    }

    return { slots, hasException: false };
  };

  const handleDayClick = (day: Date, hasSlots: boolean) => {
    if (!hasSlots) return; // Don't open modal for unavailable days
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const getSelectedDayData = () => {
    if (!selectedDay) return null;
    const { slots, hasException } = generateTimeSlots(selectedDay);
    return { slots, hasException };
  };

  return (
    <div className="bg-slate-900/50 rounded-lg border border-slate-700 p-3 sm:p-4">
      {/* Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-2">
        <div className="flex-1">
          <h3 className="text-white font-semibold text-base sm:text-lg">
            {t('calendarPreview')}: {format(currentMonth, 'LLLL yyyy', { locale: dateLocale })}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
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
      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 overflow-hidden">{/* Day Headers */}
        {(locale === 'pl' 
          ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        ).map((day) => (
          <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-slate-400 py-1.5 sm:py-2">
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
              onClick={() => handleDayClick(day, hasSlots)}
              className={`aspect-square rounded-md sm:rounded-lg p-0.5 sm:p-1 overflow-y-auto transition-all ${
                isToday 
                  ? 'border-2 border-orange-500 bg-orange-500/5'
                  : hasSlots
                    ? hasException 
                      ? 'border-2 border-purple-500/50 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20' 
                      : 'border border-green-500/30 bg-green-500/10 cursor-pointer hover:bg-green-500/20'
                    : 'border border-slate-700 bg-slate-800/50'
              }`}
            >
              <div className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 text-center ${
                hasSlots 
                  ? hasException ? 'text-purple-400' : 'text-green-400' 
                  : 'text-slate-500'
              }`}>
                {format(day, 'd')}
              </div>
              
              {hasSlots ? (
                <div className="space-y-0.5 max-h-16 sm:max-h-20 overflow-hidden">
                  {slots.slice(0, 3).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`text-[8px] sm:text-[9px] rounded px-0.5 sm:px-1 py-0.5 text-center font-medium truncate ${
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
                      className="text-[7px] sm:text-[8px] text-slate-400 text-center font-medium"
                      title={t('moreSlotsTooltip', { count: slots.length - 3 })}
                    >
                      +{slots.length - 3}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-[9px] sm:text-[10px] text-slate-600 text-center mt-1">
                  —
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-400 flex items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500/20 border border-green-500/30 rounded"></div>
          <span>{t('availableLabel')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-purple-500/20 border border-purple-500/30 rounded ring-1 ring-purple-400"></div>
          <span>{t('exceptions')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-800/50 border border-slate-700 rounded"></div>
          <span>{t('unavailableLabel')}</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 ring-1 sm:ring-2 ring-orange-500 rounded"></div>
          <span>{t('todayLabel')}</span>
        </div>
      </div>

      {/* Day Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-slate-800 border-2 border-slate-600 text-white max-w-md mx-4 px-5 sm:px-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white flex items-center justify-between">
              <span>
                {selectedDay && format(selectedDay, 'EEEE, d MMMM yyyy', { locale: dateLocale })}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {selectedDay && (() => {
              const dayData = getSelectedDayData();
              if (!dayData) return null;
              
              const { slots, hasException } = dayData;
              
              if (slots.length === 0) {
                return (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-base">{t('dayOff')}</p>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {hasException && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                      <p className="text-purple-300 text-sm font-medium">{t('exceptions')}</p>
                    </div>
                  )}
                  
                  <div className="text-sm text-slate-400 mb-2">
                    {t('availableSlots')}: <span className="text-white font-semibold">{slots.length}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                    {slots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`text-center py-2.5 px-3 rounded-lg font-medium ${
                          hasException
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-green-500/20 text-green-300 border border-green-500/30'
                        }`}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-xs text-slate-500">
                    {t('sessionDuration')}: {sessionDuration} {t('minutes')}
                  </div>
                </div>
              );
            })()}

            <Button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white h-11"
            >
              {t('close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
