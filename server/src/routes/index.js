import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';
import * as trees from '../controllers/treeController.js';
import * as batches from '../controllers/batchController.js';
import * as harvests from '../controllers/harvestController.js';
import * as notifications from '../controllers/notificationController.js';
import * as settings from '../controllers/settingsController.js';
import { runHarvestCheck } from '../scheduler/harvestChecker.js';

const router = Router();

// Public
router.post('/auth/login', auth.login);
router.post('/auth/google', auth.googleLogin);

// Auth gate for everything else
router.use(requireAuth);

router.get('/auth/me', auth.me);

// Manual trigger for the harvest check (used by the Notifications page).
router.post('/dev/run-check', async (req, res, next) => {
  try {
    res.json(await runHarvestCheck());
  } catch (e) {
    next(e);
  }
});

// Trees
router.get('/trees', trees.listTrees);
router.get('/trees/stats', trees.treeStats);
router.get('/trees/grid', trees.gridTrees);
router.get('/trees/:id', trees.getTree);
router.post('/trees', trees.createTree);
router.post('/trees/bulk', trees.bulkCreateTrees);
router.post('/trees/add-row', trees.addRow);
router.patch('/trees/:id', trees.updateTree);
router.delete('/trees/:id', trees.deleteTree);

// Batches
router.get('/batches', batches.listBatches);
router.get('/batches/upcoming', batches.upcomingBatches);
router.get('/batches/:id', batches.getBatch);
router.post('/batches', batches.createBatch);
router.patch('/batches/:id', batches.updateBatch);
router.delete('/batches/:id', batches.deleteBatch);

// Harvests
router.get('/harvests', harvests.listHarvests);
router.get('/harvests/summary', harvests.harvestSummary);
router.post('/harvests', harvests.createHarvest);

// Notifications
router.get('/notifications', notifications.listNotifications);
router.get('/notifications/unread-count', notifications.unreadCount);
router.patch('/notifications/:id/read', notifications.markRead);
router.post('/notifications/read-all', notifications.markAllRead);

// Settings
router.get('/settings', settings.getSettings);
router.patch('/settings', settings.updateSettings);

export default router;
