import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BookingQueryService {
  constructor(private readonly prisma: PrismaService) {}

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
}
