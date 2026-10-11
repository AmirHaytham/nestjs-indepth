import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Student management API with auth. Start with POST /auth/register';
  }
}
