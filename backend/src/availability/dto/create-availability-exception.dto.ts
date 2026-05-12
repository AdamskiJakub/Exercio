import {
  IsDateString,
  IsBoolean,
  IsString,
  Matches,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateAvailabilityExceptionDto {
  @IsDateString()
  date: string; // ISO 8601 date format

  @IsBoolean()
  isAvailable: boolean; // If false, completely unavailable this day

  @ValidateIf((o) => o.isAvailable === true)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  @IsOptional()
  startTime?: string; // Only if isAvailable = true

  @ValidateIf((o) => o.isAvailable === true)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  @IsOptional()
  endTime?: string; // Only if isAvailable = true

  @IsString()
  @IsOptional()
  reason?: string; // Optional reason (vacation, training, etc.)
}
