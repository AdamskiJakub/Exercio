import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get available time slots for an instructor in a date range
   */
  async getAvailableSlots(
    instructorId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // Validate instructor exists and has booking enabled
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorId },
      include: {
        weeklyAvailability: true,
        availabilityExceptions: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Instructor not found');
    }

    if (!profile.isBookingEnabled) {
      throw new BadRequestException('Instructor does not accept bookings');
    }

    // Get existing bookings that overlap with this range
    // A booking overlaps if: startTime < endDate AND endTime > startDate
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        instructorId,
        startTime: {
          lt: endDate, // Booking starts before our range ends
        },
        endTime: {
          gt: startDate, // Booking ends after our range starts
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    // Generate slots
    const slots = this.generateTimeSlots(
      startDate,
      endDate,
      profile.sessionDuration,
      profile.minNoticeHours,
      profile.weeklyAvailability,
      profile.availabilityExceptions,
      existingBookings,
    );

    return slots;
  }

  /**
   * Core slot generation algorithm
   */
  private generateTimeSlots(
    startDate: Date,
    endDate: Date,
    sessionDuration: number,
    minNoticeHours: number,
    weeklyAvailability: any[],
    exceptions: any[],
    existingBookings: any[],
  ) {
    const slots: { startTime: Date; endTime: Date; isShortNotice: boolean }[] =
      [];
    const currentDate = new Date(startDate);
    const now = new Date();
    const minNoticeDate = new Date(
      now.getTime() + minNoticeHours * 60 * 60 * 1000,
    );

    while (currentDate <= endDate) {
      // Use UTC methods to avoid timezone shifts
      const dayOfWeek = currentDate.getUTCDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Get date string in YYYY-MM-DD format using UTC
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Check for exception for this specific date
      const exception = exceptions.find((ex) => {
        const exYear = ex.date.getUTCFullYear();
        const exMonth = String(ex.date.getUTCMonth() + 1).padStart(2, '0');
        const exDay = String(ex.date.getUTCDate()).padStart(2, '0');
        const exDateStr = `${exYear}-${exMonth}-${exDay}`;
        return exDateStr === dateStr;
      });

      let dayStartTime: string | null = null;
      let dayEndTime: string | null = null;

      if (exception) {
        // Exception overrides weekly template
        if (!exception.isAvailable) {
          // Completely unavailable this day
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          currentDate.setUTCHours(0, 0, 0, 0);
          continue;
        }
        dayStartTime = exception.startTime;
        dayEndTime = exception.endTime;
      } else {
        // Use weekly template
        const weeklySlot = weeklyAvailability.find(
          (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive,
        );

        if (!weeklySlot) {
          // No availability for this day of week
          currentDate.setDate(currentDate.getDate() + 1);
          currentDate.setHours(0, 0, 0, 0);
          continue;
        }

        dayStartTime = weeklySlot.startTime;
        dayEndTime = weeklySlot.endTime;
      }

      // Skip if no valid time range
      if (!dayStartTime || !dayEndTime) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0, 0, 0, 0);
        continue;
      }

      // Generate slots for this day
      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      const [endHour, endMinute] = dayEndTime.split(':').map(Number);

      let slotStart = new Date(currentDate);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setHours(endHour, endMinute, 0, 0);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(
          slotStart.getTime() + sessionDuration * 60 * 1000,
        );

        // Check if slot end time doesn't exceed day end time
        if (slotEnd > dayEnd) {
          break;
        }

        // Check if slot is not in the past
        if (slotStart > now) {
          // Check if slot is not already booked
          const isBooked = existingBookings.some((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            // Check for overlap
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          if (!isBooked) {
            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
            });
          }
        }

        // Move to next slot
        slotStart = new Date(slotStart.getTime() + sessionDuration * 60 * 1000);
      }

      // Move to next day (using UTC methods for consistency)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      currentDate.setUTCHours(0, 0, 0, 0);
    }

    return slots;
  }

  /**
   * Create a new booking
   */
  async createBooking(userId: string, dto: CreateBookingDto) {
    // Get instructor profile
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: dto.instructorId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor not found');
    }

    // Prevent self-booking: instructor cannot book session with themselves
    if (profile.userId === userId) {
      throw new BadRequestException('You cannot book a session with yourself');
    }

    if (!profile.isBookingEnabled) {
      throw new BadRequestException('Instructor does not accept bookings');
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + profile.sessionDuration * 60 * 1000,
    );
    const now = new Date();

    // Check if time is in the past
    if (startTime <= now) {
      throw new BadRequestException('Cannot book time slot in the past');
    }

    // Check if slot is available
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: dto.instructorId,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Time slot is already booked');
    }

    // Check if within notice period
    const minNoticeDate = new Date(
      now.getTime() + profile.minNoticeHours * 60 * 60 * 1000,
    );
    const isShortNotice = startTime < minNoticeDate;

    // Create booking with snapshots
    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        instructorId: dto.instructorId,
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        notes: dto.notes,
        status: 'PENDING',
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
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return booking;
  }

  /**
   * Get bookings for a user (as client or instructor)
   */
  async getMyBookings(userId: string, role: 'client' | 'instructor') {
    const where =
      role === 'client'
        ? { clientId: userId }
        : { instructor: { userId } }; // Query via instructor profile's userId

    const bookings = await this.prisma.booking.findMany({
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
        instructor: {
          select: {
            id: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    return bookings;
  }

  /**
   * Get single booking by ID
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
        instructor: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
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
    if (
      booking.clientId !== userId &&
      booking.instructor.userId !== userId
    ) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    return booking;
  }

  /**
   * Confirm a booking (instructor only)
   */
  async confirmBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructor: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructor.userId !== userId) {
      throw new ForbiddenException('Only the instructor can confirm bookings');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestException('Only pending bookings can be confirmed');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED' },
    });
  }

  /**
   * Complete a booking (instructor only)
   */
  async completeBooking(bookingId: string, userId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructor: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.instructor.userId !== userId) {
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
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructor: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user has permission
    const isClient = booking.clientId === userId;
    const isInstructor = booking.instructor.userId === userId;

    if (!isClient && !isInstructor) {
      throw new ForbiddenException('You do not have access to this booking');
    }

    // Verify cancelledBy matches user role
    if (dto.cancelledBy === 'client' && !isClient) {
      throw new ForbiddenException('You are not the client of this booking');
    }

    if (dto.cancelledBy === 'instructor' && !isInstructor) {
      throw new ForbiddenException('You are not the instructor of this booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: dto.cancelledBy,
        cancellationReason: dto.cancellationReason,
      },
    });
  }

  /**
   * Create manual block (instructor only)
   */
  async createManualBlock(
    userId: string,
    instructorId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
  ) {
    // Verify user is the instructor
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorId },
    });

    if (!profile || profile.userId !== userId) {
      throw new ForbiddenException('You are not this instructor');
    }

    // Check for overlapping bookings
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId,
        startTime: {
          lt: endTime,
        },
        endTime: {
          gt: startTime,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
    });

    if (existingBooking) {
      throw new BadRequestException('Time slot overlaps with existing booking');
    }

    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (60 * 1000));

    return this.prisma.booking.create({
      data: {
        instructorId,
        clientId: null, // No client for manual blocks
        startTime,
        endTime,
        duration,
        isManualBlock: true,
        notes,
        status: 'CONFIRMED', // Manual blocks are automatically confirmed
      },
    });
  }
}
