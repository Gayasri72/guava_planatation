import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import { signToken } from '../middleware/auth.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function allowedEmails() {
  const raw = process.env.ALLOWED_EMAILS || process.env.FARMER_EMAIL || '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function googleLogin(req, res) {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing Google credential' });
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'GOOGLE_CLIENT_ID not configured on server' });
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    return res.status(401).json({ error: 'Invalid Google token' });
  }

  if (!payload.email_verified) {
    return res.status(401).json({ error: 'Google email not verified' });
  }

  const email = payload.email.toLowerCase();
  const allow = allowedEmails();
  if (allow.length && !allow.includes(email)) {
    return res.status(403).json({ error: 'This Google account is not authorized for this plantation' });
  }

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, role: 'farmer' });
  }
  user.googleId = payload.sub;
  user.name = payload.name || user.name;
  user.avatar = payload.picture || user.avatar;
  await user.save();

  return res.json({
    token: signToken(user),
    user: { id: user._id, email: user.email, name: user.name, role: user.role, avatar: user.avatar },
  });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await user.verifyPassword(password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  return res.json({
    token: signToken(user),
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
}

export async function me(req, res) {
  const user = await User.findById(req.user.sub).select('-passwordHash');
  res.json(user);
}
