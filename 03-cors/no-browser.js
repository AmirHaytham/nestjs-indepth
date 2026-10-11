// Calls the API from Node, the way Postman or another server would.
// Start the API first with npm start.
async function main() {
  for (const origin of ['http://localhost:3000', 'http://localhost:4000']) {
    const res = await fetch('http://localhost:5001/data', { headers: { Origin: origin } });
    console.log(`Pretending to be ${origin}`);
    console.log(`  status ${res.status}, body ${await res.text()}`);
    console.log(`  Access-Control-Allow-Origin: ${res.headers.get('access-control-allow-origin') ?? '(not sent)'}\n`);
  }
  console.log('Both got the data. CORS is enforced by the browser, not by the server.');
}

main().catch(() => console.log('Could not reach localhost:5001. Run npm start first.'));
