import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// The class version from the middleware slide: @Injectable() + NestMiddleware.
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    console.log(`Request... ${req.method} ${req.originalUrl}`);

    // Middleware cannot know what the guard will decide, but it can
    // wait for the response and log how it ended.
    res.on('finish', () => {
      console.log(`  -> ${res.statusCode} in ${Date.now() - start} ms`);
    });

    next();
  }
}
