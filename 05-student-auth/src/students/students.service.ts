import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Student } from './schemas/student.schema.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { CoursesService } from '../courses/courses.service.js';
import { checkId, notFound, rethrowDuplicate } from '../common/mongo-errors.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectModel(Student.name) private studentModel: Model<Student>,
    private coursesService: CoursesService,
  ) {}

  findAll() {
    return this.studentModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string) {
    checkId(id);
    const student = await this.studentModel.findById(id).populate('courses').exec();
    return student ?? notFound('Student', id);
  }

  // The only query that brings the password hash back, for login.
  findByEmailWithPassword(email: string) {
    return this.studentModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async create(dto: CreateStudentDto) {
    try {
      const { password: _hash, ...student } = (await this.studentModel.create(dto)).toObject();
      return student;
    } catch (error) {
      rethrowDuplicate(error);
    }
  }

  async update(id: string, dto: UpdateStudentDto) {
    checkId(id);
    const student = await this.studentModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after', runValidators: true })
      .exec();
    return student ?? notFound('Student', id);
  }

  async remove(id: string) {
    checkId(id);
    const student = await this.studentModel.findByIdAndDelete(id).exec();
    return student ?? notFound('Student', id);
  }

  async enroll(studentId: string, courseId: string) {
    const course = await this.coursesService.findById(courseId);
    checkId(studentId);
    const student = await this.studentModel
      .findByIdAndUpdate(studentId, { $addToSet: { courses: course._id } }, { returnDocument: 'after' })
      .populate('courses')
      .exec();
    return student ?? notFound('Student', studentId);
  }
}
