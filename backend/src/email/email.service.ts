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
}
