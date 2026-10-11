import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { StudentsModule } from '../students/students.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    StudentsModule,
    // registerAsync, not register: the values are read after .env is loaded.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: config.getOrThrow('JWT_EXPIRES_IN') },
      }),
    }),
  ],
})
export class AuthModule {}
