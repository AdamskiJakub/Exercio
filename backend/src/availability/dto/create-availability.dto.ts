import {
  IsInt,
  Min,
  Max,
  IsString,
  Matches,
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string; // Format: "HH:MM"

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string; // Format: "HH:MM"

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
