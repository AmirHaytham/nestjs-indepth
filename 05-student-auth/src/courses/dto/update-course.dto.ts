import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseDto } from './create-course.dto.js';

// Every field of CreateCourseDto, all optional, same rules.
export class UpdateCourseDto extends PartialType(CreateCourseDto) {}
