# 04. Middleware, guards, Reflector and metadata

From the middleware, guards, Reflector and metadata slides.

The slide's `LoggerMiddleware` and a function middleware, then the
`UsersController` from the Reflector slide with a `RolesGuard`, plus a second
controller that shows class level roles, route level overrides and `@Public`. No database and no real login: send an `x-role` header and you are
that user. Folder 05 replaces that with a JWT.

## Run it

```bash
npm install
```

```bash
npm run start:dev
```

In a second terminal:

```bash
npm run demo
```

Tests, no server needed:

```bash
npm test
```

Then the metadata itself:

```bash
npm run peek
```

## Worth showing

**Middleware first.** Keep the API terminal visible while the demo runs. The
slide's `LoggerMiddleware` prints `Request...` for every single call, including
the 401s and 403s. Middleware runs before any guard and never knows which
handler comes next. That is the slide's "main difference": middleware processes
the request, a guard decides whether it can proceed.

**Both kinds from the slide are here.** `LoggerMiddleware` is the class version,
with `@Injectable()` and `NestMiddleware`. `courseHeader` is the function
version, plain `(req, res, next)` like Express, and it adds an `X-Course` header
to every response. Both are registered in `app.module.ts`, in the order they
run. Forget `next()` in either one and every request hangs.

**The demo prints one table:** each route against nobody, a student and an
admin. Walk it row by row. It is the whole idea of guards in one screen.

**`npm run peek` shows the slide's chain is real.** `@Roles('admin')` stored
`["admin"]` on the method, and that is the only thing the guard ever reads.
Decorators write, Reflector reads, the guard decides.

**Class versus route.** `ReportsController` has `@Roles(Role.Admin)` on the
class, so `/reports/grades` is admin only. `/reports/mine` has its own `@Roles`
that lets students in, because `getAllAndOverride` checks the method first and
only falls back to the class.

**401 versus 403.** No user is 401, "who are you?". A student on an admin route
is 403, "we know who you are, and no". The slide's guard throws 401 for both.

## What is different from the slides

**`'Admin'` and `'admin'` are different roles.** The Reflector slide writes
`@Roles('Admin')`, the authorization slide's enum is `Admin = 'admin'`. Mix the
two and real admins get 403. One of the tests checks exactly that. Use the
enum, never a string.

**`request['user'] = payload` does not compile** in a NestJS 12 project.
Express's `Request` type has no `user` field. `src/auth/auth-user.ts` adds it
with a small type, so `request.user` works and is typed.
