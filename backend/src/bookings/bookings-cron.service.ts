import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingsCronService {
  private readonly logger = new Logger(BookingsCronService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run every hour to expire pending bookings that haven't been confirmed within 24 hours
   */
  @Cron(CronExpression.EVERY_HOUR)
  async expirePendingBookings() {
    this.logger.log('Running expirePendingBookings cron job...');

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          status: 'PENDING',
          createdAt: {
            lt: twentyFourHoursAgo,
          },
        },
        data: {
          status: 'EXPIRED',
        },
      });

      this.logger.log(`Expired ${result.count} pending bookings`);
    } catch (error) {
      this.logger.error('Failed to expire pending bookings', error);
    }
  }

  /**
   * Optional: Run daily to clean up very old completed/cancelled bookings
   * This keeps the database lean, but you may want to keep all booking history
   */
  // @Cron(CronExpression.EVERY_DAY_AT_3AM)
  // async cleanupOldBookings() {
  //   this.logger.log('Running cleanupOldBookings cron job...');
  //   
  //   const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
  //   
  //   try {
  //     const result = await this.prisma.booking.deleteMany({
  //       where: {
  //         status: {
  //           in: ['COMPLETED', 'CANCELLED', 'EXPIRED'],
  //         },
  //         updatedAt: {
  //           lt: sixMonthsAgo,
  //         },
  //       },
  //     });
  //     
  //     this.logger.log(`Cleaned up ${result.count} old bookings`);
  //   } catch (error) {
  //     this.logger.error('Failed to cleanup old bookings', error);
  //   }
  // }
}
