import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersController } from './users/users.controller.js';
import { ReportsController } from './reports/reports.controller.js';
import { FakeLoginMiddleware } from './auth/fake-login.middleware.js';

@Module({
  controllers: [AppController, UsersController, ReportsController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FakeLoginMiddleware).forRoutes('*path');
  }
}
