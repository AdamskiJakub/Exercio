import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  END_OF_DAY_HOURS,
  END_OF_DAY_MINUTES,
  END_OF_DAY_SECONDS,
  END_OF_DAY_MS,
} from '../bookings.constants';
import type {
  TimeSlot,
  WeeklyAvailabilitySlot,
  AvailabilityExceptionSlot,
  BookingOverlapInfo,
  BookingWithClientInfo,
} from '../types/booking.types';
import {
  toWeeklyAvailabilitySlots,
  toAvailabilityExceptionSlots,
} from '../types/booking.types';

@Injectable()
export class SlotGenerationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get available time slots for an instructor in a date range
   */
  async getAvailableSlots(
    instructorProfileId: string,
    startDate: Date,
    endDate: Date,
    requestingUserId?: string,
    timezoneOffset: number = 0,
  ): Promise<TimeSlot[]> {
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

    // Check if requesting user is the instructor (for PII access control)
    const isInstructor = requestingUserId === profile.userId;

    const endDateTime = new Date(endDate);
    endDateTime.setUTCHours(
      END_OF_DAY_HOURS,
      END_OF_DAY_MINUTES,
      END_OF_DAY_SECONDS,
      END_OF_DAY_MS,
    );

    // Get PENDING and CONFIRMED bookings - these block slots
    const existingBookings = (await this.prisma.booking.findMany({
      where: {
        instructorId: profile.userId,
        startTime: {
          lt: endDateTime,
        },
        endTime: {
          gt: startDate,
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
    })) as unknown as BookingOverlapInfo[];

    // Get CANCELLED bookings separately - for display only, don't block slots
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
            acknowledgedAt: null,
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
      : [];

    // Map raw Prisma data to typed structures with runtime validation
    const weeklyAvailabilitySlots = toWeeklyAvailabilitySlots(
      profile.weeklyAvailability as unknown[],
    );
    const exceptionSlots = toAvailabilityExceptionSlots(
      profile.availabilityExceptions as unknown[],
    );

    // Generate slots
    return this.generateTimeSlots(
      startDate,
      endDate,
      profile.sessionDuration,
      profile.minNoticeHours,
      weeklyAvailabilitySlots,
      exceptionSlots,
      existingBookings,
      cancelledBookings,
      timezoneOffset,
    );
  }

  /**
   * Core slot generation algorithm
   */
  private generateTimeSlots(
    startDate: Date,
    endDate: Date,
    sessionDuration: number,
    minNoticeHours: number,
    weeklyAvailability: WeeklyAvailabilitySlot[],
    exceptions: AvailabilityExceptionSlot[],
    existingBookings: BookingOverlapInfo[],
    cancelledBookings: any[],
    timezoneOffset: number = 0,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];

    // Force dates to absolute midnight UTC to prevent server drifting
    const currentDate = new Date(startDate);
    currentDate.setUTCHours(0, 0, 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setUTCHours(
      END_OF_DAY_HOURS,
      END_OF_DAY_MINUTES,
      END_OF_DAY_SECONDS,
      END_OF_DAY_MS,
    );

    const now = new Date();
    const minNoticeDate = new Date(
      now.getTime() + minNoticeHours * 60 * 60 * 1000,
    );

    while (currentDate <= endDateTime) {
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

      // Convert local time (from instructor panel) to UTC
      // timezoneOffset = -(UTC - local), e.g. for Poland -120
      // UTC_minutes = local_minutes + timezoneOffset
      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      let startUtcMinutes = startTotalMinutes + timezoneOffset;
      let endUtcMinutes = endTotalMinutes + timezoneOffset;

      // Normalize to 0-1439 range (00:00-23:59)
      while (startUtcMinutes < 0) startUtcMinutes += 24 * 60;
      while (startUtcMinutes >= 24 * 60) startUtcMinutes -= 24 * 60;
      while (endUtcMinutes < 0) endUtcMinutes += 24 * 60;
      while (endUtcMinutes >= 24 * 60) endUtcMinutes -= 24 * 60;

      const utcStartHour = Math.floor(startUtcMinutes / 60);
      const utcStartMinute = startUtcMinutes % 60;
      const utcEndHour = Math.floor(endUtcMinutes / 60);
      const utcEndMinute = endUtcMinutes % 60;

      // Build day boundaries in pure UTC
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

        if (slotStart > minNoticeDate) {
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
            const clientName = this.formatClientName(bookedSession);
            const clientEmail = this.formatClientEmail(bookedSession);

            slots.push({
              startTime: new Date(slotStart),
              endTime: new Date(slotEnd),
              isShortNotice: slotStart < minNoticeDate,
              isException,
              available: false,
              booking: {
                id: bookedSession.id,
                status: bookedSession.status,
                notes: this.asStringOrUndefined(bookedSession.notes),
                clientName,
                clientEmail,
                cancellationReason: this.asStringOrUndefined(
                  bookedSession.cancellationReason,
                ),
                cancelledBy: this.asStringOrUndefined(
                  bookedSession.cancelledBy,
                ),
              },
            });
          } else if (cancelledSession) {
            const clientName = this.formatClientName(cancelledSession);
            const clientEmail = this.formatClientEmail(cancelledSession);

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
   * Format client name from a booking record (handles both guest and registered clients)
   */
  private formatClientName(booking: BookingWithClientInfo): string {
    if (typeof booking.guestName === 'string' && booking.guestName) {
      return booking.guestName;
    }
    if (booking.client && typeof booking.client === 'object') {
      return `${booking.client.firstName || ''} ${booking.client.lastName || ''}`.trim();
    }
    return 'Unknown Client';
  }

  /**
   * Format client email from a booking record
   */
  private formatClientEmail(
    booking: BookingWithClientInfo,
  ): string | undefined {
    if (typeof booking.guestEmail === 'string') {
      return booking.guestEmail;
    }
    if (booking.client && typeof booking.client === 'object') {
      return booking.client.email || undefined;
    }
    return undefined;
  }

  /**
   * Safely convert a field that might be `string | boolean` to `string | undefined`
   */
  private asStringOrUndefined(
    value: string | boolean | null | undefined,
  ): string | undefined {
    if (typeof value === 'string') {
      return value || undefined;
    }
    return undefined;
  }
}
