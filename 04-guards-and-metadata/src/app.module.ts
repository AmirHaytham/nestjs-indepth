import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './users/users.controller.js';
import { ReportsController } from './reports/reports.controller.js';
import { FakeLoginMiddleware } from './auth/fake-login.middleware.js';
import { LoggerMiddleware } from './middleware/logger.middleware.js';
import { courseHeader } from './middleware/course-header.middleware.js';

@Module({
  controllers: [AppController, UsersController, ReportsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  // Middleware runs in this order, for every route, before any guard.
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware, courseHeader, FakeLoginMiddleware).forRoutes('*path');
  }
}
