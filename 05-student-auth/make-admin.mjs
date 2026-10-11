// Register can never create an admin, on purpose. This promotes an existing user.
//   npm run make-admin -- someone@giu-uni.de
import mongoose from 'mongoose';

try {
  process.loadEnvFile();
} catch {}

const email = process.argv[2]?.toLowerCase();
if (!email) {
  console.log('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017/nestStudent');
const result = await mongoose.connection
  .collection('students')
  .updateOne({ email }, { $set: { role: 'admin' } });
console.log(result.matchedCount ? `${email} is now an admin. Log in again to get a new token.` : `No user with email ${email}`);
await mongoose.disconnect();
