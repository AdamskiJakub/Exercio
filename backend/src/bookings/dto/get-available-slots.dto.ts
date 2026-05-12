import { IsDateString, IsNotEmpty, IsUUID } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsUUID()
  @IsNotEmpty()
  instructorId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string; // ISO 8601 format - beginning of date range

  @IsDateString()
  @IsNotEmpty()
  endDate: string; // ISO 8601 format - end of date range (max 30 days from startDate)
}
