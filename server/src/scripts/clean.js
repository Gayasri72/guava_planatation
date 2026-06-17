import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Tree from '../models/Tree.js';
import Batch from '../models/Batch.js';
import HarvestRecord from '../models/HarvestRecord.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';

// Fresh-start wipe for client handover. Removes all plantation data but KEEPS
// the User collection so login accounts (and the Google allowlist) still work.
async function clean() {
  await connectDB();

  const results = {
    trees: (await Tree.deleteMany({})).deletedCount,
    batches: (await Batch.deleteMany({})).deletedCount,
    harvests: (await HarvestRecord.deleteMany({})).deletedCount,
    notifications: (await Notification.deleteMany({})).deletedCount,
    settings: (await Settings.deleteMany({})).deletedCount,
  };

  console.log('✓ Database wiped (users kept):');
  for (const [k, v] of Object.entries(results)) {
    console.log(`  - ${k}: ${v} removed`);
  }

  await mongoose.connection.close();
  process.exit(0);
}

clean().catch((err) => {
  console.error('Clean failed:', err);
  process.exit(1);
});
