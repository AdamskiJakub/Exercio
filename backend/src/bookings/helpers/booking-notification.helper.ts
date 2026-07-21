import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../email/email.service';
import type { Language } from '../../email/email.types';

/**
 * Shared type for a booking record that has the relations needed for notifications.
 * This is intentionally loose — it matches what Prisma returns from various
 * `include` clauses across creation and cancellation flows.
 */
export interface NotifiableBooking {
  id: string;
  startTime: Date | null;
  duration: number | null;
  price: number | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  cancellationToken?: string | null;
  client?: {
    id?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  instructorUser?: {
    id?: string;
    email?: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    instructorProfile?: {
      id?: string;
      sessionDuration?: number;
      sessionPrice?: number | null;
    } | null;
  } | null;
}

/**
 * Centralized email notification dispatch for booking events.
 *
 * Extracts all date/time formatting, name resolution, and email-sending logic
 * that was previously duplicated across every creation/cancellation method.
 */
@Injectable()
export class BookingNotificationHelper {
  private readonly logger = new Logger(BookingNotificationHelper.name);

  constructor(private readonly emailService: EmailService) {}

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /**
   * Send only the instructor notification about a new booking request (no email to client).
   * Used when a client creates a PENDING booking — the confirmation email is sent later
   * when the instructor confirms.
   */
  sendInstructorNewBookingRequestNotification(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    this.sendInstructorNewBookingNotification(booking, language);
  }

  /**
   * Send "booking pending" notification to a registered client (when they create a booking).
   * Tells them the booking awaits instructor confirmation, with instructor details.
   */
  sendBookingPendingToClient(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const instructorPhone = booking.instructorUser?.phone || undefined;
    const dashboardUrl = this.buildDashboardUrl(language);

    const clientEmail = booking.client?.email;
    if (clientEmail) {
      this.emailService
        .sendBookingPendingClient(
          clientEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
            instructorPhone,
          },
          dashboardUrl,
        )
        .catch((err) =>
          this.logger.error(
            'Failed to send booking pending notification to client',
            err,
          ),
        );
    }
  }

