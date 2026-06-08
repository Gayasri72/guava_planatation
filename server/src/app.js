import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { runHarvestCheck } from './scheduler/harvestChecker.js';

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

// Ensure the DB is connected before handling any request.
// Cached, so this is a no-op on warm serverless invocations.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.get('/health', (req, res) => res.json({ ok: true, ts: Date.now() }));

// Vercel Cron hits this daily. Protected by CRON_SECRET (Vercel sends it
// automatically as a Bearer token when the env var is set).
app.get('/api/cron/harvest-check', async (req, res, next) => {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${secret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  try {
    const r = await runHarvestCheck();
    res.json(r);
  } catch (e) {
    next(e);
  }
});

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
