export interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface AvailabilityException {
  id: string;
  date: string;
  isAvailable: boolean;
  startTime: string | null;
  endTime: string | null;
}

export interface MonthlyCalendarPreviewProps {
  // No props needed - component fetches data internally
}
