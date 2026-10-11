// Runs everything that does not need a browser or a database, in order.
//   node run-all.js          everything
//   node run-all.js 02 04    only those folders

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const only = process.argv.slice(2).map((a) => a.padStart(2, '0'));

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const cyan = (s) => `\x1b[36m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

const steps = {
  '01-hashing': ['npm start --silent'],
  '02-jwt': ['npm start --silent'],
  '03-cors': [],
  '04-guards-and-metadata': ['npm run peek --silent', 'npm test --silent'],
  '05-student-auth': ['npm test --silent'],
};

function run(cmd, cwd) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8' });
  return ((r.stdout || '') + (r.stderr || '')).trimEnd();
}

const folders = Object.keys(steps).filter((d) => only.length === 0 || only.includes(d.slice(0, 2)));

for (const name of folders) {
  const dir = path.join(__dirname, name);
  console.log('\n' + cyan('='.repeat(70)));
  console.log(bold(cyan('  ' + name)));
  console.log(cyan('='.repeat(70)));

  if (steps[name].length === 0) {
    console.log(dim('  Needs a browser. Run npm start inside the folder and open localhost:3000 and 4000.'));
    continue;
  }
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    console.log(dim('  installing dependencies, first run only...'));
    run('npm install --silent --no-audit --no-fund', dir);
  }
  for (const cmd of steps[name]) {
    console.log(bold(`\n${cmd.replace(' --silent', '')}`));
    console.log(run(cmd, dir));
  }
}

console.log('\n' + bold('Done.') + ' Folder 05 also has npm run demo, which needs MongoDB and the API running.\n');
