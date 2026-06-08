import HarvestRecord from '../models/HarvestRecord.js';
import Batch from '../models/Batch.js';

export async function listHarvests(req, res) {
  const { batchId, from, to } = req.query;
  const q = {};
  if (batchId) q.batchId = batchId;
  if (from || to) {
    q.harvestDate = {};
    if (from) q.harvestDate.$gte = new Date(from);
    if (to) q.harvestDate.$lte = new Date(to);
  }
  const records = await HarvestRecord.find(q).sort({ harvestDate: -1 }).limit(500);
  res.json(records);
}

export async function createHarvest(req, res) {
  const { batchId, fruitsHarvested, weightKg, qualityGrade, pricePerKg, buyer, notes, harvestDate } = req.body;
  const batch = await Batch.findById(batchId);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const record = await HarvestRecord.create({
    batchId,
    fruitsHarvested,
    weightKg,
    qualityGrade,
    pricePerKg,
    buyer,
    notes,
    harvestDate: harvestDate || new Date(),
  });

  batch.status = 'harvested';
  await batch.save();

  res.status(201).json(record);
}

export async function harvestSummary(req, res) {
  const summary = await HarvestRecord.aggregate([
    {
      $group: {
        _id: null,
        totalFruits: { $sum: '$fruitsHarvested' },
        totalWeight: { $sum: '$weightKg' },
        totalRevenue: { $sum: '$revenue' },
        count: { $sum: 1 },
      },
    },
  ]);
  res.json(summary[0] || { totalFruits: 0, totalWeight: 0, totalRevenue: 0, count: 0 });
}
