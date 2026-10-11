# 01. Hashing and salt

From the hashing slides (pages 008 and 009).

Why a plain hash is not enough, what the salt fixes, and the slide's
`bcrypt.hash` and `bcrypt.compare`, run for real.

## Run it

```bash
npm install
```

```bash
npm start
```

## Worth showing

**Part 1 is the red line on the slide.** Two users with `password123` get the
exact same SHA-256 hash. Crack one, you have cracked both.

**Part 2 is why that matters.** Nobody reverses a hash. They hash a list of
common passwords and look for a match. Five guesses are enough here.

**Part 3 is the fix.** bcrypt hashes the same password twice and gets two
different results, because each time it adds a new random salt.

**Part 4 answers the question someone always asks:** "if the salt is random,
how does login know which salt to use?" It is stored inside the hash itself.
The output splits one hash into algorithm, cost, salt and hash.

**Part 6 explains the `10` in `bcrypt.hash(password, 10)`.** Every step up
doubles the time. A tenth of a second does not bother a user logging in. It
makes guessing billions of passwords impossible.
