import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingNotificationHelper } from '../helpers/booking-notification.helper';
import type { Language } from '../../email/email.types';

@Injectable()
export class BookingQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationHelper: BookingNotificationHelper,
  ) {}

  /**
   * Get bookings for a user (as client or instructor)
   */
  async getMyBookings(userId: string, role: 'client' | 'instructor') {
    const where =
      role === 'client'
        ? { clientId: userId, hiddenFromClient: false }
        : { instructorId: userId };

    return this.prisma.booking.findMany({
      where,
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
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  /**
   * Get single booking by ID with access control
   */
  async getBookingById(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
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
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Check if user has access to this booking
    if (booking.clientId !== userId && booking.instructorId !== userId) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Confirm a booking (instructor only)
   */
  async confirmBooking(
    bookingId: string,
    userId: string,
    language: Language = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can confirm bookings');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
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
            instructorProfile: {
              select: {
                id: true,
                sessionDuration: true,
                sessionPrice: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email to the client now that the instructor has confirmed
    if (updated.client) {
      this.notificationHelper.sendBookingConfirmationToClient(
        updated,
        language,
      );
    } else if (updated.guestEmail) {
      this.notificationHelper.sendBookingConfirmationToGuest(updated, language);
    }

    return updated;
  }

  /**
   * Complete a booking (instructor only)
   */
  async completeBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can complete bookings');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Only confirmed bookings can be completed');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'COMPLETED' },
    });
  }

  /**
   * Update booking notes (instructor only)
   */
  async updateBookingNotes(userId: string, bookingId: string, notes: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can update notes');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { notes },
    });
  }
}
