// One API and two frontends on different ports.
// NestJS's app.enableCors() is this same cors package underneath,
// so the options below are exactly the ones on the slide.
const express = require('express');
const cors = require('cors');
const path = require('path');

const api = express();
api.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  }),
);
api.use((req, res, next) => {
  console.log(`  API got ${req.method.padEnd(7)} ${req.path.padEnd(6)} from ${req.headers.origin ?? 'no origin (not a browser)'}`);
  next();
});
api.get('/data', (req, res) => res.json({ message: 'secret grades', from: 'localhost:5001' }));
api.delete('/data', (req, res) => res.json({ deleted: true }));
api.listen(5001, () => console.log('API         http://localhost:5001/data   allows only localhost:3000'));

function frontend(port, label) {
  const app = express();
  app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'page.html')));
  app.listen(port, () => console.log(`${label.padEnd(11)} http://localhost:${port}`));
}

frontend(3000, 'Trusted');
frontend(4000, 'Untrusted');
console.log('\nOpen both pages and click the buttons. Requests are logged below.\n');
