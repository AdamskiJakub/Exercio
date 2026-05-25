'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { DayDetailsModal } from '@/components/booking/DayDetailsModal';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { DaySlots } from '@/types/booking';

export function MonthlyCalendarPreview() {
  const t = useTranslations('Dashboard.availability');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  const { data: instructorProfile } = useMyInstructorProfile();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<DaySlots | null>(null);

  // Fetch slots for the entire month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDateKey = format(monthStart, 'yyyy-MM-dd');
  const endDateKey = format(monthEnd, 'yyyy-MM-dd');
  
  const slotsQuery = useAvailableSlots(
    instructorProfile?.id || '', 
    startDateKey, 
    endDateKey
  );

  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = getDay(monthStart);
  const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Adjust for Monday start

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Get actual slots from backend (includes booking status)
  const getActualDaySlots = (day: Date): { slots: Array<{ time: string; available: boolean; isBooked: boolean; isCancelled: boolean; isException: boolean }>, hasException: boolean } => {
    if (!slotsQuery.data) {
      return { slots: [], hasException: false };
    }

    const dateKey = format(day, 'yyyy-MM-dd');
    const daySlots = slotsQuery.data
      .filter(slot => {
        const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
        return slotDate === dateKey;
      })
      .map(slot => ({
        time: format(new Date(slot.startTime), 'HH:mm'),
        available: slot.available,
        isBooked: !!slot.booking && slot.booking.status !== 'CANCELLED',
        isCancelled: !!slot.booking && slot.booking.status === 'CANCELLED',
        isException: slot.isException || false,
      }));

    return {
      slots: daySlots,
      hasException: daySlots.some(s => s.isException),
    };
  };

  const handleDayClick = (day: Date, hasSlots: boolean) => {
    if (!hasSlots || !slotsQuery.data) return;
    
    // Filter slots for this specific day
    const dateKey = format(day, 'yyyy-MM-dd');
    const daySlots = slotsQuery.data
      .filter(slot => {
        const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
        return slotDate === dateKey;
      })
      .map(slot => ({
        time: format(new Date(slot.startTime), 'HH:mm'),
        available: slot.available,
        datetime: new Date(slot.startTime),
        isException: slot.isException || false,
        booking: slot.booking,
      }));

    setSelectedDayData({
      date: day,
      slots: daySlots,
      hasException: daySlots.some(s => s.isException),
    });
    setSelectedDay(day);
    setIsModalOpen(true);
  };

  const handleNotesUpdated = () => {
    // Refetch slots data after notes update
    slotsQuery.refetch();
  };

  // Update selectedDayData when slots data changes
  useEffect(() => {
    if (selectedDay && slotsQuery.data && isModalOpen) {
      const dateKey = format(selectedDay, 'yyyy-MM-dd');
      const daySlots = slotsQuery.data
        .filter(slot => {
          const slotDate = format(new Date(slot.startTime), 'yyyy-MM-dd');
          return slotDate === dateKey;
        })
        .map(slot => ({
          time: format(new Date(slot.startTime), 'HH:mm'),
          available: slot.available,
          datetime: new Date(slot.startTime),
          isException: slot.isException || false,
          booking: slot.booking,
        }));

      setSelectedDayData({
        date: selectedDay,
        slots: daySlots,
        hasException: daySlots.some(s => s.isException),
      });
    }
  }, [slotsQuery.data, selectedDay, isModalOpen]);

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

      {/* Loading State */}
      {slotsQuery.isLoading && <LoadingSpinner />}

      {/* Error State */}
      {slotsQuery.isError && (
        <div className="text-center py-20 text-red-400">
          {t('calendarLoadError') || 'Błąd ładowania kalendarza'}
        </div>
      )}

      {/* Calendar Grid */}
      {!slotsQuery.isLoading && !slotsQuery.isError && (
        <>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 overflow-hidden">
            {/* Day Headers */}
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
              const { slots, hasException } = getActualDaySlots(day);
              const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              const isPast = day < new Date() && !isToday;
              const hasSlots = slots.length > 0;
              const hasBookedSlots = slots.some(s => s.isBooked);
              const hasCancelledSlots = slots.some(s => s.isCancelled);

              return (
                <div
              key={day.toISOString()}
              onClick={() => !isPast && handleDayClick(day, hasSlots)}
              className={`aspect-square rounded-md sm:rounded-lg p-0.5 sm:p-1 overflow-y-auto transition-all ${
                isPast
                  ? 'border border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                  : isToday 
                  ? 'border-2 border-orange-500 bg-orange-500/5'
                  : hasSlots
                    ? hasException 
                      ? 'border-2 border-purple-500/50 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20' 
                      : hasBookedSlots
                      ? 'border border-red-500/30 bg-red-500/10 cursor-pointer hover:bg-red-500/20'
                      : hasCancelledSlots
                      ? 'border border-yellow-500/30 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20'
                      : 'border border-green-500/30 bg-green-500/10 cursor-pointer hover:bg-green-500/20'
                    : 'border border-slate-700 bg-slate-800/50'
              }`}
            >
              <div className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 text-center ${
                isPast
                  ? 'text-slate-600'
                  : hasSlots 
                  ? hasException 
                    ? 'text-purple-400' 
                    : hasBookedSlots 
                    ? 'text-red-400'
                    : hasCancelledSlots
                    ? 'text-yellow-400'
                    : 'text-green-400' 
                  : 'text-slate-500'
              }`}>
                {format(day, 'd')}
              </div>
              
              {isPast ? (
                <div className="text-[9px] sm:text-[10px] text-slate-600 text-center mt-1">
                  —
                </div>
              ) : hasSlots ? (
                <div className="space-y-0.5 max-h-16 sm:max-h-20 overflow-hidden">
                  {slots.slice(0, 3).map((slot, idx) => (
                    <div
                      key={idx}
                      className={`text-[8px] sm:text-[9px] rounded px-0.5 sm:px-1 py-0.5 text-center font-medium truncate ${
                        slot.isBooked
                          ? 'bg-red-500/20 text-red-300'
                          : slot.isCancelled
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : slot.isException
                          ? 'bg-purple-500/20 text-purple-300'
                          : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {slot.time}
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
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500/20 border border-red-500/30 rounded"></div>
              <span>{t('bookedLabel')}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500/20 border border-yellow-500/30 rounded"></div>
              <span>{t('cancelledLabel')}</span>
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
        </>
      )}

      {/* Day Details Modal */}
      {selectedDayData && (
        <DayDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDay(null);
            setSelectedDayData(null);
          }}
          dayData={selectedDayData}
          onNotesUpdated={handleNotesUpdated}
        />
      )}
    </div>
  );
}
