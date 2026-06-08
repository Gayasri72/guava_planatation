import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { startScheduler, runHarvestCheck } from './scheduler/harvestChecker.js';
import { ensureFarmerAccount } from './scripts/bootstrap.js';

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(express.json({ limit: '2mb' }));

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));
app.use('/api', routes);

// Manual trigger for harvest check (handy for testing notifications)
app.post('/api/dev/run-check', async (req, res, next) => {
  try {
    const r = await runHarvestCheck();
    res.json(r);
  } catch (e) {
    next(e);
  }
});

app.use(notFound);
app.use(errorHandler);

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
