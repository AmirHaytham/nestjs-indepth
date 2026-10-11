import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, ROLES_KEY } from '../decorators/roles.decorator.js';
import type { RequestWithUser } from '../auth-user.js';

// Authorization: what are you allowed to do? Runs after AuthGuard.
@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) {
      throw new UnauthorizedException('no user attached');
    }
    // 403, not 401: we know who you are, you just are not allowed.
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('unauthorized access');
    }
    return true;
  }
}
