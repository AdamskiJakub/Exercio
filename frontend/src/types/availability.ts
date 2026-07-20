export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  dayOfWeek: number;
  isAvailable: boolean;
  timeRanges: TimeRange[];
}

/** Raw availability slot as returned by the API */
export interface ApiAvailabilitySlot {
  id: string;
  instructorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
