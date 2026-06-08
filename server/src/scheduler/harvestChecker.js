import cron from 'node-cron';
import Batch from '../models/Batch.js';
import Settings from '../models/Settings.js';
import { dispatchHarvestNotification } from '../services/notificationDispatcher.js';

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function diffDays(future, now) {
  const a = startOfDay(future).getTime();
  const b = startOfDay(now).getTime();
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

export async function runHarvestCheck() {
  const settings = await Settings.getOrCreate();
  const leadDays = settings.leadDays || [7, 3, 1];
  const now = new Date();

  // Look ahead the max lead window
  const maxLead = Math.max(...leadDays, 0);
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + maxLead + 1);

  const batches = await Batch.find({
    status: { $in: ['bagged', 'ready'] },
    expectedHarvestDate: { $lte: horizon },
  });

  let dispatched = 0;
  for (const batch of batches) {
    const daysToHarvest = diffDays(batch.expectedHarvestDate, now);

    // Mark as ready on the harvest day
    if (daysToHarvest <= 0 && batch.status === 'bagged') {
      batch.status = 'ready';
    }

    // Fire matching lead-day alerts (and "today" = 0)
    const triggerSet = [...leadDays, 0];
    for (const lead of triggerSet) {
      if (daysToHarvest === lead && !batch.notifications.sent.includes(lead)) {
        await dispatchHarvestNotification({ batch, leadDays: lead });
        batch.notifications.sent.push(lead);
        dispatched++;
      }
    }
    await batch.save();
  }

  return { checked: batches.length, dispatched, at: now };
}

export function startScheduler() {
  const expr = process.env.NOTIFY_CRON || '0 7 * * *';
  cron.schedule(expr, async () => {
    try {
      const r = await runHarvestCheck();
      console.log(`[cron] harvest check: ${JSON.stringify(r)}`);
    } catch (err) {
      console.error('[cron] harvest check failed:', err);
    }
  });
  console.log(`✓ Scheduler started (${expr})`);
}
