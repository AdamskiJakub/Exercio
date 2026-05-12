import {
  IsBoolean,
  IsString,
  Matches,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UpdateAvailabilityExceptionDto {
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ValidateIf((o) => o.isAvailable === true)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  @IsOptional()
  startTime?: string;

  @ValidateIf((o) => o.isAvailable === true)
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
