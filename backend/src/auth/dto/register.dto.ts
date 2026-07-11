import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  Matches,
  IsIn,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  @MaxLength(30, { message: 'Username must not exceed 30 characters' })
  @Matches(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
    message:
      'Username must start and end with alphanumeric character, and can only contain lowercase letters, numbers, and hyphens',
  })
  username: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  @IsIn(['CLIENT', 'INSTRUCTOR'], {
    message: 'Role must be CLIENT or INSTRUCTOR',
  })
  role?: 'CLIENT' | 'INSTRUCTOR';
}
