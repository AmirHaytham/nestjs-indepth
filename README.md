# NestJS in depth

Examples for Tutorial 5: DTOs, hashing, JWT, cookies, CORS, guards and roles,
ending in the student management app with real login.

Every code sample on the slides is here and runs. Each folder has its own README
with the command, the slides it covers, and what to point at while it is on
screen.

## The folders

| # | Folder | Slides | Run |
|---|---|---|---|
| 01 | `01-hashing` | Hashing, salt, bcrypt | `npm start` |
| 02 | `02-jwt` | Tokens, JWT, JWT components | `npm start` |
| 03 | `03-cors` | CORS | `npm start`, then two browser tabs |
| 04 | `04-guards-and-metadata` | Middleware, guards, Reflector, metadata, roles | `npm run start:dev` and `npm run demo` |
| 05 | `05-student-auth` | Recap, DTOs, the implementation slides, usage | `npm run start:dev` and `npm run demo` |

Run `npm install` once inside a folder before its first run.

## Everything at once

```bash
node run-all.js
```

Runs 01 and 02, prints folder 04's metadata, and runs the guard tests in 04 and
05. Nothing in it needs a browser or a database. Pass folder numbers to run
only those:

```bash
node run-all.js 02 04
```

## What you need

Node 20 or newer. Folder 05 also needs MongoDB on `localhost:27017`. Folder 03
needs a browser, because CORS only exists in browsers.

## Things the examples caught

Running the slides' code turned up these. Details are in each folder's README.

- `JwtModule.register({ secret: process.env.JWT_SECRET })` reads the secret
  before `.env` is loaded, so login fails. Folder 05.
- `JWT_EXPIRES_IN=3600` makes tokens expire after 3 seconds, not an hour.
  Folder 02.
- The register code lets anyone create an admin by sending `role: "admin"`.
  Folder 05.
- The login slide's body says 200 while the response is 201. "User not found"
  reveals who has an account, and the password hash is logged on every login.
  Folder 05.
- Every student list includes the password hashes. Folder 05.
- A wrong role answers 401 instead of 403. Folders 04 and 05.
- `@Roles('Admin')` on one slide and `Admin = 'admin'` on another, so real
  admins get refused. Folder 04.
- `request['user'] = payload` does not compile in a NestJS 12 project. Folder 04.
- The slides install Passport, but the implementation never uses it. Folder 05.
- A request blocked by CORS still reaches the server. Folder 03.

## Suggested order for a live session

1. **05** start the app and run the demo once, so they see where this ends up.
2. **01** hashing: same hash, then the salt.
3. **02** JWT: build one by hand, read the payload, break the signature.
4. **03** CORS: two tabs, then the server log.
5. **04** middleware logs every request, then the guards table and `npm run peek`.
6. **05** again, file by file, with "What the slide code gets wrong".

Short on time? The spine is **02, 04, 05**.
