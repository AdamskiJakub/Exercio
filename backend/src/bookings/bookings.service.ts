import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get available time slots for an instructor in a date range
   */
  async getAvailableSlots(
    instructorProfileId: string,
    startDate: Date,
    endDate: Date,
    requestingUserId?: string,
  ) {
    // Validate instructor exists and has booking enabled
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
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
    // NOTE: booking.instructorId is User.id, not InstructorProfile.id
    
    // Get PENDING and CONFIRMED bookings - these block slots
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        instructorId: profile.userId, // Use userId, not instructorProfileId
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
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        guestName: true,
        guestEmail: true,
        cancellationReason: true,
        cancelledBy: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // Get CANCELLED bookings separately - for display only, don't block slots
    // Only show unacknowledged cancellations
    const cancelledBookings = await this.prisma.booking.findMany({
      where: {
        instructorId: profile.userId,
        startTime: {
          lt: endDate,
        },
        endTime: {
          gt: startDate,
        },
        status: 'CANCELLED',
        acknowledgedAt: null, // Only unacknowledged cancellations
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        status: true,
        notes: true,
        guestName: true,
        guestEmail: true,
        cancellationReason: true,
        cancelledBy: true,
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
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
      cancelledBookings,
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
    cancelledBookings: any[],
  ) {
    const slots: Array<{
      startTime: Date;
      endTime: Date;
      isShortNotice: boolean;
      isException?: boolean;
      available: boolean;
      booking?: {
        id: string;
        status: string;
        notes?: string;
        clientName: string;
        clientEmail?: string;
        cancellationReason?: string;
        cancelledBy?: string;
      };
    }> = [];
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
      let isException = false;

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
        isException = true;
      } else {
        // Use weekly template
        const weeklySlot = weeklyAvailability.find(
          (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive,
        );

        if (!weeklySlot) {
          // No availability for this day of week
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          currentDate.setUTCHours(0, 0, 0, 0);
          continue;
        }

        dayStartTime = weeklySlot.startTime;
        dayEndTime = weeklySlot.endTime;
      }

      // Skip if no valid time range
      if (!dayStartTime || !dayEndTime) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        currentDate.setUTCHours(0, 0, 0, 0);
        continue;
      }

      // Generate slots for this day
      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      const [endHour, endMinute] = dayEndTime.split(':').map(Number);

      let slotStart = new Date(currentDate);
      slotStart.setUTCHours(startHour, startMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setUTCHours(endHour, endMinute, 0, 0);

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
          // Check if slot is already booked (PENDING or CONFIRMED)
          const bookedSession = existingBookings.find((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            // Check for overlap
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          // Check if there's a cancelled booking for this slot
          const cancelledSession = cancelledBookings.find((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          if (bookedSession) {
            // Slot is booked (PENDING/CONFIRMED) - not available
            const clientName = bookedSession.guestName || 
              (bookedSession.client 
                ? `${bookedSession.client.firstName || ''} ${bookedSession.client.lastName || ''}`.trim()
                : 'Unknown Client');
            
            const clientEmail = bookedSession.guestEmail || bookedSession.client?.email;

            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
              isException,
              available: false,
              booking: {
                id: bookedSession.id,
                status: bookedSession.status,
                notes: bookedSession.notes || undefined,
                clientName,
                clientEmail,
                cancellationReason: bookedSession.cancellationReason || undefined,
                cancelledBy: bookedSession.cancelledBy || undefined,
              },
            });
          } else if (cancelledSession) {
            // Slot has a cancelled booking - show as available but with booking info
            const clientName = cancelledSession.guestName || 
              (cancelledSession.client 
                ? `${cancelledSession.client.firstName || ''} ${cancelledSession.client.lastName || ''}`.trim()
                : 'Unknown Client');
            
            const clientEmail = cancelledSession.guestEmail || cancelledSession.client?.email;

            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
              isException,
              available: true,
              booking: {
                id: cancelledSession.id,
                status: cancelledSession.status,
                notes: cancelledSession.notes || undefined,
                clientName,
                clientEmail,
                cancellationReason: cancelledSession.cancellationReason || undefined,
                cancelledBy: cancelledSession.cancelledBy || undefined,
              },
            });
          } else {
            // Slot is available with no booking
            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
              isException,
              available: true,
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

    // Validate slot is within instructor's availability
    const availableSlots = await this.getAvailableSlots(
      dto.instructorId,
      startTime,
      endTime,
    );

    const slotExists = availableSlots.some(slot => 
      slot.startTime.getTime() === startTime.getTime() &&
      slot.endTime.getTime() === endTime.getTime()
    );

    if (!slotExists) {
      throw new BadRequestException('Time slot is not available. Please choose from available slots.');
    }

    // Check if slot is already booked (double-check for race conditions)
    // NOTE: booking.instructorId is User.id, not InstructorProfile.id
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: profile.userId, // Use userId, not instructorProfileId
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
    // NOTE: instructorId in the booking table is the User.id, NOT InstructorProfile.id
    const booking = await this.prisma.booking.create({
      data: {
        clientId: userId,
        instructorId: profile.userId, // Use userId from instructor profile
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

    return booking;
  }

  /**
   * Create a guest booking (without authenticated user)
   */
  async createGuestBooking(dto: CreateBookingDto) {
    // Get instructor profile
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: dto.instructorId },
    });

    if (!profile) {
      throw new NotFoundException('Instructor not found');
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

    // Validate slot is within instructor's availability
    const availableSlots = await this.getAvailableSlots(
      dto.instructorId,
      startTime,
      endTime,
    );

    const slotExists = availableSlots.some(slot => 
      slot.startTime.getTime() === startTime.getTime() &&
      slot.endTime.getTime() === endTime.getTime()
    );

    if (!slotExists) {
      throw new BadRequestException('Time slot is not available. Please choose from available slots.');
    }

    // Check if slot is already booked
    // NOTE: booking.instructorId is User.id, not InstructorProfile.id
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: profile.userId, // Use userId, not instructorProfileId
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

    // Create guest booking (clientId will be null)
    // NOTE: instructorId in the booking table is the User.id, NOT InstructorProfile.id
    const booking = await this.prisma.booking.create({
      data: {
        clientId: null, // Guest booking has no client ID
        instructorId: profile.userId, // Use userId from instructor profile
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        notes: dto.notes,
        status: 'PENDING',
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
      },
      include: {
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

    return booking;
  }

  /**
   * Get bookings for a user (as client or instructor)
   */
  async getMyBookings(userId: string, role: 'client' | 'instructor') {
    // NOTE: booking.instructorId is User.id, not InstructorProfile.id
    const where =
      role === 'client'
        ? { clientId: userId }
        : { instructorId: userId }; // For instructors, use userId directly

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
    if (
      booking.clientId !== userId &&
      booking.instructorId !== userId // instructorId is User.id
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
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    dto: CancelBookingDto,
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
   * DELETE bookings/history
   * Remove completed or cancelled bookings for the requesting client
   */
  async clearUserHistory(userId: string) {
    // Only delete bookings that belong to the client
    const result = await this.prisma.booking.deleteMany({
      where: {
        clientId: userId,
        status: {
          in: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    return { deleted: result.count };
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

    // Validate time range
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (60 * 1000));

    if (duration <= 0) {
      throw new BadRequestException('Duration must be positive');
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

  /**
   * Update booking notes (instructor only)
   */
  async updateBookingNotes(userId: string, bookingId: string, notes: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        instructorUser: {
          include: {
            instructorProfile: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Verify user is the instructor
    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can update notes');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { notes },
    });
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

    // Verify user is the instructor
    if (booking.instructorId !== userId) {
      throw new ForbiddenException('Only the instructor can acknowledge cancellations');
    }

    // Verify booking is cancelled
    if (booking.status !== 'CANCELLED') {
      throw new BadRequestException('Only cancelled bookings can be acknowledged');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { acknowledgedAt: new Date() },
    });
  }
}
