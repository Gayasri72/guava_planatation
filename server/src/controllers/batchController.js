import Batch from '../models/Batch.js';
import Tree from '../models/Tree.js';
import Settings from '../models/Settings.js';

function makeBatchCode(color, baggedDate) {
  const d = new Date(baggedDate);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${color.toUpperCase()}-${yyyy}-${mm}-${dd}`;
}

export async function listBatches(req, res) {
  const { status, color } = req.query;
  const q = {};
  if (status) q.status = status;
  if (color) q.color = color.toLowerCase();
  const batches = await Batch.find(q).sort({ expectedHarvestDate: 1 }).limit(500);
  res.json(batches);
}

export async function getBatch(req, res) {
  const batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });
  res.json(batch);
}

export async function createBatch(req, res) {
  const settings = await Settings.getOrCreate();
  const {
    color,
    baggedDate,
    harvestDurationDays = settings.defaultHarvestDays,
    trees = [],
    notes,
  } = req.body;

  if (!color || !baggedDate) {
    return res.status(400).json({ error: 'color and baggedDate are required' });
  }
  if (!Array.isArray(trees) || trees.length === 0) {
    return res.status(400).json({ error: 'At least one tree entry is required' });
  }

  // Resolve tree codes
  const treeCodes = trees.map((t) => t.treeCode);
  const treeDocs = await Tree.find({ treeCode: { $in: treeCodes }, status: 'active' });
  const codeToId = new Map(treeDocs.map((t) => [t.treeCode, t._id]));

  const entries = trees
    .filter((t) => codeToId.has(t.treeCode) && Number(t.fruitCount) > 0)
    .map((t) => ({
      treeId: codeToId.get(t.treeCode),
      treeCode: t.treeCode,
      fruitCount: Number(t.fruitCount),
    }));

  if (entries.length === 0) {
    return res.status(400).json({ error: 'No valid trees matched' });
  }

  const batch = await Batch.create({
    batchCode: makeBatchCode(color, baggedDate),
    color: color.toLowerCase(),
    baggedDate,
    harvestDurationDays,
    expectedHarvestDate: addDays(baggedDate, harvestDurationDays),
    trees: entries,
    notes,
  });
  res.status(201).json(batch);
}

export async function updateBatch(req, res) {
  const batch = await Batch.findById(req.params.id);
  if (!batch) return res.status(404).json({ error: 'Batch not found' });

  const { harvestDurationDays, baggedDate, notes, status, expectedHarvestDate } = req.body;
  if (harvestDurationDays != null) batch.harvestDurationDays = harvestDurationDays;
  if (baggedDate) batch.baggedDate = baggedDate;
  if (notes != null) batch.notes = notes;
  if (status) batch.status = status;
  if (expectedHarvestDate) batch.expectedHarvestDate = expectedHarvestDate;
  else if (harvestDurationDays != null || baggedDate) {
    batch.expectedHarvestDate = addDays(batch.baggedDate, batch.harvestDurationDays);
  }
  await batch.save();
  res.json(batch);
}

export async function deleteBatch(req, res) {
  await Batch.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
  res.json({ ok: true });
}

export async function upcomingBatches(req, res) {
  const days = Number(req.query.days || 14);
  const end = addDays(new Date(), days);
  const batches = await Batch.find({
    status: { $in: ['bagged', 'ready'] },
    expectedHarvestDate: { $lte: end },
  }).sort({ expectedHarvestDate: 1 });
  res.json(batches);
}

function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + Number(n));
  return x;
}
