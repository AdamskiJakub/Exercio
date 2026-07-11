import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class BecomeInstructorDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message:
      'Phone number must be a valid phone number (7-20 digits, may include +, -, spaces, parentheses)',
  })
  phone: string;
}
