import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

// No "role" field on purpose. With whitelist + forbidNonWhitelisted in main.ts,
// sending { role: 'admin' } is rejected instead of silently trusted.
export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsInt()
  @Min(16)
  @Max(99)
  age?: number;
}
