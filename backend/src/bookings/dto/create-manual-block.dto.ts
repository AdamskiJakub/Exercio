import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateManualBlockDto {
  @IsUUID()
  @IsNotEmpty()
  instructorId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
