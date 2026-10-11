const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const secret = 'sp1-demo-secret';
const base64Url = (input) => Buffer.from(input).toString('base64url');

console.log('1. Building a JWT by hand, exactly like the slide');
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { sub: '1234567890', name: 'John Doe', iat: 1516239022 };

const data = base64Url(JSON.stringify(header)) + '.' + base64Url(JSON.stringify(payload));
const hashedData = crypto.createHmac('sha256', secret).update(data).digest();
const signature = base64Url(hashedData);
const handMade = `${data}.${signature}`;

const [h, p, s] = handMade.split('.');
console.log('  header    ', h);
console.log('  payload   ', p);
console.log('  signature ', s);

console.log('\n2. The library builds the same token');
const fromLibrary = jwt.sign(payload, secret);
console.log('  identical:', fromLibrary === handMade);

console.log('\n3. Anyone can read the payload, no secret needed');
const decoded = JSON.parse(Buffer.from(p, 'base64url').toString());
console.log('  ', decoded);
console.log('  Base64 is encoding, not encryption. Never put a password in a JWT.');

console.log('\n4. Changing the payload breaks the signature');
const login = jwt.sign({ userid: 'u1', role: 'student' }, secret, { expiresIn: '15m' });
const [lh, lp, ls] = login.split('.');
const forgedPayload = { ...JSON.parse(Buffer.from(lp, 'base64url').toString()), role: 'admin' };
const forged = `${lh}.${base64Url(JSON.stringify(forgedPayload))}.${ls}`;

const tryVerify = (label, token, key) => {
  try {
    const result = jwt.verify(token, key);
    console.log(`  ${label.padEnd(26)} accepted, role = ${result.role}`);
  } catch (e) {
    console.log(`  ${label.padEnd(26)} rejected: ${e.message}`);
  }
};
tryVerify('real token', login, secret);
tryVerify('role changed to admin', forged, secret);
tryVerify('signed with another secret', jwt.sign({ role: 'admin' }, 'guessed-secret'), secret);

console.log('\n5. iat and exp');
const timed = jwt.decode(jwt.sign({ userid: 'u1' }, secret, { expiresIn: '15m' }));
console.log('  iat (issued at)  ', timed.iat, '=', new Date(timed.iat * 1000).toISOString());
console.log('  exp (expires at) ', timed.exp, '=', new Date(timed.exp * 1000).toISOString());

console.log('\n6. The trap in JWT_EXPIRES_IN');
console.log('  Values from .env always arrive as strings. Look what "3600" means:');
for (const value of ['3600', 3600, '3600s', '1h', '15m']) {
  const t = jwt.decode(jwt.sign({}, secret, { expiresIn: value }));
  const label = typeof value === 'string' ? `"${value}"` : String(value);
  console.log(`  expiresIn: ${label.padEnd(8)} -> token lives ${t.exp - t.iat} seconds`);
}
console.log('  A string with no unit is read as milliseconds. Always write the unit: 1h, 15m, 7d.');

console.log('\n7. An expired token is rejected');
const shortLived = jwt.sign({ userid: 'u1' }, secret, { expiresIn: '1s' });
setTimeout(() => tryVerify('token after 1.5 seconds', shortLived, secret), 1500);
