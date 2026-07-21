"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  parseISO,
  isToday,
  isPast,
} from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { BookingConfirmModal } from "./BookingConfirmModal";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { BookingLegend } from "./BookingLegend";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import type { DaySlots, TimeSlot } from "@/types/booking";
import type { InstructorProfile } from "@/types";

interface BookingCalendarProps {
  instructorId: string;
  instructorProfile: InstructorProfile;
  initialDate?: string;
  initialTime?: string;
}

export function BookingCalendar({
  instructorId,
  instructorProfile,
  initialDate,
  initialTime,
}: BookingCalendarProps) {
  const t = useTranslations("Booking");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;
  const createBooking = useCreateBooking();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    startOfWeek(new Date(), { weekStartsOn: 1 }),
  );
  const [weekSlots, setWeekSlots] = useState<DaySlots[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: string;
    datetime: Date;
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Mobile: currently selected day (defaults to today)
  const [selectedMobileDay, setSelectedMobileDay] = useState<Date>(new Date());
  // Preselected time from URL params (visually highlighted, user still clicks to confirm)
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>(
    initialTime,
  );

  // Generate 7 days from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i),
  );

  // Available slots query
  const startDateKey = format(weekDays[0], "yyyy-MM-dd");
  const endDateKey = format(weekDays[6], "yyyy-MM-dd");
  const slotsQuery = useAvailableSlots(instructorId, startDateKey, endDateKey);

  // Process query data
  useEffect(() => {
    processQueryData();
  }, [
    slotsQuery.data,
    slotsQuery.isLoading,
    slotsQuery.isError,
    currentWeekStart,
    instructorId,
  ]);

  // Auto-select day/time from initial props (from URL params)
  const parsedInitialDate = useMemo(
    () => (initialDate ? parseISO(initialDate) : null),
    [initialDate],
  );

  useEffect(() => {
    if (!initialDate || !initialTime || !weekSlots.length) return;

    const targetDate = parsedInitialDate!;

    // Check if target date is in the current week view
    const isInCurrentWeek = weekDays.some((d) => isSameDay(d, targetDate));

    if (isInCurrentWeek) {
      // Scroll to the day on mobile
      scrollToDay(targetDate);
      // Set preselected time for visual highlight
      setPreselectedTime(initialTime);
    } else {
      // Navigate to the correct week
      const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
      setCurrentWeekStart(weekStart);
    }
  }, [initialDate, initialTime, weekSlots, parsedInitialDate]);

  // Reset focus when modal closes
  useEffect(() => {
    if (!showModal && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, [showModal]);

  function processQueryData() {
    setLoading(slotsQuery.isLoading);

    const data = slotsQuery.data || [];

    const slotsByDate = new Map<string, TimeSlot[]>();
    const exceptionDates = new Set<string>();

    data.forEach((slot) => {
      const dateKey = format(parseISO(slot.startTime), "yyyy-MM-dd");
      if (!slotsByDate.has(dateKey)) slotsByDate.set(dateKey, []);
      if (slot.isException) exceptionDates.add(dateKey);

      const timeSlot: TimeSlot = {
        time: format(parseISO(slot.startTime), "HH:mm"),
        available: slot.available,
        datetime: parseISO(slot.startTime),
        isException: slot.isException || false,
        booking: slot.booking,
      };

      slotsByDate.get(dateKey)!.push(timeSlot);
    });

    const results = weekDays.map((date) => {
      const dateKey = format(date, "yyyy-MM-dd");
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
    const daySlots = weekSlots.find((d) => isSameDay(d.date, date));
    const slot = daySlots?.slots.find((s) => s.time === time);

    if (!slot) {
      console.error("Slot not found!");
      return;
    }

    // Clear preselection once user clicks a slot
    setPreselectedTime(undefined);
    setSelectedSlot({ date, time, datetime: slot.datetime });
    setShowModal(true);
  }

  function handleConfirmBooking(guestData?: {
    name: string;
    email: string;
    phone: string;
  }) {
    if (!selectedSlot) return;

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  function handleCloseModal() {
    setShowModal(false);
    setSelectedSlot(null);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  // Scroll to selected day in mobile view
  const scrollToDay = (date: Date) => {
    setSelectedMobileDay(date);
    const index = weekDays.findIndex((d) => isSameDay(d, date));
    if (scrollRef.current && index >= 0) {
      const children = scrollRef.current.children;
      if (children[index]) {
        children[index].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  };

  // Get slots for selected mobile day
  const selectedDaySlots = weekSlots.find((d) =>
    isSameDay(d.date, selectedMobileDay),
  );

  // Today reference for disabling past weeks
  const today = new Date();
  const canGoPrevious = currentWeekStart > today;

  // --- RENDER SLOT BUTTON (shared between mobile and desktop) ---
  const renderSlotButton = (slot: TimeSlot, date: Date) => {
    const isCancelled = slot.booking?.status === "CANCELLED";
    const isBooked = slot.booking && !isCancelled;
    const isPreselected =
      preselectedTime === slot.time &&
      isSameDay(date, parseISO(initialDate || ""));

    const slotColor = isPreselected
      ? "bg-orange-500/30 border-2 border-orange-400 text-orange-300 cursor-pointer ring-2 ring-orange-500/50"
      : isBooked
        ? "bg-red-500/20 border border-red-500/50 text-red-300 cursor-not-allowed"
        : isCancelled
          ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/30 cursor-pointer"
          : slot.available
            ? slot.isException
              ? "bg-purple-500/20 border border-purple-500/50 text-purple-300 hover:bg-purple-500/30 cursor-pointer"
              : "bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 cursor-pointer"
            : "bg-slate-700/30 border border-slate-600 text-slate-500 cursor-not-allowed";

    const isClickable = slot.available && !isBooked;

    return (
      <button
        key={slot.time}
        onClick={() => isClickable && handleSlotClick(date, slot.time)}
        disabled={!isClickable}
        className={`w-full px-2 py-2 rounded-lg text-xs font-medium transition-all ${slotColor}`}
        title={
          isPreselected
            ? t("clickToConfirm")
            : isBooked
              ? t("bookedSlotTitle", { clientName: slot.booking!.clientName })
              : isCancelled
                ? t("cancelledSlotTitle", {
                    clientName: slot.booking!.clientName,
                  })
                : undefined
        }
      >
        <Clock className="size-3 inline mr-1" />
        {slot.time}
        {isPreselected && (
          <span className="block text-[10px] text-orange-400 font-normal mt-0.5">
            {t("selected")}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6">
      {/* Header with Week Navigation */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={!canGoPrevious}
          className="border-slate-600 shrink-0"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <h2 className="text-base md:text-xl font-semibold text-white px-2 text-center">
          <span className="hidden md:inline">
            {format(currentWeekStart, "d MMMM", { locale: dateLocale })} -{" "}
            {format(addDays(currentWeekStart, 6), "d MMMM yyyy", {
              locale: dateLocale,
            })}
          </span>
          <span className="md:hidden">
            {format(currentWeekStart, "d")} -{" "}
            {format(addDays(currentWeekStart, 6), "d MMMM", {
              locale: dateLocale,
            })}
          </span>
        </h2>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          className="border-slate-600 shrink-0"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* ============ DESKTOP: 7-column grid (md+) ============ */}
      {loading ? (
        <div className="flex justify-center items-center min-h-100 text-slate-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          {/* Desktop Grid */}
          <div className="hidden md:grid grid-cols-7 gap-2">
            {weekSlots.map((dayData, dayIndex) => {
              const _isToday = isSameDay(dayData.date, today);
              const _isPast = isPast(dayData.date) && !_isToday;

              return (
                <div
                  key={dayIndex}
                  className={`border rounded-lg overflow-hidden ${
                    _isToday
                      ? "border-orange-500 bg-orange-500/5"
                      : dayData.hasException
                        ? "border-purple-500/50 bg-purple-500/5"
                        : "border-slate-700 bg-slate-900/30"
                  }`}
                >
                  {/* Day Header */}
                  <div
                    className={`text-center py-3 ${
                      _isToday
                        ? "bg-orange-500/20"
                        : dayData.hasException
                          ? "bg-purple-500/10"
                          : "bg-slate-800/50"
                    }`}
                  >
                    <p className="text-xs text-slate-400 uppercase mb-1">
                      {format(dayData.date, "EEE", { locale: dateLocale })}
                    </p>
                    <p className="text-lg font-bold">
                      {format(dayData.date, "d")}
                    </p>
                  </div>

                  {/* Time Slots */}
                  <div className="flex-1 space-y-2 p-2 bg-slate-900/30 rounded-b-lg min-h-100">
                    {_isPast ? (
                      <p className="text-xs text-slate-500 text-center pt-4">
                        {t("pastDate")}
                      </p>
                    ) : dayData.slots.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center pt-4">
                        {t("noSlots")}
                      </p>
                    ) : (
                      dayData.slots.map((slot) =>
                        renderSlotButton(slot, dayData.date),
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ============ MOBILE: Horizontal day strip + single day slots (< md) ============ */}
          <div className="md:hidden">
            {/* Horizontal scrollable day strip */}
            <div className="relative mb-4">
              {/* Left fade indicator */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r from-slate-800/50 to-transparent z-10 pointer-events-none" />
              {/* Right fade indicator */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l from-slate-800/50 to-transparent z-10 pointer-events-none" />

              <div
                ref={scrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {weekSlots.map((dayData, dayIndex) => {
                  const _isToday = isSameDay(dayData.date, today);
                  const _isPast = isPast(dayData.date) && !_isToday;
                  const isSelected = isSameDay(dayData.date, selectedMobileDay);
                  const hasSlots = dayData.slots.length > 0;
                  const bookedCount = dayData.slots.filter(
                    (s) => s.booking && s.booking.status !== "CANCELLED",
                  ).length;
                  const availableCount = dayData.slots.filter(
                    (s) => s.available && !s.booking,
                  ).length;

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => scrollToDay(dayData.date)}
                      className={`snap-center shrink-0 w-16 py-3 rounded-xl flex flex-col items-center transition-all border-2 ${
                        isSelected
                          ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20"
                          : _isToday
                            ? "border-orange-500/50 bg-orange-500/5"
                            : dayData.hasException
                              ? "border-purple-500/50 bg-purple-500/5"
                              : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                      } ${_isPast && !_isToday ? "opacity-50" : ""}`}
                    >
                      <span className="text-xs text-slate-400 uppercase">
                        {format(dayData.date, "EEEEE", { locale: dateLocale })}
                      </span>
                      <span
                        className={`text-lg font-bold ${
                          isSelected
                            ? "text-orange-400"
                            : _isToday
                              ? "text-orange-400"
                              : "text-white"
                        }`}
                      >
                        {format(dayData.date, "d")}
                      </span>
                      {/* Dot indicators for availability */}
                      <div className="flex gap-1 mt-1">
                        {availableCount > 0 && (
                          <div className="w-2 h-2 rounded-full bg-green-500/60" />
                        )}
                        {bookedCount > 0 && (
                          <div className="w-2 h-2 rounded-full bg-red-500/60" />
                        )}
                        {hasSlots === false && !_isPast && (
                          <div className="w-2 h-2 rounded-full bg-slate-600/60" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slots for selected day */}
            <div className="border border-slate-700 rounded-xl bg-slate-900/30 min-h-60">
              <div
                className={`text-center py-3 rounded-t-xl ${
                  isToday(selectedMobileDay)
                    ? "bg-orange-500/20"
                    : selectedDaySlots?.hasException
                      ? "bg-purple-500/10"
                      : "bg-slate-800/50"
                }`}
              >
                <p className="text-sm font-medium text-white">
                  {format(selectedMobileDay, "EEEE, d MMMM", {
                    locale: dateLocale,
                  })}
                </p>
                {selectedDaySlots?.hasException && (
                  <p className="text-xs text-purple-400 mt-1">
                    ⚠️ {t("exceptionDay") || "Wyjątkowy dzień"}
                  </p>
                )}
              </div>
              <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                {isPast(selectedMobileDay) && !isToday(selectedMobileDay) ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    {t("pastDate")}
                  </p>
                ) : selectedDaySlots?.slots.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">
                    {t("noSlots")}
                  </p>
                ) : (
                  selectedDaySlots?.slots.map((slot) =>
                    renderSlotButton(slot, selectedDaySlots.date),
                  )
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
          <BookingLegend />

          {/* Cancellation policy note */}
          {(instructorProfile.minNoticeHours ?? 0) > 0 && (
            <p className="text-xs text-slate-500 text-center mt-3">
              {t("cancellationPolicyHint", {
                hours: instructorProfile.minNoticeHours ?? 0,
              })}
            </p>
          )}
        </>
      )}

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
