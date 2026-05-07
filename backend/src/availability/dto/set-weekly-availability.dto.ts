import { IsArray, ValidateNested, IsInt, IsBoolean, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

class DayScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsBoolean()
  isAvailable: boolean;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class SetWeeklyAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule: DayScheduleDto[];
}
