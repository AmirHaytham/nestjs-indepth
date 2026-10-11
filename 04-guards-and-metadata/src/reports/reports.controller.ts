import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role, Roles } from '../auth/roles.decorator.js';
import { Public } from '../auth/public.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

// Roles on the class apply to every route. A route can override them.
@Controller('reports')
@UseGuards(RolesGuard)
@Roles(Role.Admin)
export class ReportsController {
  @Get('grades')
  allGrades() {
    return 'Every grade in the course. Class level @Roles: admin only.';
  }

  @Get('mine')
  @Roles(Role.User, Role.Admin)
  myGrades() {
    return 'Your own grades. Route level @Roles overrides the class.';
  }

  @Get('schedule')
  @Public()
  schedule() {
    return 'Exam schedule. @Public skips the role check.';
  }
}
