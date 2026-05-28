'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { pl, enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { BookingConfirmModal } from './BookingConfirmModal';
import { useAvailableSlots } from '@/hooks/useAvailableSlots';
import { BookingLegend } from './BookingLegend';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import type { DaySlots, TimeSlot } from '@/types/booking';
import type { InstructorProfile } from '@/types';

interface BookingCalendarProps {
  instructorId: string;
  instructorProfile: InstructorProfile;
}

export function BookingCalendar({ 
  instructorId,
  instructorProfile
}: BookingCalendarProps) {
  const t = useTranslations('Booking');
  const locale = useLocale();
  const dateLocale = locale === 'pl' ? pl : enUS;
  const createBooking = useCreateBooking();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [weekSlots, setWeekSlots] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string; datetime: Date } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Generate 7 days from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  // Available slots query
  const startDateKey = format(weekDays[0], 'yyyy-MM-dd');
  const endDateKey = format(weekDays[6], 'yyyy-MM-dd');
  const slotsQuery = useAvailableSlots(instructorId, startDateKey, endDateKey);

  // COPILOT FIX: Include query status in dependencies to handle loading/error states
  useEffect(() => {
    processQueryData();
  }, [slotsQuery.data, slotsQuery.isLoading, slotsQuery.isError, currentWeekStart, instructorId]);

  // Reset focus when modal closes
  useEffect(() => {
    if (!showModal && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [showModal]);

  async function fetchAvailableSlots() {
    // deprecated: processing is handled by processQueryData
  }

  function processQueryData() {
    setLoading(slotsQuery.isLoading);

    const data = slotsQuery.data || [];

    const slotsByDate = new Map<string, TimeSlot[]>();
    const exceptionDates = new Set<string>();

    data.forEach((slot) => {
      const dateKey = format(parseISO(slot.startTime), 'yyyy-MM-dd');
      if (!slotsByDate.has(dateKey)) slotsByDate.set(dateKey, []);
      if (slot.isException) exceptionDates.add(dateKey);

      const timeSlot: TimeSlot = {
        time: format(parseISO(slot.startTime), 'HH:mm'),
        available: slot.available,
        datetime: parseISO(slot.startTime),
        isException: slot.isException || false,
        booking: slot.booking,
      };

      slotsByDate.get(dateKey)!.push(timeSlot);
    });

    const results = weekDays.map(date => {
      const dateKey = format(date, 'yyyy-MM-dd');
      return {
        date,
        slots: slotsByDate.get(dateKey) || [],
        hasException: exceptionDates.has(dateKey),
      };
    });

    setWeekSlots(results);
  }

  function handlePreviousWeek() {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  }

  function handleNextWeek() {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  }

  function handleSlotClick(date: Date, time: string) {
    // Find the actual slot to get the datetime
    const daySlots = weekSlots.find(d => isSameDay(d.date, date));
    const slot = daySlots?.slots.find(s => s.time === time);
    
    if (!slot) {
      console.error('Slot not found!');
      return;
    }
    
    setSelectedSlot({ date, time, datetime: slot.datetime });
    setShowModal(true);
  }

  function handleConfirmBooking(guestData?: { name: string; email: string; phone: string }) {
    if (!selectedSlot) return;

    // IMPORTANT: slot.datetime is already in UTC from backend
    // We need to use it directly, not construct from date + time string
    const startTime = selectedSlot.datetime.toISOString();

    createBooking.mutate({
      instructorId,
      startTime,
      ...(guestData && {
        guestName: guestData.name,
        guestEmail: guestData.email,
        guestPhone: guestData.phone,
      }),
    });

    setShowModal(false);
    setSelectedSlot(null);
    // Remove focus from any active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedSlot(null);
    // Remove focus from any active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  const today = new Date();
  const canGoPrevious = currentWeekStart > today;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={!canGoPrevious}
          className="border-slate-600"
        >
          <ChevronLeft className="size-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-white">
          {format(currentWeekStart, 'd MMMM', { locale: dateLocale })} - {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: dateLocale })}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          className="border-slate-600"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-100 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekSlots.map((dayData, dayIndex) => {
            const isToday = isSameDay(dayData.date, today);
            const isPast = dayData.date < today && !isToday;

            return (
              <div
                key={dayIndex}
                className={`border rounded-lg overflow-hidden ${
                  isToday
                    ? 'border-orange-500 bg-orange-500/5'
                    : dayData.hasException
                    ? 'border-purple-500/50 bg-purple-500/5'
                    : 'border-slate-700 bg-slate-900/30'
                }`}
              >
                {/* Day Header */}
                <div className={`text-center py-3 ${
                  isToday 
                    ? 'bg-orange-500/20' 
                    : dayData.hasException
                    ? 'bg-purple-500/10'
                    : 'bg-slate-800/50'
                }`}>
                  <p className="text-xs text-slate-400 uppercase mb-1">
                    {format(dayData.date, 'EEE', { locale: dateLocale })}
                  </p>
                  <p className="text-lg font-bold">{format(dayData.date, 'd')}</p>
                </div>

                {/* Time Slots */}
                <div className="flex-1 space-y-2 p-2 bg-slate-900/30 rounded-b-lg min-h-100">
                  {isPast ? (
                    <p className="text-xs text-slate-500 text-center pt-4">{t('pastDate')}</p>
                  ) : dayData.slots.length === 0 ? (
                    <p className="text-xs text-slate-500 text-center pt-4">{t('noSlots')}</p>
                  ) : (
                    dayData.slots.map((slot, slotIndex) => {
                      // Determine slot color based on status
                      const isCancelled = slot.booking?.status === 'CANCELLED';
                      const isBooked = slot.booking && !isCancelled;
                      
                      const slotColor = isBooked
                        ? 'bg-red-500/20 border border-red-500/50 text-red-300 cursor-not-allowed'
                        : isCancelled
                        ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer'
                        : slot.available
                        ? slot.isException
                          ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 cursor-pointer'
                          : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 cursor-pointer'
                        : 'bg-slate-700/30 border border-slate-600 text-slate-500 cursor-not-allowed';
                      
                      const isClickable = slot.available && !isBooked;
                      
                      return (
                        <button
                          key={slotIndex}
                          onClick={() => isClickable && handleSlotClick(dayData.date, slot.time)}
                          disabled={!isClickable}
                          className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all ${slotColor}`}
                          title={
                            isBooked 
                              ? t('bookedSlotTitle', { clientName: slot.booking!.clientName })
                              : isCancelled
                              ? t('cancelledSlotTitle', { clientName: slot.booking!.clientName })
                              : undefined
                          }
                        >
                          <Clock className="size-3 inline mr-1" />
                          {slot.time}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <BookingLegend />

      {/* Booking Confirmation Modal */}
      {selectedSlot && (
        <BookingConfirmModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBooking}
          selectedDate={selectedSlot.date}
          selectedTime={selectedSlot.time}
          instructorProfile={instructorProfile}
        />
      )}
    </div>
  );
}
