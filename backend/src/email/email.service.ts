import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.warn(
        'RESEND_API_KEY not found. Email sending will be disabled.',
      );
      return;
    }

    this.resend = new Resend(apiKey);
  }

  async sendVerificationCode(
    email: string,
    code: string,
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending verification code to ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? 'Kod weryfikacyjny - Trainly'
          : 'Verification Code - Trainly';

      const html = this.getVerificationEmailTemplate(code, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Verification code sent to ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send verification code to ${email}:`,
        error,
      );
      throw error;
    }
  }

  async sendPasswordResetCode(
    email: string,
    code: string,
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending password reset code to ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? 'Resetowanie hasła - Trainly'
          : 'Password Reset - Trainly';

      const html = this.getPasswordResetEmailTemplate(code, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Password reset code sent to ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset code to ${email}:`,
        error,
      );
      throw error;
    }
  }

  // ============================================
  // BOOKING EMAIL NOTIFICATIONS
  // ============================================

  async sendBookingConfirmationGuest(
    email: string,
    bookingDetails: {
      instructorName: string;
      date: string;
      time: string;
      duration: number;
      price?: number;
      bookingId: string;
      cancellationToken: string;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending booking confirmation to guest ${email}`,
      );
      return null;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const cancelLink = `${frontendUrl}/${language}/cancel-booking?bookingId=${bookingDetails.bookingId}&token=${bookingDetails.cancellationToken}&email=${encodeURIComponent(email)}`;

    try {
      const subject =
        language === 'pl'
          ? `Potwierdzenie rezerwacji - ${bookingDetails.instructorName}`
          : `Booking Confirmation - ${bookingDetails.instructorName}`;

      const html = this.getBookingConfirmationGuestTemplate(bookingDetails, cancelLink, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Booking confirmation sent to guest ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation to guest ${email}:`,
        error,
      );
      // Don't throw - email failure shouldn't break booking
    }
  }

  async sendBookingConfirmationClient(
    email: string,
    bookingDetails: {
      instructorName: string;
      date: string;
      time: string;
      duration: number;
      price?: number;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending booking confirmation to client ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? `Potwierdzenie rezerwacji - ${bookingDetails.instructorName}`
          : `Booking Confirmation - ${bookingDetails.instructorName}`;

      const html = this.getBookingConfirmationClientTemplate(bookingDetails, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Booking confirmation sent to client ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send booking confirmation to client ${email}:`,
        error,
      );
    }
  }

  async sendCancellationByInstructor(
    email: string,
    bookingDetails: {
      instructorName: string;
      date: string;
      time: string;
      reason?: string;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending cancellation notice to ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? `Sesja anulowana przez instruktora - ${bookingDetails.instructorName}`
          : `Session Cancelled by Instructor - ${bookingDetails.instructorName}`;

      const html = this.getCancellationByInstructorTemplate(bookingDetails, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Cancellation notice sent to ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send cancellation notice to ${email}:`,
        error,
      );
    }
  }

  async sendCancellationByClient(
    email: string,
    bookingDetails: {
      clientName: string;
      date: string;
      time: string;
      reason?: string;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending cancellation notice to instructor ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? `Sesja anulowana przez klienta - ${bookingDetails.clientName}`
          : `Session Cancelled by Client - ${bookingDetails.clientName}`;

      const html = this.getCancellationByClientTemplate(bookingDetails, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Cancellation notice sent to instructor ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send cancellation notice to instructor ${email}:`,
        error,
      );
    }
  }

    async sendManualBookingConfirmationGuest(
    email: string,
    bookingDetails: {
      instructorName: string;
      date: string;
      time: string;
      duration: number;
      price?: number;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending manual booking confirmation to guest ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? `Sesja zarezerwowana przez instruktora - ${bookingDetails.instructorName}`
          : `Session booked by your instructor - ${bookingDetails.instructorName}`;

      const html = this.getManualBookingConfirmationGuestTemplate(bookingDetails, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`Manual booking confirmation sent to guest ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send manual booking confirmation to guest ${email}:`,
        error,
      );
    }
  }

  async sendNewBookingNotificationInstructor(
    email: string,
    bookingDetails: {
      clientName: string;
      date: string;
      time: string;
      duration: number;
      price?: number;
      isManual?: boolean;
    },
    language: 'pl' | 'en' = 'pl',
  ) {
    if (!this.resend) {
      this.logger.warn(
        `Email sending disabled; not sending new booking notification to instructor ${email}`,
      );
      return null;
    }

    try {
      const subject =
        language === 'pl'
          ? `Nowa rezerwacja od ${bookingDetails.clientName}`
          : `New booking from ${bookingDetails.clientName}`;

      const html = this.getNewBookingInstructorTemplate(bookingDetails, language);

      const result = await this.resend.emails.send({
        from: 'Trainly <onboarding@resend.dev>',
        to: email,
        subject,
        html,
      });

      this.logger.log(`New booking notification sent to instructor ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to send new booking notification to instructor ${email}:`,
        error,
      );
    }
  }

  private getVerificationEmailTemplate(code: string, language: 'pl' | 'en'): string {
    const content = language === 'pl' ? {
      title: 'Witaj w Trainly! 🎉',
      subtitle: 'Twój kod weryfikacyjny:',
      expires: 'Kod wygasa za 10 minut.',
      footer: 'Jeśli nie zakładałeś konta, zignoruj tego emaila.',
    } : {
      title: 'Welcome to Trainly! 🎉',
      subtitle: 'Your verification code:',
      expires: 'Code expires in 10 minutes.',
      footer: 'If you didn\'t create an account, please ignore this email.',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💪 Trainly</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">${content.title}</h2>
                      <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${content.subtitle}</p>
                      
                      <!-- Verification Code -->
                      <div style="background-color: #334155; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #f97316; font-family: 'Courier New', monospace;">${code}</div>
                      </div>
                      
                      <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 14px; text-align: center;">${content.expires}</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #0f172a; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">${content.footer}</p>
                      <p style="margin: 10px 0 0 0; color: #475569; font-size: 12px;">© 2026 Trainly. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  private getPasswordResetEmailTemplate(code: string, language: 'pl' | 'en'): string {
    const content = language === 'pl' ? {
      title: 'Resetowanie hasła',
      subtitle: 'Otrzymałeś ten email, ponieważ zażądano resetowania hasła dla Twojego konta.',
      codeLabel: 'Twój kod resetowania hasła:',
      expires: 'Kod wygasa za 10 minut.',
      footer: 'Jeśli nie prosiłeś o reset hasła, zignoruj tego emaila.',
    } : {
      title: 'Password Reset',
      subtitle: 'You received this email because a password reset was requested for your account.',
      codeLabel: 'Your password reset code:',
      expires: 'Code expires in 10 minutes.',
      footer: 'If you didn\'t request a password reset, please ignore this email.',
    };

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💪 Trainly</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 20px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">${content.title}</h2>
                      <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${content.subtitle}</p>
                      <p style="margin: 0 0 20px 0; color: #cbd5e1; font-size: 16px;">${content.codeLabel}</p>
                      
                      <!-- Reset Code -->
                      <div style="background-color: #334155; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
                        <div style="font-size: 48px; font-weight: bold; letter-spacing: 12px; color: #f97316; font-family: 'Courier New', monospace;">${code}</div>
                      </div>
                      
                      <p style="margin: 30px 0 0 0; color: #94a3b8; font-size: 14px; text-align: center;">${content.expires}</p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #0f172a; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">${content.footer}</p>
                      <p style="margin: 10px 0 0 0; color: #475569; font-size: 12px;">© 2026 Trainly. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

    // ============================================
  // BOOKING EMAIL TEMPLATES
  // ============================================

  private getBookingConfirmationGuestTemplate(
    details: { instructorName: string; date: string; time: string; duration: number; price?: number },
    cancelLink: string,
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Rezerwacja potwierdzona! 🎉',
      subtitle: `Zarezerwowałeś/aś sesję z ${details.instructorName}`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo: 'Jeśli nie możesz wziąć udziału, anuluj sesję klikając przycisk poniżej.',
      cancelButton: 'Anuluj sesję',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    } : {
      title: 'Booking Confirmed! 🎉',
      subtitle: `You booked a session with ${details.instructorName}`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo: 'If you cannot attend, cancel the session by clicking the button below.',
      cancelButton: 'Cancel Session',
      footer: 'Thank you for using Trainly!',
    };

    return this.getBookingEmailTemplate(content, details, cancelLink);
  }

  private getBookingConfirmationClientTemplate(
    details: { instructorName: string; date: string; time: string; duration: number; price?: number },
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Rezerwacja potwierdzona! 🎉',
      subtitle: `Zarezerwowałeś/aś sesję z ${details.instructorName}`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      cancelInfo: 'Możesz anulować sesję w swoim panelu dashboard.',
      cancelButton: null,
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    } : {
      title: 'Booking Confirmed! 🎉',
      subtitle: `You booked a session with ${details.instructorName}`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      cancelInfo: 'You can cancel the session from your dashboard.',
      cancelButton: null,
      footer: 'Thank you for using Trainly!',
    };

    return this.getBookingEmailTemplate(content, details);
  }

  private getCancellationByInstructorTemplate(
    details: { instructorName: string; date: string; time: string; reason?: string },
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Sesja anulowana przez instruktora',
      subtitle: `${details.instructorName} anulował/a Twoją sesję`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      reasonLabel: 'Powód',
      footer: 'Możesz zarezerwować nowy termin na Trainly.',
    } : {
      title: 'Session Cancelled by Instructor',
      subtitle: `${details.instructorName} cancelled your session`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      reasonLabel: 'Reason',
      footer: 'You can book a new session on Trainly.',
    };

    return this.getSimpleEmailTemplate(content, details);
  }

  private getCancellationByClientTemplate(
    details: { clientName: string; date: string; time: string; reason?: string },
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Sesja anulowana przez klienta',
      subtitle: `${details.clientName} anulował/a swoją sesję`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      reasonLabel: 'Powód',
      footer: 'Sprawdź swój kalendarz na Trainly.',
    } : {
      title: 'Session Cancelled by Client',
      subtitle: `${details.clientName} cancelled their session`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      reasonLabel: 'Reason',
      footer: 'Check your calendar on Trainly.',
    };

    return this.getSimpleEmailTemplate(content, details);
  }

    private getManualBookingConfirmationGuestTemplate(
    details: { instructorName: string; date: string; time: string; duration: number; price?: number },
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Sesja zarezerwowana! 🎉',
      subtitle: `Twój instruktor ${details.instructorName} zarezerwował dla Ciebie sesję`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      info: 'Jeśli potrzebujesz zmienić termin, skontaktuj się bezpośrednio z instruktorem.',
      footer: 'Dziękujemy za skorzystanie z Trainly!',
    } : {
      title: 'Session Booked! 🎉',
      subtitle: `Your instructor ${details.instructorName} has booked a session for you`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      info: 'If you need to reschedule, please contact your instructor directly.',
      footer: 'Thank you for using Trainly!',
    };

    return this.getInfoEmailTemplate(content, details);
  }

  private getNewBookingInstructorTemplate(
    details: { clientName: string; date: string; time: string; duration: number; price?: number; isManual?: boolean },
    language: 'pl' | 'en',
  ): string {
    const content = language === 'pl' ? {
      title: 'Nowa rezerwacja! 📅',
      subtitle: details.isManual
        ? `Dodałeś/aś ręczną rezerwację dla ${details.clientName}`
        : `${details.clientName} zarezerwował(a) u Ciebie sesję`,
      dateLabel: 'Data',
      timeLabel: 'Godzina',
      durationLabel: 'Czas trwania',
      priceLabel: 'Cena',
      minutes: 'min',
      footer: 'Sprawdź swój kalendarz na Trainly.',
    } : {
      title: 'New Booking! 📅',
      subtitle: details.isManual
        ? `You added a manual booking for ${details.clientName}`
        : `${details.clientName} has booked a session with you`,
      dateLabel: 'Date',
      timeLabel: 'Time',
      durationLabel: 'Duration',
      priceLabel: 'Price',
      minutes: 'min',
      footer: 'Check your calendar on Trainly.',
    };

    return this.getInfoEmailTemplate(content, details);
  }

  private getInfoEmailTemplate(
    content: {
      title: string;
      subtitle: string;
      dateLabel: string;
      timeLabel: string;
      durationLabel: string;
      priceLabel: string;
      minutes: string;
      info?: string;
      footer: string;
    },
    details: { date: string; time: string; duration: number; price?: number },
  ): string {
    const priceRow = details.price != null
      ? `<tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.priceLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.price} PLN</td></tr>`
      : '';

    const infoHtml = content.info
      ? `<p style="margin: 30px 0 0 0; color: #cbd5e1; font-size: 14px; line-height: 1.5;">${content.info}</p>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💪 Trainly</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 10px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">${content.title}</h2>
                      <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${content.subtitle}</p>
                      
                      <!-- Booking Details -->
                      <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.dateLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.date}</td></tr>
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.timeLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.time}</td></tr>
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.durationLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.duration} ${content.minutes}</td></tr>
                          ${priceRow}
                        </table>
                      </div>
                      
                      ${infoHtml}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #0f172a; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">${content.footer}</p>
                      <p style="margin: 10px 0 0 0; color: #475569; font-size: 12px;">© 2026 Trainly. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Shared template builder for booking confirmation emails
   */
  private getBookingEmailTemplate(
    content: {
      title: string;
      subtitle: string;
      dateLabel: string;
      timeLabel: string;
      durationLabel: string;
      priceLabel: string;
      minutes: string;
      cancelInfo: string;
      cancelButton: string | null;
      footer: string;
    },
    details: { date: string; time: string; duration: number; price?: number },
    cancelLink?: string,
  ): string {
    const priceRow = details.price != null
      ? `<tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.priceLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.price} PLN</td></tr>`
      : '';

    const cancelButtonHtml = cancelLink && content.cancelButton
      ? `
          <p style="margin: 30px 0 10px 0; color: #cbd5e1; font-size: 14px;">${content.cancelInfo}</p>
          <a href="${cancelLink}" style="display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin-top: 10px;">${content.cancelButton}</a>
        `
      : `<p style="margin: 30px 0 0 0; color: #cbd5e1; font-size: 14px;">${content.cancelInfo}</p>`;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💪 Trainly</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 10px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">${content.title}</h2>
                      <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${content.subtitle}</p>
                      
                      <!-- Booking Details -->
                      <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.dateLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.date}</td></tr>
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.timeLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.time}</td></tr>
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.durationLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.duration} ${content.minutes}</td></tr>
                          ${priceRow}
                        </table>
                      </div>
                      
                      ${cancelButtonHtml}
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #0f172a; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">${content.footer}</p>
                      <p style="margin: 10px 0 0 0; color: #475569; font-size: 12px;">© 2026 Trainly. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }

  /**
   * Shared template builder for cancellation notification emails (no action button)
   */
  private getSimpleEmailTemplate(
    content: {
      title: string;
      subtitle: string;
      dateLabel: string;
      timeLabel: string;
      reasonLabel: string;
      footer: string;
    },
    details: { date: string; time: string; reason?: string },
  ): string {
    const reasonRow = details.reason
      ? `<tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.reasonLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; text-align: right;">${details.reason}</td></tr>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #1e293b; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #f97316 0%, #dc2626 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">💪 Trainly</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 10px 0; color: #f1f5f9; font-size: 24px; font-weight: 600;">${content.title}</h2>
                      <p style="margin: 0 0 30px 0; color: #cbd5e1; font-size: 16px; line-height: 1.5;">${content.subtitle}</p>
                      
                      <!-- Details -->
                      <div style="background-color: #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.dateLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.date}</td></tr>
                          <tr><td style="padding: 8px 0; color: #94a3b8; font-size: 14px;">${content.timeLabel}</td><td style="padding: 8px 0; color: #f1f5f9; font-size: 14px; font-weight: 600; text-align: right;">${details.time}</td></tr>
                          ${reasonRow}
                        </table>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; background-color: #0f172a; text-align: center;">
                      <p style="margin: 0; color: #64748b; font-size: 12px;">${content.footer}</p>
                      <p style="margin: 10px 0 0 0; color: #475569; font-size: 12px;">© 2026 Trainly. All rights reserved.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}
