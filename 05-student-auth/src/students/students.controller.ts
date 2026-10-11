import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { StudentsService } from './students.service.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { AuthGuard } from '../auth/guards/auth.guard.js';
import { AuthorizationGuard } from '../auth/guards/authorization.guard.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { Role, Roles } from '../auth/decorators/roles.decorator.js';
import type { AuthUser } from '../auth/auth-user.js';

@UseGuards(AuthGuard) // class level: every route needs a valid token unless @Public
@Controller('students')
export class StudentsController {
  constructor(private studentsService: StudentsService) {}

  @Public()
  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  // Declared before ':id', otherwise "currentUser" would be read as an id.
  @Get('currentUser')
  getCurrentUser(@Req() { user }: { user: AuthUser }) {
    return this.studentsService.findById(user.userid);
  }

  @Roles(Role.User)
  @UseGuards(AuthorizationGuard)
  @Post('currentUser/courses/:courseId')
  enrollMyself(@Req() { user }: { user: AuthUser }, @Param('courseId') courseId: string) {
    return this.studentsService.enroll(user.userid, courseId);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthorizationGuard)
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentsService.findById(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthorizationGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateStudentDto) {
    return this.studentsService.update(id, dto);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthorizationGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
