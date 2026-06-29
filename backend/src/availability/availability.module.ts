import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InstructorProfilesModule } from '../instructor-profiles/instructor-profiles.module';

@Module({
  imports: [PrismaModule, InstructorProfilesModule],
  providers: [AvailabilityService],
  controllers: [AvailabilityController],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
