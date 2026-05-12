import { IsArray, ValidateNested, IsInt, IsBoolean, IsString, Min, Max, Matches, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

class DayScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsBoolean()
  isAvailable: boolean;

  @ValidateIf((o) => o.isAvailable)
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:MM format',
  })
  startTime: string;

  @ValidateIf((o) => o.isAvailable)
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:MM format',
  })
  endTime: string;
}

export class SetWeeklyAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule: DayScheduleDto[];
}
