import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEnterpriseLeadDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  instructorCount?: string;
}
