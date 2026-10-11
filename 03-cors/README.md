# 03. CORS

From the CORS slide.

The slide's setup made real: an API on port 5001 that trusts
`http://localhost:3000`, and the same page served from 3000 and from 4000.

## Run it

```bash
npm install
```

```bash
npm start
```

Then open both, side by side:

```
http://localhost:3000
```
```
http://localhost:4000
```

Click both buttons on both pages. Then, in a second terminal, call the API
without a browser:

```bash
npm run no-browser
```

## Worth showing

On 3000 both buttons work. On 4000 both fail with "Failed to fetch". Open
DevTools (F12), Console tab, for the real CORS error.

**Now look at the terminal running the API.** The GET from 4000 is in the log.
The request reached the server and the handler ran. The browser just refused
to show the answer to the page. CORS protects users' data from being read by
other sites. It does not stop requests from reaching your server.

**The DELETE from 4000 is not in the log at all.** For anything other than a
simple GET or POST, the browser first asks permission with an `OPTIONS`
request (a preflight). The answer said "only 3000", so the DELETE was never
sent.

**`npm run no-browser` gets the data from both "origins".** Node, Postman and
curl do not check CORS. It is a browser rule, so it is never a replacement for
login and guards.

`credentials: true` on the slide is what lets the browser send cookies. Folder
05 needs it, because the token lives in a cookie.

NestJS's `app.enableCors()` uses this same `cors` package underneath, so the
options here are exactly the slide's.
