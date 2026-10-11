import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('Guards and metadata', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, role?: string) => {
    const req = request(app.getHttpServer()).get(path);
    return role ? req.set('x-role', role) : req;
  };

  it('a route with no @Roles is open to everyone', () => get('/users/public').expect(200));

  it('no user on an admin route is 401', () => get('/users/admin').expect(401));

  it('a student on an admin route is 403', () => get('/users/admin', 'student').expect(403));

  it('an admin on an admin route is 200', () => get('/users/admin', 'admin').expect(200));

  it('"Admin" with a capital A is not "admin"', () => get('/users/admin', 'Admin').expect(403));

  it('class level @Roles blocks a student', () => get('/reports/grades', 'student').expect(403));

  it('route level @Roles overrides the class', () => get('/reports/mine', 'student').expect(200));

  it('@Public skips the check entirely', () => get('/reports/schedule').expect(200));

  it('middleware runs even when the guard says no', () =>
    get('/users/admin', 'student').expect(403).expect('X-Course', 'SP1'));
});
