import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

import {
  Language,
  BookingDetails,
  InstructorBookingNotificationDetails,
  CancellationByClientDetails,
  CancellationByInstructorDetails,
  ClientAcceptedManualBookingDetails,
  EnterpriseLeadDetails,
} from './email.types';

import {
  buildBookingTemplate,
  buildCancellationTemplate,
  buildInfoTemplate,
  buildPasswordResetTemplate,
  buildReviewInvitationTemplate,
  buildVerificationTemplate,
  buildEnterpriseLeadNotificationTemplate,
  buildEnterpriseAccountActivationTemplate,
} from './email-templates';

import {
  BOOKING_TEXTS,
  CANCELLATION_TEXTS,
  INFO_EMAIL_TEXTS,
  PASSWORD_RESET_TEXTS,
  REVIEW_INVITATION_TEXTS,
  VERIFICATION_TEXTS,
  ENTERPRISE_LEAD_TEXTS,
  ENTERPRISE_ACTIVATION_TEXTS,
} from './email.translations';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend?: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const configuredFrom = this.configService.get<string>('RESEND_FROM_EMAIL');

    this.fromEmail = configuredFrom ?? '"Exercio" <noreply@exercio.app>';

    if (apiKey) {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend initialized.');
    } else {
      this.logger.warn(
        'RESEND_API_KEY not configured. Emails will be disabled.',
      );
    }
  }

  private async sendEmail(to: string, subject: string, html: string) {
    if (!this.resend) {
      this.logger.warn(`Email not sent (Resend disabled): ${subject}`);
      return null;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (response.error) {
        this.logger.error(
          `Resend API Error for "${subject}": Code ${response.error.name} - ${response.error.message}`,
        );
        throw new Error(`Resend failed: ${response.error.message}`);
      }

      this.logger.log(
        `Email successfully queued via Resend. ID: ${response.data?.id}`,
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(
        `Network or system failure sending email: ${subject}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Send a raw email - used by other modules (e.g., Contact)
   */
  async sendRawEmail(to: string, subject: string, html: string) {
    return this.sendEmail(to, subject, html);
  }

  async sendVerificationCode(
    email: string,
    code: string,
    language: Language = 'en',
  ) {
    const texts = VERIFICATION_TEXTS[language];
    const html = buildVerificationTemplate(code, texts);
    return this.sendEmail(email, texts.title, html);
  }

  async sendPasswordResetCode(
    email: string,
    code: string,
    language: Language = 'en',
  ) {
    const texts = PASSWORD_RESET_TEXTS[language];
    const html = buildPasswordResetTemplate(code, texts);
    return this.sendEmail(email, texts.title, html);
  }

  async sendBookingConfirmationGuest(
    email: string,
    language: Language,
    details: BookingDetails,
    cancellationUrl: string,
  ) {
    const texts = BOOKING_TEXTS.guestConfirmation[language];
    const html = buildBookingTemplate(
      texts,
      details,
      cancellationUrl,
      language,
    );
    return this.sendEmail(email, texts.title, html);
  }

  async sendBookingConfirmationClient(
    email: string,
    language: Language,
    details: BookingDetails,
    dashboardUrl: string,
    cancelLink?: string,
  ) {
    const baseTexts = BOOKING_TEXTS.clientConfirmation[language];
    const texts = { ...baseTexts, dashboardUrl };
    const html = buildBookingTemplate(texts, details, cancelLink, language);
    return this.sendEmail(email, texts.title, html);
  }

  async sendManualBookingCreatedGuest(
    email: string,
    language: Language,
    details: BookingDetails,
    cancellationUrl: string,
  ) {
    const texts = INFO_EMAIL_TEXTS.manualBookingCreatedGuest[language];
    const html = buildBookingTemplate(
      texts,
      details,
      cancellationUrl,
      language,
    );
    return this.sendEmail(email, texts.title, html);
  }

  async sendManualBookingCreatedToClient(
    email: string,
    language: Language,
    details: BookingDetails,
    dashboardUrl: string,
    cancelLink?: string,
  ) {
    const texts = INFO_EMAIL_TEXTS.manualBooking[language];
    const textsWithDashboard = { ...texts, dashboardUrl };
    const html = buildBookingTemplate(
      textsWithDashboard,
      details,
      cancelLink,
      language,
    );
    return this.sendEmail(email, texts.title, html);
  }

  async sendClientAcceptedManualBooking(
    email: string,
    language: Language,
    details: ClientAcceptedManualBookingDetails,
  ) {
    const texts = INFO_EMAIL_TEXTS.clientAcceptedManualBooking[language];
    const html = buildInfoTemplate(texts, details);
    return this.sendEmail(email, texts.title, html);
  }

  async sendNewBookingNotificationInstructor(
    email: string,
    language: Language,
    details: InstructorBookingNotificationDetails,
  ) {
    const texts = INFO_EMAIL_TEXTS.instructorNotification[language];
    const html = buildInfoTemplate(texts, details);
    return this.sendEmail(email, texts.title, html);
  }

  async sendCancellationByInstructor(
    email: string,
    language: Language,
    details: CancellationByInstructorDetails,
  ) {
    const texts = CANCELLATION_TEXTS.byInstructor[language];
    const html = buildCancellationTemplate(texts, details);
    return this.sendEmail(email, texts.title, html);
  }

  async sendCancellationByClient(
    email: string,
    language: Language,
    details: CancellationByClientDetails & { instructorName?: string },
  ) {
    const texts = CANCELLATION_TEXTS.byClient[language];
    const html = buildCancellationTemplate(texts, details);
    return this.sendEmail(email, texts.title, html);
  }

  /**
   * Send review invitation email to a guest user (no account).
   * Registered users see review prompts in their dashboard instead.
   */
  async sendReviewInvitation(
    email: string,
    language: Language,
    instructorName: string,
    reviewUrl: string,
  ) {
    const texts = REVIEW_INVITATION_TEXTS[language];
    const textsWithInstructor = { ...texts, instructorName };
    const html = buildReviewInvitationTemplate(textsWithInstructor, reviewUrl);
    return this.sendEmail(email, texts.title, html);
  }

  /**
   * Send notification to admin about a new enterprise lead
   */
  async sendEnterpriseLeadNotification(
    adminEmail: string,
    language: Language,
    details: EnterpriseLeadDetails,
  ) {
    const texts = ENTERPRISE_LEAD_TEXTS[language];
    const html = buildEnterpriseLeadNotificationTemplate(texts, details);
    return this.sendEmail(adminEmail, texts.title, html);
  }

  /**
   * Send activation email to the partner when their lead is approved
   */
  async sendEnterpriseAccountActivation(
    email: string,
    language: Language,
    activationUrl: string,
  ) {
    const texts = ENTERPRISE_ACTIVATION_TEXTS[language];
    const html = buildEnterpriseAccountActivationTemplate(texts, activationUrl);
    return this.sendEmail(email, texts.title, html);
  }
}
