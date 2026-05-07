'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { MonthlyCalendarPreview } from './monthly-calendar-preview';
import { useMyInstructorProfile } from '@/hooks/useMyInstructorProfile';
import type { DaySchedule, AvailabilityException } from '@/types/availability';
import { DAYS_OF_WEEK } from '@/constants/availability';

export function WeeklySchedule() {
  const t = useTranslations('Dashboard.availability');
  const { data: instructorProfile } = useMyInstructorProfile();
  
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExceptions = useCallback(async () => {
    try {
      const response = await apiClient.get<AvailabilityException[]>('/availability/exceptions');
      setExceptions(response.data);
    } catch (error) {
      console.error('Failed to fetch exceptions:', error);
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
    
    window.addEventListener('exceptionsUpdated', handleExceptionsUpdate);
    return () => window.removeEventListener('exceptionsUpdated', handleExceptionsUpdate);
  }, [fetchExceptions]);

  const fetchSchedule = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/weekly`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) throw new Error('Failed to fetch schedule');

      const data = await response.json();
      
      const fullSchedule = DAYS_OF_WEEK.map((dayOfWeek) => {
        const existingDay = data.find((d: any) => d.dayOfWeek === dayOfWeek);
        
        if (existingDay) {
          return {
            dayOfWeek,
            isAvailable: true,
            startTime: existingDay.startTime,
            endTime: existingDay.endTime,
          };
        } else {
          return {
            dayOfWeek,
            isAvailable: false,
            startTime: '09:00',
            endTime: '17:00',
          };
        }
      });
      
      setSchedule(fullSchedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error(t('saveError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDay = (dayOfWeek: number, isAvailable: boolean) => {
    setSchedule((prev) => {
      const existing = prev.find((d) => d.dayOfWeek === dayOfWeek);
      if (existing) {
        return prev.map((d) =>
          d.dayOfWeek === dayOfWeek ? { ...d, isAvailable } : d
        );
      } else {
        return [
          ...prev,
          {
            dayOfWeek,
            isAvailable,
            startTime: '09:00',
            endTime: '17:00',
          },
        ];
      }
    });
  };

  const handleTimeChange = (
    dayOfWeek: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
  };

  const handleSave = async () => {
    const fullSchedule = DAYS_OF_WEEK.map((dayOfWeek) => {
      const existing = schedule.find((d) => d.dayOfWeek === dayOfWeek);
      return existing || {
        dayOfWeek,
        isAvailable: false,
        startTime: '09:00',
        endTime: '17:00',
      };
    });

    for (const day of fullSchedule) {
      if (day.isAvailable && day.startTime >= day.endTime) {
        toast.error(t('endBeforeStart'));
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/availability/weekly`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ schedule: fullSchedule }),
        }
      );

      if (!response.ok) throw new Error('Failed to save schedule');

      toast.success(t('saveSuccess'));

      await fetchSchedule();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      toast.error(t('saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
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
      <MonthlyCalendarPreview 
        key={JSON.stringify(exceptions)}
        schedule={schedule} 
        sessionDuration={instructorProfile?.sessionDuration || 60}
        exceptions={exceptions}
      />

      {DAYS_OF_WEEK.map((dayOfWeek) => {
        const daySchedule = schedule.find((d) => d.dayOfWeek === dayOfWeek) || {
          dayOfWeek,
          isAvailable: false,
          startTime: '09:00',
          endTime: '17:00',
        };

        return (
          <div
            key={dayOfWeek}
            className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
          >
            <label
              htmlFor={`day-${dayOfWeek}`}
              className="flex items-center gap-3 cursor-pointer min-w-45"
            >
              <Checkbox
                id={`day-${dayOfWeek}`}
                checked={daySchedule.isAvailable}
                onCheckedChange={(checked: boolean) =>
                  handleToggleDay(dayOfWeek, checked)
                }
                className="h-5 w-5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
              />
              <span className="text-white font-medium text-base">
                {getDayName(dayOfWeek)}
              </span>
            </label>

            {/* Time Inputs */}
            {daySchedule.isAvailable ? (
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={daySchedule.startTime}
                    onChange={(e) =>
                      handleTimeChange(dayOfWeek, 'startTime', e.target.value)
                    }
                    style={{ colorScheme: 'dark' }}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
                <span className="text-slate-400">—</span>
                <input
                  type="time"
                  value={daySchedule.endTime}
                  onChange={(e) =>
                    handleTimeChange(dayOfWeek, 'endTime', e.target.value)
                  }
                  style={{ colorScheme: 'dark' }}
                  className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                />
              </div>
            ) : (
              <span className="text-slate-500 text-sm">{t('unavailable')}</span>
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
          {isSaving ? t('saving') : t('save')}
        </Button>
      </div>
    </div>
  );
}
