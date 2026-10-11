import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Course } from '../../courses/schemas/course.schema.js';
import { Role } from '../../auth/decorators/roles.decorator.js';

export type StudentDocument = HydratedDocument<Student>;

@Schema({ timestamps: true })
export class Student {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  // select: false keeps the hash out of every query unless asked for.
  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: String, enum: Role, default: Role.User })
  role: Role;

  @Prop()
  age: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: Course.name }], default: [] })
  courses: Types.ObjectId[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
