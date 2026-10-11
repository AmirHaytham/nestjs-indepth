import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Course } from './schemas/course.schema.js';
import { CreateCourseDto } from './dto/create-course.dto.js';
import { UpdateCourseDto } from './dto/update-course.dto.js';
import { checkId, notFound, rethrowDuplicate } from '../common/mongo-errors.js';

@Injectable()
export class CoursesService {
  constructor(@InjectModel(Course.name) private courseModel: Model<Course>) {}

  findAll() {
    return this.courseModel.find().sort({ code: 1 }).exec();
  }

  async findById(id: string) {
    checkId(id);
    const course = await this.courseModel.findById(id).exec();
    return course ?? notFound('Course', id);
  }

  async create(dto: CreateCourseDto) {
    try {
      return await this.courseModel.create(dto);
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async update(id: string, dto: UpdateCourseDto) {
    checkId(id);
    const course = await this.courseModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after', runValidators: true })
      .exec();
    return course ?? notFound('Course', id);
  }

  async remove(id: string) {
    checkId(id);
    const course = await this.courseModel.findByIdAndDelete(id).exec();
    return course ?? notFound('Course', id);
  }
}
