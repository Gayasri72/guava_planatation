import Settings from '../models/Settings.js';

export async function getSettings(req, res) {
  const s = await Settings.getOrCreate();
  res.json(s);
}

export async function updateSettings(req, res) {
  const s = await Settings.getOrCreate();
  Object.assign(s, req.body);
  await s.save();
  res.json(s);
}
