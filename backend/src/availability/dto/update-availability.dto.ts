import { IsString, Matches, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  @IsOptional()
  startTime?: string;

  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
