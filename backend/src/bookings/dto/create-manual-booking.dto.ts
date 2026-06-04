import { IsDateString, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO for creating a manual booking by an instructor
 * Used when instructor books a slot manually (e.g., phone booking)
 */
export class CreateManualBookingDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string; // ISO 8601 format

  @IsString()
  @IsOptional()
  notes?: string;

  // Guest information (required for manual bookings)
  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsNotEmpty()
  guestEmail: string;

  @IsString()
  @IsNotEmpty()
  guestPhone: string;
}
