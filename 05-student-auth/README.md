# 05. Student management with auth

From the whole tutorial: the student management recap, DTOs, and the
implementation slides for register, login, the auth guard, `@Public`, roles and
the authorization guard.

The Lab 4 student app, rebuilt with everything on top: DTOs with validation,
bcrypt, JWT in an httpOnly cookie, a refresh token, both guards, roles and CORS.

## Run it

You need MongoDB on `localhost:27017`.

```bash
npm install
```

```bash
copy .env.example .env
```

```bash
npm run start:dev
```

The API runs on port 5001, like the CORS slide. In a second terminal, run the
whole flow:

```bash
npm run demo
```

Tests for both guards, no database needed:

```bash
npm test
```

To make an existing user an admin:

```bash
npm run make-admin -- someone@giu-uni.de
```

## The routes

| Method | Route | Who |
|---|---|---|
| POST | `/auth/register` | anyone |
| POST | `/auth/login` | anyone, sets the cookies |
| POST | `/auth/refresh` | anyone with a refresh cookie |
| POST | `/auth/logout` | anyone, clears the cookies |
| GET | `/students` | anyone (`@Public`) |
| GET | `/students/currentUser` | logged in |
| POST | `/students/currentUser/courses/:courseId` | student, enrolls themself |
| GET, PATCH, DELETE | `/students/:id` | admin |
| GET | `/courses`, `/courses/:id` | anyone (`@Public`) |
| POST, PATCH, DELETE | `/courses`, `/courses/:id` | admin |

With Postman or Thunder Client, log in once and the client keeps the cookie.
Or copy the `token` cookie and send it as `Authorization: Bearer <token>`. The
guard accepts both, like the slide.

## Where each slide lives

| Slide | File |
|---|---|
| Modules, `forFeature` | `students/students.module.ts`, `courses/courses.module.ts` |
| Schemas | `students/schemas`, `courses/schemas` |
| `@InjectModel` | `students/students.service.ts` |
| DTOs | `students/dto`, `courses/dto`, `auth/dto` |
| Hashing | `auth/auth.service.ts`, `register` and `signIn` |
| Cookies | `auth/auth.controller.ts`, `setCookies` |
| Access and refresh tokens | `auth/auth.service.ts`, `issueTokens` and `refresh` |
| `JwtModule` | `auth/auth.module.ts` |
| Authentication guard | `auth/guards/auth.guard.ts` |
| `@Public` | `auth/decorators/public.decorator.ts` |
| Authorization guard, `@Roles` | `auth/guards/authorization.guard.ts`, `auth/decorators/roles.decorator.ts` |
| CORS, ValidationPipe | `main.ts` |
| Usage | `students/students.controller.ts` |

## Worth showing

Walk the demo output top to bottom. Every status code is a slide:

1. Register: 201, a duplicate email 409, `role: "admin"` in the body 400, bad
   fields 400 with every problem listed.
2. Login: wrong password and unknown email give the **same** 401 message.
3. `/students/currentUser` without a cookie 401, with one 200.
4. The same token works as a Bearer header.
5. A token with its role edited to admin: 401, the signature broke.
6. A student on an admin route: 403.
7. An admin creates a course. 40 credits fails the DTO.
8. The student enrolls, the admin sees it.
9. Refresh gives new cookies, logout clears them, then 401 again.

Also open `GET /students` in the browser. No password hashes anywhere. That is
`select: false` on the schema.

## What the slide code gets wrong

Every one of these was checked by running the slide's version.

**The JWT secret is `undefined`.** `JwtModule.register({ secret:
process.env.JWT_SECRET })` is read when `auth.module.ts` is loaded, which
happens before `ConfigModule` loads `.env`. Login then fails with
"secretOrPrivateKey must have a value". `JwtModule.registerAsync` with
`ConfigService` reads it after. Fixed in `auth/auth.module.ts`.

**`JWT_EXPIRES_IN=3600` means 3 seconds.** See folder 02. `.env.example` uses
`15m` and `7d`.

**Anyone can register as an admin.** The register slide spreads the whole
request body into the new user. If the DTO has a `role` field, or the pipe is
not set to reject unknown fields, `{ "role": "admin" }` just works. Here the DTO
has no `role` and `forbidNonWhitelisted` answers 400. Admins are made with
`npm run make-admin`.

**The login slide says 200 but answers 201.** It puts `statusCode:
HttpStatus.OK` in the body, while `@Post` sends 201. `@HttpCode(HttpStatus.OK)`
fixes the real status.

**"User not found" tells strangers who has an account.** Type any email, and
the message says whether it exists. Both cases now answer "Invalid
credentials".

**`console.log(user.password)` prints the hash on every login.** Removed.

**Every student list includes password hashes.** `find()` returns every field.
`select: false` on `password` keeps it out, and login asks for it with
`.select('+password')`.

**Wrong role should be 403, not 401.** The slide's authorization guard throws
`UnauthorizedException` for both. A logged in student without the right role is
`ForbiddenException`.

**The token is in the cookie and in the body.** `httpOnly` stops JavaScript
from reading the cookie, but the same token in the JSON body is readable
anyway. Login here only sets the cookie.

**`request['user'] = payload` does not compile** in NestJS 12. See folder 04.

**Passport is never used.** The slides install `@nestjs/passport`, `passport`
and `passport-jwt`, but the implementation uses `JwtService` directly. They are
not installed here.

**`cookie-parser` must be used, not just installed.** Without
`app.use(cookieParser())` in `main.ts`, `request.cookies` is undefined and the
cookie login never works.

**Route order matters.** `@Get('currentUser')` must come before `@Get(':id')`,
or "currentUser" is treated as an id.

**`@Roles(Role.User)` on `GET :id` locks admins out.** Here admins look anyone
up, and students use `/students/currentUser`.

**"Use npm start or node src/main.js".** There is no `src/main.js`. It is
`npm run start:dev`, or `node dist/main` after a build.
