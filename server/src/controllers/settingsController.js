import Settings from '../models/Settings.js';
import { sendEmail } from '../services/emailService.js';

export async function getSettings(req, res) {
  const s = await Settings.getOrCreate();
  res.json(s);
}

// Sends a plain test email to all configured recipients to verify SMTP setup.
export async function sendTestEmail(req, res) {
  const s = await Settings.getOrCreate();
  const recipients = [...(s.contact?.emails || []), s.contact?.email]
    .map((e) => (e || '').trim())
    .filter(Boolean);
  const unique = [...new Set(recipients)];

  if (unique.length === 0) {
    return res.status(400).json({ error: 'No recipient emails configured' });
  }

  const result = await sendEmail({
    to: unique.join(', '),
    subject: '✅ Guava Tracker test email',
    text: 'This is a test email from your Guava Plantation Tracker. If you received it, email alerts are working.',
    html: '<h2>✅ Guava Tracker test email</h2><p>If you received this, your harvest email alerts are working correctly.</p>',
  });

  if (result.skipped) {
    return res
      .status(400)
      .json({ error: 'SMTP not configured on the server (SMTP_HOST / SMTP_USER missing).' });
  }
  if (result.error) {
    return res.status(502).json({ error: `Send failed: ${result.error}` });
  }
  res.json({ ok: true, sentTo: unique });
}

export async function updateSettings(req, res) {
  const s = await Settings.getOrCreate();
  Object.assign(s, req.body);
  await s.save();
  res.json(s);
}
