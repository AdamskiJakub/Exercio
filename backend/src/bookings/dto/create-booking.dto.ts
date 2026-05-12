import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
}
