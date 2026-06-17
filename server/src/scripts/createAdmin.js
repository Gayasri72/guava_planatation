import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { ensureFarmerAccount } from './bootstrap.js';

// Creates (or resets the password of) the admin account defined by
// FARMER_EMAIL / FARMER_PASSWORD. Run against the shared Atlas DB so the
// account works on both local and the serverless Vercel deployment.
async function run() {
  await connectDB();
  await ensureFarmerAccount();
  await mongoose.connection.close();
  process.exit(0);
}

run().catch((err) => {
  console.error('createAdmin failed:', err);
  process.exit(1);
});
