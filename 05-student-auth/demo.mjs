// Walks through the whole auth flow and prints every response.
// Start the API first (npm run start:dev), then: npm run demo
import { execFileSync } from 'child_process';

const base = process.env.API_URL ?? 'http://localhost:5001';
const stamp = Date.now().toString().slice(-6);

// A tiny cookie jar per person, like a browser keeps one per user.
function person() {
  const jar = new Map();
  return {
    jar,
    async call(method, path, body, headers = {}) {
      const cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
      const res = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...(cookie && { Cookie: cookie }), ...headers },
        body: body ? JSON.stringify(body) : undefined,
      });
      for (const line of res.headers.getSetCookie()) {
        const [pair] = line.split(';');
        const [name, value] = pair.split('=');
        value ? jar.set(name, value) : jar.delete(name);
      }
      const text = await res.text();
      const short = text.length > 150 ? text.slice(0, 150) + '...' : text;
      console.log(`  ${method.padEnd(6)} ${path.padEnd(44)} ${res.status}  ${short}`);
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    },
  };
}

const step = (title) => console.log(`\n${title}`);
const mona = person();
const admin = person();
const stranger = person();
const monaEmail = `mona.${stamp}@giu-uni.de`;
const adminEmail = `admin.${stamp}@giu-uni.de`;

try {
  step('1. Register');
  await mona.call('POST', '/auth/register', { name: 'Mona', email: monaEmail, password: 'password123', age: 20 });
  await mona.call('POST', '/auth/register', { name: 'Mona again', email: monaEmail, password: 'password123' });
  await mona.call('POST', '/auth/register', { name: 'Sneaky', email: `x${monaEmail}`, password: 'password123', role: 'admin' });
  await mona.call('POST', '/auth/register', { name: '', email: 'not-an-email', password: '123' });

  step('2. Log in');
  await mona.call('POST', '/auth/login', { email: monaEmail, password: 'wrong-password' });
  await mona.call('POST', '/auth/login', { email: 'nobody@giu-uni.de', password: 'password123' });
  await mona.call('POST', '/auth/login', { email: monaEmail, password: 'password123' });
  console.log(`  cookies Mona now holds: ${[...mona.jar.keys()].join(', ')}`);

  step('3. Public and protected routes');
  await stranger.call('GET', '/students');
  await stranger.call('GET', '/students/currentUser');
  const me = await mona.call('GET', '/students/currentUser');

  step('4. The same token as a Bearer header, the way Postman sends it');
  await stranger.call('GET', '/students/currentUser', null, { Authorization: `Bearer ${mona.jar.get('token')}` });

  step('5. A token with role changed to admin');
  const [h, p, s] = mona.jar.get('token').split('.');
  const forged = { ...JSON.parse(Buffer.from(p, 'base64url').toString()), role: 'admin' };
  const forgedToken = `${h}.${Buffer.from(JSON.stringify(forged)).toString('base64url')}.${s}`;
  await stranger.call('GET', `/students/${me._id}`, null, { Authorization: `Bearer ${forgedToken}` });

  step('6. Roles: a student on an admin route');
  await mona.call('GET', `/students/${me._id}`);
  await mona.call('POST', '/courses', { code: `SP${stamp}`, title: 'Software Project I', credits: 8 });

  step('7. An admin (registered as a student, then promoted from the terminal)');
  await admin.call('POST', '/auth/register', { name: 'Dr. Admin', email: adminEmail, password: 'password123' });
  execFileSync('node', ['make-admin.mjs', adminEmail], { stdio: 'inherit' });
  await admin.call('POST', '/auth/login', { email: adminEmail, password: 'password123' });
  const course = await admin.call('POST', '/courses', { code: `SP${stamp}`, title: 'Software Project I', credits: 8 });
  await admin.call('POST', '/courses', { code: 'X', title: 'Too many credits', credits: 40 });

  step('8. Mona enrolls herself, the admin looks her up');
  await mona.call('POST', `/students/currentUser/courses/${course._id}`);
  await admin.call('GET', `/students/${me._id}`);
  await admin.call('PATCH', `/students/${me._id}`, { age: 21, role: 'admin' });

  step('9. Refresh and logout');
  await mona.call('POST', '/auth/refresh');
  await mona.call('POST', '/auth/logout');
  await mona.call('GET', '/students/currentUser');

  step('10. Clean up');
  await admin.call('DELETE', `/students/${me._id}`);
  await admin.call('DELETE', `/courses/${course._id}`);
} catch (error) {
  console.log(`Could not reach ${base}. Is the API running? (${error.cause?.code ?? error.message})`);
}
