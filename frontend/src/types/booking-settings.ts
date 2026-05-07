export interface BookingSettingsProps {
  profileId: string;
  initialSettings?: {
    isBookingEnabled: boolean;
    sessionDuration: number;
    sessionPrice: number | null;
    minNoticeHours: number;
  };
}