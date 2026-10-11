import { Controller, Get, INestApplication, Req, UseGuards } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AuthGuard } from '../src/auth/guards/auth.guard.js';
import { AuthorizationGuard } from '../src/auth/guards/authorization.guard.js';
import { Public } from '../src/auth/decorators/public.decorator.js';
import { Role, Roles } from '../src/auth/decorators/roles.decorator.js';
import type { AuthUser } from '../src/auth/auth-user.js';

// The real guards on a tiny controller, so no database is needed.
@UseGuards(AuthGuard)
@Controller('test')
class TestController {
  @Public()
  @Get('open')
  open() {
    return 'open';
  }

  @Get('me')
  me(@Req() { user }: { user: AuthUser }) {
    return user;
  }

  @Roles(Role.Admin)
  @UseGuards(AuthorizationGuard)
  @Get('admin')
  admin() {
    return 'admin only';
  }
}

describe('AuthGuard and AuthorizationGuard', () => {
  let app: INestApplication<App>;
  let jwt: JwtService;
  const secret = 'test-secret';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [JwtModule.register({ global: true, secret, signOptions: { expiresIn: '15m' } })],
      controllers: [TestController],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    await app.init();
    jwt = moduleRef.get(JwtService);
  });

  afterAll(() => app.close());

  const tokenFor = (role: Role) => jwt.sign({ userid: 'u1', role });
  const get = (path: string) => request(app.getHttpServer()).get(path);

  it('@Public lets anyone in', () => get('/test/open').expect(200));

  it('no token is 401', () => get('/test/me').expect(401));

  it('a token in the cookie works, and request.user is the payload', async () => {
    const res = await get('/test/me').set('Cookie', `token=${tokenFor(Role.User)}`).expect(200);
    expect(res.body).toMatchObject({ userid: 'u1', role: 'student' });
  });

  it('a token in the Authorization header works', () =>
    get('/test/me').set('Authorization', `Bearer ${tokenFor(Role.User)}`).expect(200));

  it('a token signed with another secret is 401', () =>
    get('/test/me').set('Authorization', `Bearer ${jwt.sign({ userid: 'u1', role: 'admin' }, { secret: 'guess' })}`).expect(401));

  it('an expired token is 401', () =>
    get('/test/me').set('Authorization', `Bearer ${jwt.sign({ userid: 'u1', role: 'student' }, { expiresIn: '-1s' })}`).expect(401));

  it('a student on an admin route is 403', () =>
    get('/test/admin').set('Authorization', `Bearer ${tokenFor(Role.User)}`).expect(403));

  it('an admin on an admin route is 200', () =>
    get('/test/admin').set('Authorization', `Bearer ${tokenFor(Role.Admin)}`).expect(200));
});
