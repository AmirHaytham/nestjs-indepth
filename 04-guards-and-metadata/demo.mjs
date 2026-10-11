// Calls every route as nobody, as a student and as an admin.
// Start the API first (npm run start:dev), then: npm run demo

const base = process.env.API_URL ?? 'http://localhost:3000';
const routes = ['/users/public', '/users/admin', '/reports/grades', '/reports/mine', '/reports/schedule'];
const people = [undefined, 'student', 'admin'];

try {
  console.log(`${'route'.padEnd(20)}${'nobody'.padEnd(10)}${'student'.padEnd(10)}admin`);
  for (const route of routes) {
    const cells = [];
    for (const role of people) {
      const res = await fetch(base + route, { headers: role ? { 'x-role': role } : {} });
      cells.push(String(res.status).padEnd(10));
    }
    console.log(route.padEnd(20) + cells.join(''));
  }

  const res = await fetch(base + '/users/admin', { headers: { 'x-role': 'student' } });
  console.log('\nWhat a student sees on /users/admin:');
  console.log(' ', await res.text());
  console.log(`  X-Course header from the function middleware: ${res.headers.get('x-course')}`);
  console.log('\nNow look at the API terminal: the logger middleware printed every request,');
  console.log('including the ones the guard refused.');
} catch (error) {
  console.log(`Could not reach ${base}. Is the API running? (${error.cause?.code ?? error.message})`);
}
