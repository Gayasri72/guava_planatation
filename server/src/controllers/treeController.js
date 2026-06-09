import Tree from '../models/Tree.js';
import Batch from '../models/Batch.js';

export async function listTrees(req, res) {
  const { plot, status = 'active', search } = req.query;
  const q = { status };
  if (plot) q['location.plot'] = plot;
  if (search) q.treeCode = new RegExp(search, 'i');
  const trees = await Tree.find(q).sort({ treeCode: 1 }).limit(2000);
  res.json(trees);
}

export async function getTree(req, res) {
  const tree = await Tree.findById(req.params.id);
  if (!tree) return res.status(404).json({ error: 'Tree not found' });
  res.json(tree);
}

export async function createTree(req, res) {
  const tree = await Tree.create(req.body);
  res.status(201).json(tree);
}

export async function bulkCreateTrees(req, res) {
  const { trees } = req.body;
  if (!Array.isArray(trees) || trees.length === 0) {
    return res.status(400).json({ error: 'trees array required' });
  }
  const result = await Tree.insertMany(trees, { ordered: false });
  res.status(201).json({ inserted: result.length });
}

// Add N trees to a row. Codes continue from the current max position in that row
// (e.g. row "A" with A1..A10 already → adding 5 creates A11..A15). Adding to an
// empty row starts at 1. Including all statuses in the max keeps codes unique.
export async function addRow(req, res) {
  const { row, count = 1 } = req.body;
  if (!row || typeof row !== 'string') {
    return res.status(400).json({ error: 'row is required' });
  }
  const r = row.trim().toUpperCase();
  if (!r) return res.status(400).json({ error: 'row is required' });
  const n = Math.max(1, Math.min(500, Number(count) || 1));

  const existing = await Tree.find({ 'location.plot': r }).select('location.position').lean();
  let maxPos = 0;
  for (const t of existing) {
    const p = t.location?.position || 0;
    if (p > maxPos) maxPos = p;
  }

  const docs = [];
  for (let i = 1; i <= n; i++) {
    const position = maxPos + i;
    docs.push({
      treeCode: `${r}${position}`,
      location: { plot: r, position },
      status: 'active',
    });
  }
  const created = await Tree.insertMany(docs, { ordered: false });
  res.status(201).json({ inserted: created.length, row: r });
}

// Visual grid: trees grouped by row, each tagged with the EARLIEST active bag
// color so the farmer sees the soonest-harvesting cohort at a glance.
export async function gridTrees(req, res) {
  const trees = await Tree.find({ status: 'active' })
    .select('treeCode location')
    .sort({ 'location.plot': 1, 'location.position': 1 })
    .lean();

  const batches = await Batch.find({ status: { $in: ['bagged', 'ready', 'partial'] } })
    .select('color baggedDate expectedHarvestDate trees.treeId')
    .sort({ baggedDate: 1 })
    .lean();

  // Earliest bag wins (batches are sorted ascending by baggedDate).
  const firstByTree = new Map();
  for (const b of batches) {
    for (const t of b.trees) {
      const key = String(t.treeId);
      if (!firstByTree.has(key)) {
        firstByTree.set(key, { color: b.color, expectedHarvestDate: b.expectedHarvestDate });
      }
    }
  }

  const rowsMap = new Map();
  for (const tree of trees) {
    const row = tree.location?.plot || '?';
    if (!rowsMap.has(row)) rowsMap.set(row, []);
    const f = firstByTree.get(String(tree._id));
    rowsMap.get(row).push({
      _id: tree._id,
      treeCode: tree.treeCode,
      position: tree.location?.position ?? null,
      color: f?.color || null,
      expectedHarvestDate: f?.expectedHarvestDate || null,
    });
  }

  const rows = [...rowsMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([row, list]) => ({ row, trees: list }));

  res.json({ rows, total: trees.length });
}

export async function updateTree(req, res) {
  const tree = await Tree.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tree) return res.status(404).json({ error: 'Tree not found' });
  res.json(tree);
}

// Hard delete so the code is freed for re-adding. Existing batches keep their
// embedded snapshot of the tree (treeId/treeCode/fruitCount), so history is safe.
export async function deleteTree(req, res) {
  await Tree.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}

export async function treeStats(req, res) {
  const total = await Tree.countDocuments({ status: 'active' });
  const byPlot = await Tree.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$location.plot', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  res.json({ total, byPlot });
}
