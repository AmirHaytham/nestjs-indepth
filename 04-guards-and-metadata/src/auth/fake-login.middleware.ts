import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Response } from 'express';
import type { RequestWithUser } from './auth-user.js';

// Stands in for a real login so this folder can focus on guards.
// Send "x-role: admin" or "x-role: student" and you are that user.
// Folder 05 replaces this with a real JWT.
@Injectable()
export class FakeLoginMiddleware implements NestMiddleware {
  use(req: RequestWithUser, res: Response, next: NextFunction) {
    const role = req.headers['x-role'];
    if (typeof role === 'string') {
      req.user = { userid: 'demo-user', role };
    }
    next();
  }
}
