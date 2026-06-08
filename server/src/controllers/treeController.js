import Tree from '../models/Tree.js';

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

export async function updateTree(req, res) {
  const tree = await Tree.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!tree) return res.status(404).json({ error: 'Tree not found' });
  res.json(tree);
}

export async function deleteTree(req, res) {
  await Tree.findByIdAndUpdate(req.params.id, { status: 'removed' });
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
