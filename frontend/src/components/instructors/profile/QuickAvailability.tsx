"use client";

import { useMemo, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  format,
  addDays,
  parseISO,
  isSameDay,
  isPast,
  isToday,
} from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { Clock, Calendar, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAvailableSlots } from "@/hooks/useAvailableSlots";
import { Button } from "@/components/ui/button";

interface QuickAvailabilityProps {
  instructorProfileId: string;
  username: string;
  onSlotClick?: (date: string, time: string) => void;
}

export function QuickAvailability({
  instructorProfileId,
  username,
  onSlotClick,
}: QuickAvailabilityProps) {
  const t = useTranslations("InstructorProfile");
  const locale = useLocale();
  const dateLocale = locale === "pl" ? pl : enUS;
  const router = useRouter();

  // Fetch next 3 days of slots
  const today = new Date();
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addDays(today, 3), "yyyy-MM-dd");

  const {
    data: slots,
    isLoading,
    isError,
  } = useAvailableSlots(instructorProfileId, startDate, endDate);

  // Group slots by day, filter to available ones only
  const slotsByDay = useMemo(() => {
    if (!slots) return [];

    const dayMap = new Map<string, { date: string; times: string[] }>();

    for (const slot of slots) {
      if (!slot.available) continue;
      const slotDate = parseISO(slot.startTime);
      if (isPast(slotDate) && !isToday(slotDate)) continue;

      const dateKey = format(slotDate, "yyyy-MM-dd");
      const timeStr = format(slotDate, "HH:mm");

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, { date: dateKey, times: [] });
      }
      dayMap.get(dateKey)!.times.push(timeStr);
    }

    // Convert to array, sort by date, limit to 3 days, show ALL slots (no limit)
    return Array.from(dayMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 3);
  }, [slots]);

  const handleSlotClick = useCallback(
    (date: string, time: string) => {
      if (onSlotClick) {
        onSlotClick(date, time);
      } else {
        // Fallback: navigate to book page
        router.push(
          `/instructors/${username}/book?date=${date}&time=${time}#booking-calendar`,
        );
      }
    },
    [onSlotClick, router, username],
  );

  const handleFullCalendar = useCallback(() => {
    // Navigate to the full booking page
    router.push(`/instructors/${username}/book`);
  }, [router, username]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 lg:p-10">
      <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <Calendar className="size-5 text-orange-500" />
        {t("nearestAvailableSlots")}
      </h2>
      <p className="text-sm text-slate-400 mb-8">{t("chooseHour")}</p>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-5 w-40 bg-slate-700 rounded mb-4" />
              <div className="flex flex-wrap gap-3">
                <div className="h-12 w-24 bg-slate-700 rounded-xl" />
                <div className="h-12 w-24 bg-slate-700 rounded-xl" />
                <div className="h-12 w-24 bg-slate-700 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-10">
          <p className="text-slate-400 mb-4">{t("errorLoadingSlots")}</p>
          <Button
            variant="outline"
            onClick={handleFullCalendar}
            className="cursor-pointer border-slate-600"
          >
            {t("seeFullCalendar")}
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && slotsByDay.length === 0 && (
        <div className="text-center py-10">
          <p className="text-slate-400 mb-4">{t("noUpcomingSlots")}</p>
          <Button
            variant="outline"
            onClick={handleFullCalendar}
            className="cursor-pointer border-slate-600"
          >
            {t("seeFullCalendar")}
          </Button>
        </div>
      )}

      {/* Slots Grid */}
      {!isLoading && !isError && slotsByDay.length > 0 && (
        <div className="space-y-7">
          {slotsByDay.map((day) => {
            const dayDate = parseISO(day.date);
            const isTodayDate = isToday(dayDate);
            const dayName = isTodayDate
              ? t("today")
              : format(dayDate, "EEEE", { locale: dateLocale });
            const dayNumber = format(dayDate, "d MMMM", { locale: dateLocale });

            return (
              <div key={day.date}>
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className={`text-base font-semibold ${isTodayDate ? "text-orange-400" : "text-white"}`}
                  >
                    {dayName}
                  </span>
                  <span className="text-sm text-slate-500">{dayNumber}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {day.times.map((time) => (
                    <button
                      key={`${day.date}-${time}`}
                      onClick={() => handleSlotClick(day.date, time)}
                      className="cursor-pointer px-6 py-3 bg-green-500/15 border border-green-500/40 text-green-400 rounded-xl text-base font-semibold hover:bg-green-500/25 hover:border-green-500/60 transition-all hover:scale-105 active:scale-95"
                    >
                      <Clock className="size-4 inline mr-2" />
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Full Calendar Link */}
          <div className="pt-6 border-t border-slate-700">
            <button
              onClick={handleFullCalendar}
              className="cursor-pointer flex items-center gap-2 text-orange-400 hover:text-orange-300 transition-colors text-base font-medium"
            >
              {t("seeFullCalendar")}
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
