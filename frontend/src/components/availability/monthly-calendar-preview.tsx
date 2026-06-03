'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday, isPast } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { DayDetailsModal } from '@/components/booking/DayDetailsModal';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { DaySlots, TimeSlot } from '@/types/booking';

 type ProcessedDaySlots = {
    slots: Array<{ time: string; available: boolean; isBooked: boolean; isCancelled: boolean; isException: boolean }>;
    hasException: boolean;
  };

export function MonthlyCalendarPreview() {
  const t = useTranslations('Dashboard.availability');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  const { data: instructorProfile } = useMyInstructorProfile();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDayData, setSelectedDayData] = useState<DaySlots | null>(null);
  // Mobile: currently selected day (defaults to today)
  const [selectedMobileDay, setSelectedMobileDay] = useState<Date>(new Date());

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

  const processedSlotsMap = useMemo(() => {
    if (!slotsQuery.data) return new Map<string, ProcessedDaySlots>();

    const map = new Map<string, ProcessedDaySlots>();

    slotsQuery.data.forEach(slot => {
      const dateKey = format(new Date(slot.startTime), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, { slots: [], hasException: false });
      }
      const entry = map.get(dateKey)!;
      const isException = slot.isException || false;
      entry.slots.push({
        time: format(new Date(slot.startTime), 'HH:mm'),
        available: slot.available,
        isBooked: !!slot.booking && slot.booking.status !== 'CANCELLED',
        isCancelled: !!slot.booking && slot.booking.status === 'CANCELLED',
        isException,
      });
      if (isException) entry.hasException = true;
    });

    return map;
  }, [slotsQuery.data]);

  // Helper to get full TimeSlot[] (with datetime & booking) for modal
  const getDaySlotsWithDetails = (day: Date): TimeSlot[] => {
    if (!slotsQuery.data) return [];
    const dateKey = format(day, 'yyyy-MM-dd');
    return slotsQuery.data
      .filter(slot => format(new Date(slot.startTime), 'yyyy-MM-dd') === dateKey)
      .map(slot => ({
        time: format(new Date(slot.startTime), 'HH:mm'),
        available: slot.available,
        datetime: new Date(slot.startTime),
        isException: slot.isException || false,
        booking: slot.booking,
      }));
  };

    const handleDayClick = (day: Date) => {
    if (!slotsQuery.data) return;

      const daySlots = getDaySlotsWithDetails(day);
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

  // Scroll to selected day in mobile view
  const scrollToDay = (date: Date) => {
    setSelectedMobileDay(date);
    const index = daysInMonth.findIndex(d => isSameDay(d, date));
    if (scrollRef.current && index >= 0) {
      const children = scrollRef.current.children;
      if (children[index]) {
        children[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  // Update selectedDayData when slots data changes
    useEffect(() => {
      if (selectedDay && slotsQuery.data && isModalOpen) {
        const daySlots = getDaySlotsWithDetails(selectedDay);
        setSelectedDayData({
          date: selectedDay,
          slots: daySlots,
          hasException: daySlots.some(s => s.isException),
        });
      }
    }, [slotsQuery.data, selectedDay, isModalOpen]);

  // Get slots for selected mobile day
  const selectedMobileDayData = processedSlotsMap.get(format(selectedMobileDay, 'yyyy-MM-dd'));
  const selectedMobileDaySlots: ProcessedDaySlots['slots'] = selectedMobileDayData?.slots ?? [];
  const selectedMobileHasException = selectedMobileDayData?.hasException ?? false;

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
          {t('calendarLoadError')}
        </div>
      )}

      {/* Calendar Content */}
      {!slotsQuery.isLoading && !slotsQuery.isError && (
        <>
          {/* ============ DESKTOP: Full month grid (md+) ============ */}
          <div className="hidden md:block">
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
                const dayData = processedSlotsMap.get(format(day, 'yyyy-MM-dd'));
                const slots = dayData?.slots ?? [];
                const hasException = dayData?.hasException ?? false;
                const dayIsToday = isToday(day);
                const dayIsPast = isPast(day) && !dayIsToday;
                const hasSlots = slots.length > 0;
                const hasBookedSlots = slots.some(s => s.isBooked);
                const hasCancelledSlots = slots.some(s => s.isCancelled);

                return (
                  <div
                    role="button"
                    tabIndex={dayIsPast ? -1 : 0}
                    key={day.toISOString()}
                    onClick={() => !dayIsPast && handleDayClick(day)}
                    onKeyDown={(e) => {
                      if (!dayIsPast && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        handleDayClick(day);
                      }
                    }}
                    className={`aspect-square rounded-md sm:rounded-lg p-0.5 sm:p-1 overflow-hidden transition-all min-w-0 ${
                      dayIsPast
                        ? 'border border-slate-700 bg-slate-800/30 opacity-50 cursor-not-allowed'
                        : dayIsToday 
                        ? 'border-2 border-orange-500 bg-orange-500/5'
                        : hasException
                        ? 'border-2 border-purple-500/50 bg-purple-500/10 cursor-pointer hover:bg-purple-500/20'
                        : hasSlots
                          ? hasBookedSlots
                            ? 'border border-red-500/30 bg-red-500/10 cursor-pointer hover:bg-red-500/20'
                            : hasCancelledSlots
                            ? 'border border-yellow-500/30 bg-yellow-500/10 cursor-pointer hover:bg-yellow-500/20'
                            : 'border border-green-500/30 bg-green-500/10 cursor-pointer hover:bg-green-500/20'
                          : 'border border-slate-700 bg-slate-800/50'
                    }`}
                  >
                    <div className={`text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 text-center ${
                      dayIsPast
                        ? 'text-slate-600'
                        : hasException 
                        ? 'text-purple-400'
                        : hasSlots
                        ? hasBookedSlots 
                          ? 'text-red-400'
                          : hasCancelledSlots
                          ? 'text-yellow-400'
                          : 'text-green-400' 
                        : 'text-slate-500'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    {dayIsPast ? (
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
          </div>

          {/* ============ MOBILE: Horizontal day strip + single day details (< md) ============ */}
          <div className="md:hidden">
            {/* Horizontal scrollable day strip */}
            <div className="relative mb-4">
              {/* Left fade indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-slate-900/50 to-transparent z-10 pointer-events-none rounded-l-lg" />
              {/* Right fade indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-slate-900/50 to-transparent z-10 pointer-events-none rounded-r-lg" />
              
              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {daysInMonth.map((day) => {
                  const dayData = processedSlotsMap.get(format(day, 'yyyy-MM-dd'));
                  const slots = dayData?.slots ?? [];
                  const hasException = slots.some(s => s.isException);
                  const dayIsToday = isToday(day);
                  const dayIsPast = isPast(day) && !dayIsToday;
                  const isSelected = format(day, 'yyyy-MM-dd') === format(selectedMobileDay, 'yyyy-MM-dd');
                  const hasSlots = slots.length > 0;
                  const availableCount = slots.filter(s => s.available).length;
                  const bookedCount = slots.filter(s => s.isBooked).length;
                  
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => scrollToDay(day)}
                      className={`snap-center shrink-0 w-14 py-3 rounded-xl flex flex-col items-center transition-all border-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20'
                          : dayIsToday
                          ? 'border-orange-500/50 bg-orange-500/5'
                          : hasException
                          ? 'border-purple-500/50 bg-purple-500/5'
                          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                      } ${dayIsPast ? 'opacity-50' : ''}`}
                    >
                      <span className="text-[10px] text-slate-400 uppercase">
                        {format(day, 'EEEEE', { locale: dateLocale })}
                      </span>
                      <span className={`text-lg font-bold ${
                        isSelected ? 'text-orange-400' : dayIsToday ? 'text-orange-400' : 'text-white'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {/* Dot indicators for availability */}
                      <div className="flex gap-1 mt-1">
                        {availableCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />}
                        {bookedCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />}
                        {!hasSlots && !dayIsPast && <div className="w-1.5 h-1.5 rounded-full bg-slate-600/60" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots for selected day */}
            <div className="border border-slate-700 rounded-xl bg-slate-900/30 min-h-60">
              <div className={`text-center py-3 rounded-t-xl ${
                isToday(selectedMobileDay)
                  ? 'bg-orange-500/20'
                  : selectedMobileHasException
                  ? 'bg-purple-500/10'
                  : 'bg-slate-800/50'
              }`}>
                <p className="text-sm font-medium text-white">
                  {format(selectedMobileDay, 'EEEE, d MMMM', { locale: dateLocale })}
                </p>
                {selectedMobileHasException && (
                  <p className="text-xs text-purple-400 mt-1">⚠️ {t('exceptionDay')}</p>
                )}
              </div>
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {isPast(selectedMobileDay) && !isToday(selectedMobileDay) ? (
                  <p className="text-xs text-slate-500 text-center py-8">{t('pastDateNotAllowed')}</p>
                ) : selectedMobileDaySlots.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">{t('noSlots')}</p>
                ) : (
                  selectedMobileDaySlots.map((slot, idx) => {
                    const isBooked = slot.isBooked;
                    const isCancelled = slot.isCancelled;
                    const isClickable = slot.available && !isBooked;

                    const slotColor = isBooked
                      ? 'bg-red-500/20 border border-red-500/50 text-red-300 cursor-not-allowed'
                      : isCancelled
                      ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer'
                      : slot.isException
                      ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 cursor-pointer'
                      : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 cursor-pointer';

                    return (
                      <button
                        key={idx}
                        onClick={() => isClickable && handleDayClick(selectedMobileDay)}
                        disabled={!isClickable}
                        className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all ${slotColor}`}
                      >
                        {slot.time}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
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