import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CreateManualBookingDto } from './dto/create-manual-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Get available time slots for an instructor in a date range
   */
  async getAvailableSlots(
    instructorProfileId: string,
    startDate: Date,
    endDate: Date,
    requestingUserId?: string,
    timezoneOffset: number = 0,
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

    // Check if requesting user is the instructor (for PII access control)
    const isInstructor = requestingUserId === profile.userId;

    const endDateTime = new Date(endDate);
    endDateTime.setUTCHours(23, 59, 59, 999);

    // Get PENDING and CONFIRMED bookings - these block slots
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        instructorId: profile.userId, // Use userId, not instructorProfileId
        startTime: {
          lt: endDateTime, // Booking starts before our range ends
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
        // Only include PII if requester is the instructor
        notes: isInstructor,
        guestName: isInstructor,
        guestEmail: isInstructor,
        cancellationReason: isInstructor,
        cancelledBy: isInstructor,
        client: isInstructor
          ? {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            }
          : false,
      },
    });

    // Get CANCELLED bookings separately - for display only, don't block slots
    // Only show unacknowledged cancellations TO INSTRUCTOR (not to clients)
    const cancelledBookings = isInstructor
      ? await this.prisma.booking.findMany({
          where: {
            instructorId: profile.userId,
            startTime: {
              lt: endDateTime,
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
        })
      : []; // Return empty array for non-instructors (clients)

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
      timezoneOffset,
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
    timezoneOffset: number = 0,
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

    // Force dates to absolute midnight UTC to prevent server drifting
    const currentDate = new Date(startDate);
    currentDate.setUTCHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setUTCHours(23, 59, 59, 999);

    const now = new Date();
    const minNoticeDate = new Date(
      now.getTime() + minNoticeHours * 60 * 60 * 1000,
    );

    while (currentDate <= endDateTime) {
      // Get day of week in UTC (0 = Sunday, 1 = Monday, etc.)
      const dayOfWeek = currentDate.getUTCDay();

      // Get date string in YYYY-MM-DD format using UTC
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getUTCDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      // Check for exception using UTC methods
      const exception = exceptions.find((ex) => {
        const exDate = new Date(ex.date);
        const exYear = exDate.getUTCFullYear();
        const exMonth = String(exDate.getUTCMonth() + 1).padStart(2, '0');
        const exDay = String(exDate.getUTCDate()).padStart(2, '0');
        return `${exYear}-${exMonth}-${exDay}` === dateStr;
      });

      let dayStartTime: string | null = null;
      let dayEndTime: string | null = null;
      let isException = false;

      if (exception) {
        if (!exception.isAvailable) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          continue;
        }
        dayStartTime = exception.startTime;
        dayEndTime = exception.endTime;
        isException = true;
      } else {
        const weeklySlot = weeklyAvailability.find(
          (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive,
        );

        if (!weeklySlot) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
          continue;
        }

        dayStartTime = weeklySlot.startTime;
        dayEndTime = weeklySlot.endTime;
      }

      if (!dayStartTime || !dayEndTime) {
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        continue;
      }

      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      const [endHour, endMinute] = dayEndTime.split(':').map(Number);

      // Przeliczamy czas LOKALNY (z panelu instruktora) na UTC
      // timezoneOffset = -(UTC - local), np. dla Polski -120
      // UTC_minuty = lokalne_minuty + timezoneOffset
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let startUtcMinutes = startTotalMinutes + timezoneOffset;
      let endUtcMinutes = endTotalMinutes + timezoneOffset;

      // Normalizacja na zakres 0-1439 (00:00-23:59)
      while (startUtcMinutes < 0) startUtcMinutes += 24 * 60;
      while (startUtcMinutes >= 24 * 60) startUtcMinutes -= 24 * 60;
      while (endUtcMinutes < 0) endUtcMinutes += 24 * 60;
      while (endUtcMinutes >= 24 * 60) endUtcMinutes -= 24 * 60;

      const utcStartHour = Math.floor(startUtcMinutes / 60);
      const utcStartMinute = startUtcMinutes % 60;
      const utcEndHour = Math.floor(endUtcMinutes / 60);
      const utcEndMinute = endUtcMinutes % 60;

      // Budujemy granice dnia w czystym UTC
      const slotStart = new Date(currentDate);
      slotStart.setUTCHours(utcStartHour, utcStartMinute, 0, 0);

      const dayEnd = new Date(currentDate);
      dayEnd.setUTCHours(utcEndHour, utcEndMinute, 0, 0);

      while (slotStart < dayEnd) {
        const slotEnd = new Date(
          slotStart.getTime() + sessionDuration * 60 * 1000,
        );

        if (slotEnd > dayEnd) {
          break;
        }

        if (slotStart > now) {
          // Compare reservation ranges using universal timestamps
          const bookedSession = existingBookings.find((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          const cancelledSession = cancelledBookings.find((booking) => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return slotStart < bookingEnd && slotEnd > bookingStart;
          });

          if (bookedSession) {
            const clientName =
              bookedSession.guestName ||
              (bookedSession.client
                ? `${bookedSession.client.firstName || ''} ${bookedSession.client.lastName || ''}`.trim()
                : 'Unknown Client');

            const clientEmail =
              bookedSession.guestEmail || bookedSession.client?.email;

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
                cancellationReason:
                  bookedSession.cancellationReason || undefined,
                cancelledBy: bookedSession.cancelledBy || undefined,
              },
            });
          } else if (cancelledSession) {
            const clientName =
              cancelledSession.guestName ||
              (cancelledSession.client
                ? `${cancelledSession.client.firstName || ''} ${cancelledSession.client.lastName || ''}`.trim()
                : 'Unknown Client');

            const clientEmail =
              cancelledSession.guestEmail || cancelledSession.client?.email;

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
                cancellationReason:
                  cancelledSession.cancellationReason || undefined,
                cancelledBy: cancelledSession.cancelledBy || undefined,
              },
            });
          } else {
            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
              isException,
              available: true,
            });
          }
        }

        // Advance slot using absolute Unix Timestamp
        slotStart.setTime(slotStart.getTime() + sessionDuration * 60 * 1000);
      }

      // Move to the next day using UTC methods
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return slots;
  }

  /**
   * Create a new booking
   */
  async createBooking(
    userId: string,
    dto: CreateBookingDto,
    language: 'pl' | 'en' = 'pl',
  ) {
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

    const timezoneOffset = dto.timezoneOffset ?? 0;

    // Validate slot is within instructor's availability
    const availableSlots = await this.getAvailableSlots(
      dto.instructorId,
      startTime,
      endTime,
      undefined,
      timezoneOffset,
    );

    const slotExists = availableSlots.some(
      (slot) =>
        slot.startTime.getTime() === startTime.getTime() &&
        slot.endTime.getTime() === endTime.getTime(),
    );

    if (!slotExists) {
      throw new BadRequestException(
        language === 'pl'
          ? 'Termin jest niedostępny. Wybierz z dostępnych slotów.'
          : 'Time slot is not available. Please choose from available slots.',
      );
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

    // Format date/time for email
    const bookingDate = startTime.toLocaleDateString(
      language === 'pl' ? 'pl-PL' : 'en-GB',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    );
    const bookingTime = startTime.toLocaleTimeString(
      language === 'pl' ? 'pl-PL' : 'en-GB',
      { hour: '2-digit', minute: '2-digit' },
    );

    // Send confirmation email to client
    const instructorName =
      [booking.instructorUser?.firstName, booking.instructorUser?.lastName]
        .filter(Boolean)
        .join(' ') || 'Instructor';

    // Send confirmation email to client
    this.emailService
      .sendBookingConfirmationClient(booking.client!.email, {
        instructorName,
        date: bookingDate,
        time: bookingTime,
        duration: booking.duration!,
        price: booking.price ?? undefined,
      })
      .catch((err) =>
        console.error('Failed to send booking confirmation:', err),
      );

    // Send notification to instructor
    const clientName =
      [booking.client?.firstName, booking.client?.lastName]
        .filter(Boolean)
        .join(' ') || 'Client';

    const instructorEmail = booking.instructorUser?.email;
    if (instructorEmail) {
      this.emailService
        .sendNewBookingNotificationInstructor(instructorEmail, {
          clientName,
          date: bookingDate,
          time: bookingTime,
          duration: booking.duration!,
          price: booking.price ?? undefined,
        })
        .catch((err) =>
          console.error('Failed to send instructor notification:', err),
        );
    }

    return booking;
  }

  /**
   * Create a guest booking (without authenticated user)
   */
  async createGuestBooking(
    dto: CreateBookingDto,
    language: 'pl' | 'en' = 'pl',
  ) {
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

    const timezoneOffset = dto.timezoneOffset ?? 0;

    // Validate slot is within instructor's availability
    const availableSlots = await this.getAvailableSlots(
      dto.instructorId,
      startTime,
      endTime,
      undefined,
      timezoneOffset,
    );

    const slotExists = availableSlots.some(
      (slot) =>
        slot.startTime.getTime() === startTime.getTime() &&
        slot.endTime.getTime() === endTime.getTime(),
    );

    if (!slotExists) {
      throw new BadRequestException(
        language === 'pl'
          ? 'Termin jest niedostępny. Wybierz z dostępnych slotów.'
          : 'Time slot is not available. Please choose from available slots.',
      );
    }

    // Check if slot is already booked
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
        cancellationToken: crypto.randomUUID(),
        cancellationTokenExpiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ), // 7-day expiry
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

    // Format date/time for email
    const bookingDate = startTime.toLocaleDateString(
      language === 'pl' ? 'pl-PL' : 'en-GB',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    );
    const bookingTime = startTime.toLocaleTimeString(
      language === 'pl' ? 'pl-PL' : 'en-GB',
      { hour: '2-digit', minute: '2-digit' },
    );

    const instructorName =
      [booking.instructorUser?.firstName, booking.instructorUser?.lastName]
        .filter(Boolean)
        .join(' ') || 'Instructor';

    this.emailService
      .sendBookingConfirmationGuest(dto.guestEmail!, {
        instructorName,
        date: bookingDate,
        time: bookingTime,
        duration: booking.duration!,
        price: booking.price ?? undefined,
        bookingId: booking.id,
        cancellationToken: booking.cancellationToken!,
      })
      .catch((err) =>
        console.error('Failed to send guest booking confirmation:', err),
      );
    // Send notification to instructor
    const clientName = dto.guestName || 'Guest';
    const instructorEmail = booking.instructorUser?.email;
    if (instructorEmail) {
      this.emailService
        .sendNewBookingNotificationInstructor(instructorEmail, {
          clientName,
          date: bookingDate,
          time: bookingTime,
          duration: booking.duration!,
          price: booking.price ?? undefined,
        })
        .catch((err) =>
          console.error('Failed to send instructor notification:', err),
        );
    }

    return booking;
  }

  /**
   * Create a manual booking by instructor (e.g., phone booking)
   * Instructor can create bookings on their own calendar
   */
  async createManualBooking(userId: string, dto: CreateManualBookingDto) {
    // Get instructor profile for this user
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new ForbiddenException(
        'Only instructors can create manual bookings',
      );
    }

    const startTime = new Date(dto.startTime);
    const endTime = new Date(
      startTime.getTime() + profile.sessionDuration * 60 * 1000,
    );
    const now = new Date();

    // Allow instructors to create bookings in the past (for retroactive bookings)
    // but show a warning if it's too far in the past
    if (startTime <= now) {
      // Just log, don't throw - instructors might need to add past bookings
      console.warn(
        `Instructor ${userId} creating booking in the past: ${startTime}`,
      );
    }

    // Check if slot is already booked
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: userId,
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

    // Create manual booking (auto-confirmed since instructor creates it)
    const booking = await this.prisma.booking.create({
      data: {
        clientId: null,
        instructorId: userId,
        startTime,
        endTime,
        duration: profile.sessionDuration,
        price: profile.sessionPrice,
        isShortNotice,
        notes: dto.notes,
        status: 'CONFIRMED',
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

    // Send emails for manual bookings
    const locale = 'pl'; // Default to Polish, can be extended
    const bookingDate = startTime.toLocaleDateString('pl-PL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const bookingTime = startTime.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const instructorName =
      [booking.instructorUser?.firstName, booking.instructorUser?.lastName]
        .filter(Boolean)
        .join(' ') || 'Instructor';

    // Send confirmation to guest (if email provided)
    if (dto.guestEmail) {
      this.emailService
        .sendManualBookingConfirmationGuest(dto.guestEmail, {
          instructorName,
          date: bookingDate,
          time: bookingTime,
          duration: booking.duration!,
          price: booking.price ?? undefined,
        })
        .catch((err) =>
          console.error(
            'Failed to send manual booking confirmation to guest:',
            err,
          ),
        );
    }

    // Send notification to instructor (self-notification for records)
    const instructorEmail = booking.instructorUser?.email;
    if (instructorEmail) {
      this.emailService
        .sendNewBookingNotificationInstructor(instructorEmail, {
          clientName: dto.guestName || 'Client',
          date: bookingDate,
          time: bookingTime,
          duration: booking.duration!,
          price: booking.price ?? undefined,
          isManual: true,
        })
        .catch((err) =>
          console.error('Failed to send instructor notification:', err),
        );
    }

    return booking;
  }

  /**
   * Get bookings for a user (as client or instructor)
   */
  async getMyBookings(userId: string, role: 'client' | 'instructor') {
    // NOTE: booking.instructorId is User.id, not InstructorProfile.id
    const where =
      role === 'client'
        ? { clientId: userId, hiddenFromClient: false }
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
    language: 'pl' | 'en' = 'pl',
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
        const hours = profile.minNoticeHours;
        throw new BadRequestException(
          language === 'pl'
            ? `Okno anulowania minęło. Możesz anulować do ${hours} godzin przed sesją.`
            : `Cancellation window has passed. You can cancel up to ${hours} hours before the session.`,
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

    // Format date/time for emails
    if (updatedBooking.startTime) {
      const locale = language === 'pl' ? 'pl-PL' : 'en-GB';
      const bookingDate = updatedBooking.startTime.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const bookingTime = updatedBooking.startTime.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });

      const instructorName =
        [
          updatedBooking.instructorUser?.firstName,
          updatedBooking.instructorUser?.lastName,
        ]
          .filter(Boolean)
          .join(' ') || 'Instructor';

      if (dto.cancelledBy === 'instructor') {
        // Notify client (guest or registered)
        const clientEmail =
          updatedBooking.guestEmail || updatedBooking.client?.email;
        if (clientEmail) {
          this.emailService
            .sendCancellationByInstructor(clientEmail, {
              instructorName,
              date: bookingDate,
              time: bookingTime,
              reason: dto.cancellationReason,
            })
            .catch((err) =>
              console.error('Failed to send cancellation email:', err),
            );
        }
      } else {
        // Notify instructor that client cancelled
        const instructorEmail = updatedBooking.instructorUser?.email;
        if (instructorEmail) {
          const clientName =
            updatedBooking.guestName ||
            [updatedBooking.client?.firstName, updatedBooking.client?.lastName]
              .filter(Boolean)
              .join(' ') ||
            'Client';

          this.emailService
            .sendCancellationByClient(instructorEmail, {
              clientName,
              date: bookingDate,
              time: bookingTime,
              reason: dto.cancellationReason,
            })
            .catch((err) =>
              console.error('Failed to send cancellation email:', err),
            );
        }
      }
    }

    return updatedBooking;
  }

  /**
   * Cancel a booking as a guest (via cancellation token link)
   */
  async cancelGuestBooking(
    bookingId: string,
    token: string,
    cancellationReason?: string,
    language: 'pl' | 'en' = 'pl',
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate the cancellation token
    if (!booking.cancellationToken || booking.cancellationToken !== token) {
      throw new BadRequestException('Invalid or expired cancellation link');
    }

    // Check if the cancellation token has expired (7 days from generation)
    if (
      booking.cancellationTokenExpiresAt &&
      new Date() > booking.cancellationTokenExpiresAt
    ) {
      throw new BadRequestException(
        language === 'pl'
          ? 'Link do anulowania wygasł. Skontaktuj się z instruktorem.'
          : 'Cancellation link has expired. Please contact the instructor.',
      );
    }

    // Check cancellation deadline (minNoticeHours from instructor profile)
    const now = new Date();
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { userId: booking.instructorId },
    });

    if (profile && booking.startTime) {
      const deadlineDate = new Date(
        booking.startTime.getTime() - profile.minNoticeHours * 60 * 60 * 1000,
      );

      if (now > deadlineDate) {
        const hours = profile.minNoticeHours;
        throw new BadRequestException(
          language === 'pl'
            ? `Okno anulowania minęło. Możesz anulować do ${hours} godz. przed sesją.`
            : `Cancellation window has passed. You can cancel up to ${hours} hours before the session.`,
        );
      }
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (booking.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed booking');
    }

    // Only allow token-based cancellation for PENDING or CONFIRMED bookings
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Cancellation is not allowed for this booking',
      );
    }

    // Use $transaction with status check to prevent race conditions:
    // If two cancellation requests arrive simultaneously, only one succeeds
    // because the WHERE clause checks status at update time
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

    // Send notification to instructor
    if (updatedBooking.startTime && updatedBooking.instructorUser?.email) {
      const locale = language === 'pl' ? 'pl-PL' : 'en-GB';
      const bookingDate = updatedBooking.startTime.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const bookingTime = updatedBooking.startTime.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
      });

      const clientName = booking.guestName || 'Client';

      this.emailService
        .sendCancellationByClient(updatedBooking.instructorUser.email, {
          clientName,
          date: bookingDate,
          time: bookingTime,
          reason: cancellationReason,
        })
        .catch((err) =>
          console.error('Failed to send cancellation email:', err),
        );
    }

    return { success: true, message: 'Booking cancelled successfully' };
  }

  /**
   * DELETE bookings/history
   * Remove completed or cancelled bookings for the requesting client
   */
  async clearUserHistory(userId: string) {
    // We update the flag (soft-delete) instead of hard-deleting to preserve reviews
    const result = await this.prisma.booking.updateMany({
      where: {
        clientId: userId,
        hiddenFromClient: false, // Only update columns that are not already hidden
        status: {
          in: ['COMPLETED', 'CANCELLED'],
        },
      },
      data: {
        hiddenFromClient: true, // Hide them from the client's view
      },
    });

    return { deleted: result.count };
  }

  /**
   * Create manual block (instructor only)
   */
  async createManualBlock(
    userId: string,
    instructorProfileId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
  ) {
    // Verify user is the instructor
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
    });

    if (!profile || profile.userId !== userId) {
      throw new ForbiddenException('You are not this instructor');
    }

    // Validate time range
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const duration = Math.floor(
      (endTime.getTime() - startTime.getTime()) / (60 * 1000),
    );

    if (duration <= 0) {
      throw new BadRequestException('Duration must be positive');
    }

    // Check for overlapping bookings (using profile.userId not instructorProfileId)
    const existingBooking = await this.prisma.booking.findFirst({
      where: {
        instructorId: profile.userId, // Use userId for booking.instructorId
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
        instructorId: profile.userId, // Use userId, not instructorProfileId
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
   * Scheduled cleanup: nullify expired cancellation tokens.
   * Run via cron job (e.g., every hour).
   * Prevents indefinite accumulation of unused tokens in the database.
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
      throw new ForbiddenException(
        'Only the instructor can acknowledge cancellations',
      );
    }

    // Verify booking is cancelled
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
}
