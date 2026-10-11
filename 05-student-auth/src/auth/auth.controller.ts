import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterRequestDto } from './dto/register-request.dto.js';
import { SignInDto } from './dto/sign-in.dto.js';

const MINUTE = 60 * 1000;

const cookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript in the browser cannot read it
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax',
};

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async signup(@Body() registerRequestDto: RegisterRequestDto) {
    const data = await this.authService.register(registerRequestDto);
    return { message: 'User registered successfully', data };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // @Post answers 201 unless told otherwise
  async signIn(@Body() signInDto: SignInDto, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.signIn(signInDto.email, signInDto.password);
    this.setCookies(res, tokens);
    return { message: 'Login successful' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const tokens = await this.authService.refresh(req.cookies?.refresh_token);
    this.setCookies(res, tokens);
    return { message: 'Token refreshed' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token', cookieOptions);
    res.clearCookie('refresh_token', { ...cookieOptions, path: '/auth' });
    return { message: 'Logged out' };
  }

  private setCookies(res: Response, tokens: { access_token: string; refresh_token: string }) {
    res.cookie('token', tokens.access_token, { ...cookieOptions, maxAge: 15 * MINUTE });
    // Only sent to /auth/..., so it does not travel with every request.
    res.cookie('refresh_token', tokens.refresh_token, {
      ...cookieOptions,
      path: '/auth',
      maxAge: 7 * 24 * 60 * MINUTE,
    });
  }
}
