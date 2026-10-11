const crypto = require('crypto');
const bcrypt = require('bcrypt');

const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

async function main() {
  console.log('1. A plain hash, no salt');
  console.log('  ahmed  password123 ->', sha256('password123'));
  console.log('  mona   password123 ->', sha256('password123'));
  console.log('  Same password, same hash. Crack one and you have cracked both.');

  console.log('\n2. A plain hash cannot be reversed, but it can be looked up');
  const leaked = sha256('password123');
  const commonPasswords = ['123456', 'qwerty', 'iloveyou', 'password123', 'letmein'];
  const found = commonPasswords.find((p) => sha256(p) === leaked);
  console.log(`  Tried ${commonPasswords.length} common passwords, found: "${found}"`);

  console.log('\n3. bcrypt adds a random salt every time (the slide\'s code)');
  const hashed = await bcrypt.hash('password123', 10);
  const again = await bcrypt.hash('password123', 10);
  console.log('  Hashed password:', hashed);
  console.log('  Hashed again:   ', again);
  console.log('  Same password, different hashes:', hashed !== again);

  console.log('\n4. Where the salt went');
  console.log(`  ${hashed.slice(0, 4)}  algorithm (2b = bcrypt)`);
  console.log(`  ${hashed.slice(4, 7)}   cost, 10 means 2^10 rounds`);
  console.log(`  ${hashed.slice(7, 29)}  the salt, stored right inside the hash`);
  console.log(`  ${hashed.slice(29)}  the actual hash`);

  console.log('\n5. Comparing at login');
  console.log('  Password matches:', await bcrypt.compare('password123', hashed));
  console.log('  Wrong password:  ', await bcrypt.compare('password124', hashed));
  console.log('  compare() reads the salt out of the stored hash, so you never store it separately.');

  console.log('\n6. Why the cost number matters');
  for (const rounds of [4, 8, 10, 12]) {
    const start = performance.now();
    await bcrypt.hash('password123', rounds);
    console.log(`  cost ${String(rounds).padStart(2)} -> ${(performance.now() - start).toFixed(1).padStart(6)} ms per guess`);
  }
  console.log('  Slow on purpose. One login waits a tenth of a second, an attacker trying billions waits years.');
}

main();
