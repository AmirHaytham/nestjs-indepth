import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role, Roles } from '../auth/roles.decorator.js';
import { RolesGuard } from '../auth/roles.guard.js';

// The controller from the Reflector slide, with the enum instead of 'Admin'.
@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  @Get('admin')
  @Roles(Role.Admin)
  getAdminData() {
    return 'This is admin-only data.';
  }

  @Get('public')
  getPublicData() {
    return 'This is accessible to everyone.';
  }
}
