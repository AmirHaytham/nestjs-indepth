import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import type { AuthUser, RequestWithUser } from '../auth-user.js';

// Authentication: who are you?
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractToken(request);
    if (!token) {
      throw new UnauthorizedException('No token, please login');
    }
    try {
      // The secret comes from the JwtModule config, no need to repeat it here.
      const payload = await this.jwtService.verifyAsync<AuthUser>(token);
      // Put the payload on the request so route handlers can use it.
      request.user = payload;
    } catch {
      throw new UnauthorizedException('invalid token');
    }
    return true;
  }

  // Cookie for browsers, Authorization: Bearer for Postman and mobile apps.
  private extractToken(request: RequestWithUser): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return request.cookies?.token ?? (type === 'Bearer' ? token : undefined);
  }
}
