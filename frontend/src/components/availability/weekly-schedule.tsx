"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";
import { MonthlyCalendarPreview } from "./monthly-calendar-preview";
import { TimePicker } from "./time-picker";
import type {
  DaySchedule,
  AvailabilityException,
  TimeRange,
} from "@/types/availability";
import type { ApiAvailabilitySlot } from "@/types/availability";
import { DAYS_OF_WEEK } from "@/constants/availability";
import { Plus, X } from "lucide-react";

export function WeeklySchedule() {
  const t = useTranslations("Dashboard.availability");
  const queryClient = useQueryClient();

  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExceptions = useCallback(async () => {
    try {
      const response = await apiClient.get<AvailabilityException[]>(
        "/availability/exceptions",
      );
      setExceptions(response.data);
    } catch (error) {
      console.error("Failed to fetch exceptions:", error);
    }
  }, []);

  // Load existing schedule
  useEffect(() => {
    fetchSchedule();
    fetchExceptions();

    // Listen for exception updates from ExceptionsList
    const handleExceptionsUpdate = () => {
      fetchExceptions();
    };

    window.addEventListener("exceptionsUpdated", handleExceptionsUpdate);
    return () =>
      window.removeEventListener("exceptionsUpdated", handleExceptionsUpdate);
  }, [fetchExceptions]);

  const fetchSchedule = async () => {
    try {
      const response = await apiClient.get<ApiAvailabilitySlot[]>(
        "/availability/weekly",
      );
      const data = response.data;

      const fullSchedule: DaySchedule[] = DAYS_OF_WEEK.map((dayOfWeek) => {
        const existingDays = data.filter((d) => d.dayOfWeek === dayOfWeek);

        if (existingDays.length > 0) {
          return {
            dayOfWeek,
            isAvailable: existingDays.some((d) => d.isActive),
            timeRanges: existingDays
              .filter((d) => d.isActive)
              .map((d) => ({
                startTime: d.startTime,
                endTime: d.endTime,
              })),
          };
        } else {
          return {
            dayOfWeek,
            isAvailable: false,
            timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
          };
        }
      });

      setSchedule(fullSchedule);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      toast.error(t("saveError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number, isAvailable: boolean) => {
    setSchedule((prev) => {
      const existing = prev.find((d) => d.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map((d) =>
          d.dayOfWeek === dayOfWeek
            ? {
                ...d,
                isAvailable,
                timeRanges: isAvailable
                  ? d.timeRanges.length > 0
                    ? d.timeRanges
                    : [{ startTime: "09:00", endTime: "17:00" }]
                  : d.timeRanges,
              }
            : d,
        );
      } else {
        return [
          ...prev,
          {
            dayOfWeek,
            isAvailable,
            timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
          },
        ];
      }
    });
  };

  const handleRangeTimeChange = (
    dayOfWeek: number,
    rangeIndex: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              timeRanges: d.timeRanges.map((r, i) =>
                i === rangeIndex ? { ...r, [field]: value } : r,
              ),
            }
          : d,
      ),
    );
  };

  const handleAddRange = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              timeRanges: [
                ...d.timeRanges,
                { startTime: "09:00", endTime: "17:00" },
              ],
            }
          : d,
      ),
    );
  };

  const handleRemoveRange = (dayOfWeek: number, rangeIndex: number) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              timeRanges: d.timeRanges.filter((_, i) => i !== rangeIndex),
            }
          : d,
      ),
    );
  };

  const handleSave = async () => {
    const fullSchedule = DAYS_OF_WEEK.map((dayOfWeek) => {
      const existing = schedule.find((d) => d.dayOfWeek === dayOfWeek);
      return (
        existing || {
          dayOfWeek,
          isAvailable: false,
          timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
        }
      );
    });

    // Validate all time ranges
    for (const day of fullSchedule) {
      if (!day.isAvailable) continue;

      for (const range of day.timeRanges) {
        if (range.startTime >= range.endTime) {
          toast.error(t("endBeforeStart"));
          return;
        }
      }

      // Check for overlapping ranges within the same day
      const sorted = [...day.timeRanges].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1].endTime > sorted[i].startTime) {
          toast.error(t("overlappingRanges"));
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      // Flatten schedule: each time range becomes a separate availability record
      const flatSchedule = fullSchedule.flatMap((day) => {
        if (!day.isAvailable) {
          return [
            {
              dayOfWeek: day.dayOfWeek,
              isAvailable: false,
              startTime: "09:00",
              endTime: "17:00",
            },
          ];
        }
        return day.timeRanges.map((range) => ({
          dayOfWeek: day.dayOfWeek,
          isAvailable: true,
          startTime: range.startTime,
          endTime: range.endTime,
        }));
      });

      await apiClient.post("/availability/weekly", {
        schedule: flatSchedule,
      });

      toast.success(t("saveSuccess"));

      await fetchSchedule();

      // Invalidate available slots so the calendar preview updates immediately
      queryClient.invalidateQueries({ queryKey: ["availableSlots"] });
    } catch (error: any) {
      console.error("Error saving schedule:", error);
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return t(`days.${dayNames[dayOfWeek]}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Monthly Calendar Preview */}
      <MonthlyCalendarPreview />

      {DAYS_OF_WEEK.map((dayOfWeek) => {
        const daySchedule = schedule.find((d) => d.dayOfWeek === dayOfWeek) || {
          dayOfWeek,
          isAvailable: false,
          timeRanges: [{ startTime: "09:00", endTime: "17:00" }],
        };

        return (
          <div
            key={dayOfWeek}
            className="flex flex-col gap-3 p-3 sm:p-4 bg-slate-900/50 rounded-lg border border-slate-700"
          >
            {/* Day Name with Checkbox */}
            <label
              htmlFor={`day-${dayOfWeek}`}
              className="flex items-center gap-3 cursor-pointer"
            >
              <Checkbox
                id={`day-${dayOfWeek}`}
                checked={daySchedule.isAvailable}
                onCheckedChange={(checked: boolean) =>
                  handleToggleDay(dayOfWeek, checked)
                }
                className="h-5 w-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 shrink-0"
              />
              <span className="text-white font-medium text-base">
                {getDayName(dayOfWeek)}
              </span>
            </label>

            {/* Time Ranges */}
            {daySchedule.isAvailable ? (
              <div className="flex flex-col gap-2 pl-0 sm:pl-8">
                {daySchedule.timeRanges.map((range, rangeIndex) => (
                  <div
                    key={rangeIndex}
                    className="flex items-center gap-1.5 sm:gap-2"
                  >
                    <TimePicker
                      value={range.startTime}
                      onChange={(value) =>
                        handleRangeTimeChange(
                          dayOfWeek,
                          rangeIndex,
                          "startTime",
                          value,
                        )
                      }
                      className="flex-1"
                    />
                    <span className="text-slate-400 shrink-0">—</span>
                    <TimePicker
                      value={range.endTime}
                      onChange={(value) =>
                        handleRangeTimeChange(
                          dayOfWeek,
                          rangeIndex,
                          "endTime",
                          value,
                        )
                      }
                      className="flex-1"
                    />
                    {daySchedule.timeRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRange(dayOfWeek, rangeIndex)}
                        className="p-1.5 rounded-md hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors shrink-0"
                        aria-label={t("removeRange")}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddRange(dayOfWeek)}
                  className="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-300 transition-colors self-start mt-1"
                >
                  <Plus className="w-4 h-4" />
                  {t("addRange")}
                </button>
              </div>
            ) : (
              <span className="text-slate-500 text-sm pl-0 sm:pl-8">
                {t("unavailable")}
              </span>
            )}
          </div>
        );
      })}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white h-11 px-8 py-2.5 text-base font-semibold"
        >
          {isSaving ? t("saving") : t("save")}
        </Button>
      </div>
    </div>
  );
}
