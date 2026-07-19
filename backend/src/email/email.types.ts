export type Language = 'pl' | 'en';

export interface BookingDetails {
  instructorName: string;
  instructorPhone?: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
}

export interface BookingGuestDetails extends BookingDetails {
  bookingId: string;
  cancellationToken: string;
}

export interface CancellationByInstructorDetails {
  instructorName: string;
  date: string;
  time: string;
  reason?: string;
}

export interface CancellationByClientDetails {
  clientName: string;
  date: string;
  time: string;
  reason?: string;
}

export interface ManualBookingDetails {
  instructorName: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
}

export interface ClientAcceptedManualBookingDetails {
  clientName: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
}

export interface InstructorBookingNotificationDetails {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration: number;
  price?: number;
  isManual?: boolean;
}

export interface VerificationEmailContent {
  title: string;
  subtitle: string;
  expires: string;
  footer: string;
}

export interface PasswordResetEmailContent {
  title: string;
  subtitle: string;
  codeLabel: string;
  expires: string;
  footer: string;
}

export interface BookingEmailContent {
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  priceLabel: string;
  minutes: string;
  cancelInfo?: string;
  cancelButton?: string | null;
  dashboardUrl?: string;
  footer: string;
}

export interface InfoEmailContent {
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  priceLabel: string;
  minutes: string;
  info?: string;
  footer: string;
  clientLabel?: string;
  clientEmailLabel?: string;
  clientPhoneLabel?: string;
}

export interface BuildInfoDetails {
  date: string;
  time: string;
  duration: number;
  price?: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export interface CancellationEmailContent {
  title: string;
  subtitle: string;
  dateLabel: string;
  timeLabel: string;
  reasonLabel: string;
  footer: string;
}

export interface ReviewInvitationEmailContent {
  title: string;
  subtitle: string;
  instructorName: string;
  dateLabel: string;
  timeLabel: string;
  durationLabel: string;
  minutes: string;
  reviewButton: string;
  footer: string;
}

export interface EnterpriseLeadDetails {
  id: string;
  companyName: string;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  message?: string;
}

export interface EnterpriseLeadNotificationContent {
  title: string;
  subtitle: string;
  companyLabel: string;
  emailLabel: string;
  phoneLabel: string;
  websiteLabel: string;
  cityLabel: string;
  messageLabel: string;
  leadIdLabel: string;
  approveHint: string;
  footer: string;
}

export interface EnterpriseAccountActivationContent {
  title: string;
  subtitle: string;
  activateButton: string;
  footer: string;
}
