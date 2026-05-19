import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { InstructorProfilesModule } from './instructor-profiles/instructor-profiles.module';
import { UploadModule } from './upload/upload.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { AvailabilityModule } from './availability/availability.module';
import { StaticConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    InstructorProfilesModule,
    UploadModule,
    UsersModule,
    BookingsModule,
    AvailabilityModule,
    StaticConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
