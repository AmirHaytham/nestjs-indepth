import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto.js';

// Name and age only. Email and password changes deserve their own routes.
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['email', 'password'] as const),
) {}
