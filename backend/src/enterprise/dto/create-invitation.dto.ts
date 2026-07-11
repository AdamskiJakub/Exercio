import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  @IsNotEmpty()
  instructorId!: string;

  @IsString()
  @IsOptional()
  role?: string;
}
