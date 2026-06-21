import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingNotificationHelper } from '../helpers/booking-notification.helper';
import { CancelBookingDto } from '../dto/cancel-booking.dto';
import type { Language } from '../../email/email.types';

@Injectable()
export class BookingCancellationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationHelper: BookingNotificationHelper,
  ) {}

  /**
   * Cancel a booking (authenticated user)
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user has permission
    const isClient = booking.clientId === userId;
    const isInstructor = booking.instructorId === userId;

    if (!isClient && !isInstructor) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    // Verify cancelledBy matches user role
    if (dto.cancelledBy === 'client' && !isClient) {
      throw new ForbiddenException('You are not the client of this booking');
    }

    if (dto.cancelledBy === 'instructor' && !isInstructor) {
      throw new ForbiddenException(
        'You are not the instructor of this booking',
      );
    }

    const now = new Date();
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId: booking.instructorId },
    });

    if (dto.cancelledBy === 'client' && profile && booking.startTime) {
      const deadlineDate = new Date(
        booking.startTime.getTime() - profile.minNoticeHours * 60 * 60 * 1000,
      );

      if (now > deadlineDate) {
        throw new BadRequestException(
          language === 'pl'
            ? 'Czas na anulowanie sesji minął. Skontaktuj się z instruktorem prywatnie.'
            : 'The cancellation deadline has passed. Please contact the instructor directly.',
        );
      }
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // Use transaction with status check to prevent race conditions
    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: {
          id: bookingId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: dto.cancelledBy,
          cancellationReason: dto.cancellationReason,
          ...(dto.cancelledBy === 'client'
            ? { cancellationToken: null, cancellationTokenExpiresAt: null }
            : {}),
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          instructorUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return result;
    });

    if (!updatedBooking) {
      throw new BadRequestException(
        'Booking could not be cancelled. It may have been cancelled already.',
      );
    }

    this.notificationHelper.sendCancellationNotification(
      updatedBooking,
      dto.cancelledBy,
      dto.cancellationReason,
      language,
    );

    return updatedBooking;
  }

  /**
   * Validate a cancellation token without cancelling the booking.
   * Used by the frontend to check token validity on page load.
   */
  async validateCancellationToken(
    bookingId: string,
    token: string,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructorUser: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if the cancellation token is valid
    if (!booking.cancellationToken || booking.cancellationToken !== token) {
      throw new BadRequestException({
        errorCode: 'INVALID_TOKEN',
        message:
          language === 'pl'
            ? 'Nieprawidłowy lub wygasły link do anulowania.'
            : 'Invalid or expired cancellation link.',
      });
    }

    // Check if the cancellation token has expired
    if (
      booking.cancellationTokenExpiresAt &&
      new Date() > booking.cancellationTokenExpiresAt
    ) {
      throw new BadRequestException({
        errorCode: 'TOKEN_EXPIRED',
        message:
          language === 'pl'
            ? 'Link do anulowania wygasł. Skontaktuj się z instruktorem.'
            : 'Cancellation link has expired. Please contact the instructor.',
      });
    }

    // If booking is already cancelled, token has been used
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException({
        errorCode: 'TOKEN_USED',
        message:
          language === 'pl'
            ? 'Nieprawidłowy lub wygasły link do anulowania.'
            : 'Invalid or expired cancellation link.',
      });
    }

    // Check cancellation deadline
    const now = new Date();
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId: booking.instructorId },
    });

    if (profile && booking.startTime) {
      const deadlineDate = new Date(
        booking.startTime.getTime() - profile.minNoticeHours * 60 * 60 * 1000,
      );

      if (now > deadlineDate) {
        throw new BadRequestException({
          errorCode: 'DEADLINE_PASSED',
          message:
            language === 'pl'
              ? 'Czas na anulowanie sesji minął. Skontaktuj się z instruktorem prywatnie.'
              : 'The cancellation deadline has passed. Please contact the instructor directly.',
        });
      }
    }

    return {
      valid: true,
      status: booking.status,
      startTime: booking.startTime,
      duration: booking.duration,
      price: booking.price,
      instructorName:
        [booking.instructorUser?.firstName, booking.instructorUser?.lastName]
          .filter(Boolean)
          .join(' ') || undefined,
    };
  }

  /**
   * Cancel a booking as a guest (via cancellation token link)
   */
  async cancelGuestBooking(
    bookingId: string,
    token: string,
    cancellationReason?: string,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate the cancellation token
    if (!booking.cancellationToken || booking.cancellationToken !== token) {
      throw new BadRequestException({
        errorCode: 'INVALID_TOKEN',
        message:
          language === 'pl'
            ? 'Nieprawidłowy lub wygasły link do anulowania.'
            : 'Invalid or expired cancellation link.',
      });
    }

    // Check if the cancellation token has expired
    if (
      booking.cancellationTokenExpiresAt &&
      new Date() > booking.cancellationTokenExpiresAt
    ) {
      throw new BadRequestException({
        errorCode: 'TOKEN_EXPIRED',
        message:
          language === 'pl'
            ? 'Link do anulowania wygasł. Skontaktuj się z instruktorem.'
            : 'Cancellation link has expired. Please contact the instructor.',
      });
    }

    // Check if booking is already cancelled — show token error, not "already cancelled"
    if (booking.status === 'CANCELLED') {
      throw new BadRequestException({
        errorCode: 'TOKEN_USED',
        message:
          language === 'pl'
            ? 'Nieprawidłowy lub wygasły link do anulowania.'
            : 'Invalid or expired cancellation link.',
      });
    }

    // Check cancellation deadline
    const now = new Date();
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId: booking.instructorId },
    });

    if (profile && booking.startTime) {
      const deadlineDate = new Date(
        booking.startTime.getTime() - profile.minNoticeHours * 60 * 60 * 1000,
      );

      if (now > deadlineDate) {
        throw new BadRequestException({
          errorCode: 'DEADLINE_PASSED',
          message:
            language === 'pl'
              ? 'Czas na anulowanie sesji minął. Skontaktuj się z instruktorem prywatnie.'
              : 'The cancellation deadline has passed. Please contact the instructor directly.',
        });
      }
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException({
        errorCode: 'INVALID_STATUS',
        message: 'Cannot cancel completed booking',
      });
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException({
        errorCode: 'INVALID_STATUS',
        message: 'Cancellation is not allowed for this booking',
      });
    }

    // Use transaction with status check to prevent race conditions
    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const result = await tx.booking.update({
        where: {
          id: bookingId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy: 'client',
          cancellationReason: cancellationReason || null,
          cancellationToken: null,
          cancellationTokenExpiresAt: null,
        },
        include: {
          instructorUser: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
      return result;
    });

    if (!updatedBooking) {
      throw new BadRequestException(
        'Booking could not be cancelled. It may have been cancelled already.',
      );
    }

    this.notificationHelper.sendCancellationNotification(
      updatedBooking,
      'client',
      cancellationReason,
      language,
    );

    return { success: true, message: 'Booking cancelled successfully' };
  }

  /**
   * Acknowledge cancellation (instructor only)
   */
  async acknowledgeCancellation(userId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException(
        'Only the instructor can acknowledge cancellations',
      );
    }

    if (booking.status !== 'CANCELLED') {
      throw new BadRequestException(
        'Only cancelled bookings can be acknowledged',
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { acknowledgedAt: new Date() },
    });
  }

  /**
   * Scheduled cleanup: nullify expired cancellation tokens.
   */
  async cleanupExpiredCancellationTokens() {
    const result = await this.prisma.booking.updateMany({
      where: {
        cancellationToken: { not: null },
        cancellationTokenExpiresAt: { lt: new Date() },
      },
      data: {
        cancellationToken: null,
        cancellationTokenExpiresAt: null,
      },
    });
    return { cleaned: result.count };
  }
}
