# 02. Inside a JWT

From the token, JWT and JWT components slides (pages 011 onwards).

A JWT built by hand with the slide's three lines, the same token from the
library, then what can and cannot be done with it.

## Run it

```bash
npm install
```

```bash
npm start
```

## Worth showing

**Parts 1 and 2:** the slide's `Base64UrlEncode(header) + '.' +
Base64UrlEncode(payload)`, signed with HMAC SHA-256, gives the exact same token
as `jsonwebtoken`. No magic in the library.

**Part 3 surprises people.** The payload is readable by anyone, with no secret.
Base64 is encoding, not encryption. So a token carries a user id and a role,
never a password.

**Part 4 is why it is still safe.** Change `student` to `admin` in the payload
and the signature no longer matches. Without the secret nobody can make a new
one. That is what "signature ensures the token hasn't been altered" means.

**Part 6 is a trap students fall into in the lab.** The implementation slides
read `expiresIn` from `process.env.JWT_EXPIRES_IN`. Values from `.env` are
always strings, and a string with no unit is read as milliseconds. So
`JWT_EXPIRES_IN=3600` makes every token expire after **3 seconds**, and login
looks broken. Write `1h`, `15m` or `7d`.

**Part 7** waits a second and a half, then shows `jwt expired`.

The slide lists `name` as "same as sub". It is not. `sub` is the standard claim
for who the token is about, usually the user id. `name` is just an extra field.
