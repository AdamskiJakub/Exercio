import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsNotEmpty, IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  @IsNotEmpty()
  instructorId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string; // ISO 8601 format

  @IsString()
  @IsOptional()
  notes?: string;

  // Guest booking fields (for non-authenticated users)
  @IsString()
  @IsOptional()
  guestName?: string;

  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @IsString()
  @IsOptional()
  guestPhone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  timezoneOffset?: number;
}
