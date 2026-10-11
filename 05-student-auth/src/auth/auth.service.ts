import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { StudentsService } from '../students/students.service.js';
import { RegisterRequestDto } from './dto/register-request.dto.js';
import type { AuthUser } from './auth-user.js';

@Injectable()
export class AuthService {
  constructor(
    private studentsService: StudentsService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterRequestDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.studentsService.create({ ...dto, password: hashedPassword });
  }

  async signIn(email: string, password: string) {
    const user = await this.studentsService.findByEmailWithPassword(email);

    // Same answer for "no such email" and "wrong password", so nobody
    // can use the login form to find out who has an account.
    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens({ userid: user._id.toString(), role: user.role });
  }

  async refresh(refreshToken: string | undefined) {
    if (!refreshToken) throw new UnauthorizedException('No refresh token, please login');
    try {
      const { userid, role } = await this.jwtService.verifyAsync<AuthUser>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
      return this.issueTokens({ userid, role });
    } catch {
      throw new UnauthorizedException('Invalid refresh token, please login');
    }
  }

  private async issueTokens(payload: AuthUser) {
    return {
      access_token: await this.jwtService.signAsync(payload),
      refresh_token: await this.jwtService.signAsync(payload, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: this.config.getOrThrow('JWT_REFRESH_EXPIRES_IN'),
      }),
    };
  }
}