  /**
   * Send "booking pending" notification to a guest (when they create a booking).
   * Tells them the booking awaits instructor confirmation, with instructor details.
   */
  sendBookingPendingToGuest(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const instructorPhone = booking.instructorUser?.phone || undefined;
    const cancellationUrl = this.buildCancellationUrl(booking, language);

    const guestEmail = booking.guestEmail;
    if (guestEmail) {
      this.emailService
        .sendBookingPendingGuest(
          guestEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
            instructorPhone,
          },
          cancellationUrl,
        )
        .catch((err) =>
          this.logger.error(
            'Failed to send booking pending notification to guest',
            err,
          ),
        );
    }
  }

  /**
   * Send booking confirmation to a registered client.
   */
  sendBookingConfirmationToClient(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const dashboardUrl = this.buildDashboardUrl(language);

    const clientEmail = booking.client?.email;
    if (clientEmail) {
      this.emailService
        .sendBookingConfirmationClient(
          clientEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
          },
          dashboardUrl,
        )
        .catch((err) =>
          this.logger.error('Failed to send booking confirmation', err),
        );
    }
  }

  /**
   * Send booking confirmation to a guest.
   */
  sendBookingConfirmationToGuest(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const cancellationUrl = this.buildCancellationUrl(booking, language);

    const guestEmail = booking.guestEmail;
    if (guestEmail) {
      this.emailService
        .sendBookingConfirmationGuest(
          guestEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
          },
          cancellationUrl,
        )
        .catch((err) =>
          this.logger.error('Failed to send guest booking confirmation', err),
        );
    }
  }

  /**
   * Send notification that a manual booking was created by an instructor.
   * This is NOT a confirmation — it tells the client a session was created for them
   * and they can accept/reject it in their dashboard.
   */
  sendManualBookingCreatedNotification(
    booking: NotifiableBooking,
    language: Language,
    clientId: string | null,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const cancellationUrl = this.buildCancellationUrl(booking, language);

    const recipientEmail = booking.guestEmail;
    if (!recipientEmail) return;

    if (clientId) {
      // Registered client: dashboard link + cancel button
      const dashboardUrl = this.buildDashboardUrl(language);
      this.emailService
        .sendManualBookingCreatedToClient(
          recipientEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
          },
          dashboardUrl,
          cancellationUrl,
        )
        .catch((err) =>
          this.logger.error(
            'Failed to send manual booking created notification to client',
            err,
          ),
        );
    } else {
      // Guest: only cancel button
      this.emailService
        .sendManualBookingCreatedGuest(
          recipientEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
          },
          cancellationUrl,
        )
        .catch((err) =>
          this.logger.error(
            'Failed to send manual booking created notification to guest',
            err,
          ),
        );
    }

    this.sendInstructorNewBookingNotification(booking, language);
  }

  /**
   * Send confirmation after a client accepts a manual booking.
   * Sends a proper confirmation email to the client and notifies the instructor.
   */
  sendManualBookingAcceptedNotification(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);
    const clientName = this.resolveClientName(booking);
    const dashboardUrl = this.buildDashboardUrl(language);
    const cancellationUrl = this.buildCancellationUrl(booking, language);

    // Send confirmation to client
    const clientEmail = booking.client?.email;
    if (clientEmail) {
      this.emailService
        .sendBookingConfirmationClient(
          clientEmail,
          language,
          {
            date: bookingDate,
            time: bookingTime,
            duration: booking.duration ?? 0,
            price: booking.price ?? undefined,
            instructorName,
          },
          dashboardUrl,
          cancellationUrl,
        )
        .catch((err) =>
          this.logger.error(
            'Failed to send manual booking acceptance confirmation to client',
            err,
          ),
        );
    }

    // Notify instructor that client accepted
    const instructorEmail = booking.instructorUser?.email;
    if (instructorEmail) {
      this.emailService
        .sendClientAcceptedManualBooking(instructorEmail, language, {
          date: bookingDate,
          time: bookingTime,
          duration: booking.duration ?? 0,
          price: booking.price ?? undefined,
          clientName,
        })
        .catch((err) =>
          this.logger.error(
            'Failed to send client accepted manual booking notification to instructor',
            err,
          ),
        );
    }
  }

  /**
   * Send cancellation notification based on who cancelled.
   */
  sendCancellationNotification(
    booking: NotifiableBooking,
    cancelledBy: 'client' | 'instructor',
    cancellationReason: string | undefined,
    language: Language,
  ): void {
    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const instructorName = this.resolveInstructorName(booking);

    if (cancelledBy === 'instructor') {
      // Notify client (guest or registered)
      const clientEmail = booking.guestEmail || booking.client?.email;
      if (clientEmail) {
        this.emailService
          .sendCancellationByInstructor(clientEmail, language, {
            date: bookingDate,
            time: bookingTime,
            reason: cancellationReason,
            instructorName,
          })
          .catch((err) =>
            this.logger.error(
              'Failed to send cancellation by instructor email',
              err,
            ),
          );
      }
    } else {
      // Notify instructor that client cancelled
      const instructorEmail = booking.instructorUser?.email;
      if (instructorEmail) {
        const clientName = this.resolveClientName(booking);
        this.emailService
          .sendCancellationByClient(instructorEmail, language, {
            date: bookingDate,
            time: bookingTime,
            reason: cancellationReason,
            clientName,
          })
          .catch((err) =>
            this.logger.error(
              'Failed to send cancellation by client email',
              err,
            ),
          );
      }
    }
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private formatDateTime(
    startTime: Date | null | undefined,
    language: Language,
  ): { bookingDate: string; bookingTime: string } {
    const locale = language === 'pl' ? 'pl-PL' : 'en-GB';
    const date = startTime ?? new Date();
    const timeZone = 'Europe/Warsaw';
    return {
      bookingDate: date.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone,
      }),
      bookingTime: date.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone,
      }),
    };
  }

  private resolveInstructorName(booking: NotifiableBooking): string {
    const instructor = booking.instructorUser;
    return (
      [instructor?.firstName, instructor?.lastName].filter(Boolean).join(' ') ||
      'Instructor'
    );
  }

  private resolveClientName(booking: NotifiableBooking): string {
    return (
      booking.guestName ||
      [booking.client?.firstName, booking.client?.lastName]
        .filter(Boolean)
        .join(' ') ||
      'Client'
    );
  }

  private buildDashboardUrl(language: Language): string {
    const path = language === 'pl' ? 'panel' : 'dashboard';
    return `${process.env.FRONTEND_URL}/${language}/${path}`;
  }

  private buildCancellationUrl(
    booking: NotifiableBooking,
    language: Language,
  ): string {
    return `${process.env.FRONTEND_URL}/${language}/cancel-booking?bookingId=${booking.id}&token=${booking.cancellationToken}`;
  }

  private sendInstructorNewBookingNotification(
    booking: NotifiableBooking,
    language: Language,
  ): void {
    const instructorEmail = booking.instructorUser?.email;
    if (!instructorEmail) return;

    const { bookingDate, bookingTime } = this.formatDateTime(
      booking.startTime,
      language,
    );
    const clientName = this.resolveClientName(booking);

    this.emailService
      .sendNewBookingNotificationInstructor(instructorEmail, language, {
        date: bookingDate,
        time: bookingTime,
        duration: booking.duration ?? 0,
        price: booking.price ?? undefined,
        clientName,
        clientEmail: booking.guestEmail || booking.client?.email,
        clientPhone: booking.guestPhone || undefined,
      })
      .catch((err) =>
        this.logger.error(
          'Failed to send instructor new-booking notification',
          err,
        ),
      );
  }
}
