'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { BookingConfirmModal } from './BookingConfirmModal';
import { BookingLegend } from './BookingLegend';
import { useCreateBooking } from '@/hooks/useCreateBooking';

interface BookingCalendarProps {
  instructorId: string;
  sessionDuration: number;
  minNoticeHours: number;
  instructorProfile: any; // We'll type this properly later
}

interface TimeSlot {
  time: string;
  available: boolean;
  datetime: Date;
  isException?: boolean;
}

interface DaySlots {
  date: Date;
  slots: TimeSlot[];
  hasException?: boolean;
}

export function BookingCalendar({ 
  instructorId, 
  sessionDuration,
  minNoticeHours,
  instructorProfile
}: BookingCalendarProps) {
  const t = useTranslations('Booking');
  const createBooking = useCreateBooking();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Poniedziałek
  );
  const [weekSlots, setWeekSlots] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Generate 7 days from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  useEffect(() => {
    fetchAvailableSlots();
  }, [currentWeekStart, instructorId]);

  // Reset focus when modal closes
  useEffect(() => {
    if (!showModal && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [showModal]);

  async function fetchAvailableSlots() {
    setLoading(true);
    try {
      // Fetch availability for the entire week at once
      const startDate = format(weekDays[0], 'yyyy-MM-dd');
      const endDate = format(weekDays[6], 'yyyy-MM-dd');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bookings/available-slots?instructorId=${instructorId}&startDate=${startDate}&endDate=${endDate}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch slots:', response.status, response.statusText);
        setWeekSlots(weekDays.map(date => ({ date, slots: [] })));
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Group slots by date
      const slotsByDate = new Map<string, TimeSlot[]>();
      const exceptionDates = new Set<string>();
      
      data.forEach((slot: any) => {
        const dateKey = slot.date || format(parseISO(slot.startTime), 'yyyy-MM-dd');
        if (!slotsByDate.has(dateKey)) {
          slotsByDate.set(dateKey, []);
        }
        
        if (slot.isException) {
          exceptionDates.add(dateKey);
        }
        
        const timeSlot: TimeSlot = {
          time: slot.time || format(parseISO(slot.startTime), 'HH:mm'),
          available: slot.available !== false, // Default to true if not specified
          datetime: parseISO(slot.startTime || `${dateKey}T${slot.time}`),
          isException: slot.isException || false,
        };
        
        console.log('Processing slot:', { dateKey, timeSlot });
        
        slotsByDate.get(dateKey)!.push(timeSlot);
      });
      
      // Map to week days
      const results = weekDays.map(date => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return {
          date,
          slots: slotsByDate.get(dateKey) || [],
          hasException: exceptionDates.has(dateKey),
        };
      });
      
      setWeekSlots(results);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setWeekSlots(weekDays.map(date => ({ date, slots: [] })));
    } finally {
      setLoading(false);
    }
  }

  function handlePreviousWeek() {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  }

  function handleNextWeek() {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  }

  function handleSlotClick(date: Date, time: string) {
    setSelectedSlot({ date, time });
    setShowModal(true);
  }

  function handleConfirmBooking(guestData?: { name: string; email: string; phone: string }) {
    if (!selectedSlot) return;

    // Construct ISO datetime string for booking
    const dateStr = format(selectedSlot.date, 'yyyy-MM-dd');
    const startTime = `${dateStr}T${selectedSlot.time}:00.000Z`;

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
          {format(currentWeekStart, 'd MMMM', { locale: pl })} - {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: pl })}
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
                    {format(dayData.date, 'EEE', { locale: pl })}
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
                    dayData.slots.map((slot, slotIndex) => (
                      <button
                        key={slotIndex}
                        onClick={() => slot.available && handleSlotClick(dayData.date, slot.time)}
                        disabled={!slot.available}
                        className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          slot.available
                            ? slot.isException
                              ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 cursor-pointer'
                              : 'bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 cursor-pointer'
                            : 'bg-slate-700/30 border border-slate-600 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Clock className="size-3 inline mr-1" />
                        {slot.time}
                      </button>
                    ))
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
