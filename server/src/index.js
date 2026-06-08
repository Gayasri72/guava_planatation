import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { ensureFarmerAccount } from './scripts/bootstrap.js';
import { startScheduler } from './scheduler/harvestChecker.js';

// Local / long-running server entry point (npm run dev / npm start).
// On Vercel the app is served via api/index.js instead, and the cron
// runs through Vercel Cron rather than node-cron.
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB();
    await ensureFarmerAccount();
    startScheduler();
    app.listen(PORT, () => console.log(`✓ API listening on :${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
})();
