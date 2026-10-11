import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Guards demo. Try GET /users/public with an x-role header.';
  }
}
