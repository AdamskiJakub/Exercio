import { IsString, IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAvailableSlotsDto {
  @IsString()
  instructorId: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  timezoneOffset?: number;
}