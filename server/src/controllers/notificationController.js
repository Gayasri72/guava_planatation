import Notification from '../models/Notification.js';

export async function listNotifications(req, res) {
  const { unread } = req.query;
  const q = {};
  if (unread === 'true') q.read = false;
  const items = await Notification.find(q).sort({ sentAt: -1 }).limit(200);
  res.json(items);
}

export async function markRead(req, res) {
  await Notification.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ ok: true });
}

export async function markAllRead(req, res) {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ ok: true });
}

export async function unreadCount(req, res) {
  const count = await Notification.countDocuments({ read: false });
  res.json({ count });
}
