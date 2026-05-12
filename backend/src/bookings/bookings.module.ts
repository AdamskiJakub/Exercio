import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsCronService } from './bookings-cron.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BookingsService, BookingsCronService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}
