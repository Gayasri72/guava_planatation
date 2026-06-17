import User from '../models/User.js';
import Settings from '../models/Settings.js';

export async function ensureFarmerAccount() {
  const email = (process.env.FARMER_EMAIL || '').toLowerCase();
  const password = process.env.FARMER_PASSWORD;
  if (!email || !password) {
    console.warn('⚠ FARMER_EMAIL / FARMER_PASSWORD not set — skipping bootstrap');
    return;
  }
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, name: 'Admin' });
    console.log(`✓ Created admin account: ${email}`);
  } else {
    console.log(`✓ Reset password for: ${email}`);
  }
  await user.setPassword(password);
  await user.save();

  const settings = await Settings.getOrCreate();
  if (!settings.contact?.email) {
    settings.contact = {
      email,
      phone: process.env.FARMER_PHONE || '',
    };
    if (process.env.NOTIFY_LEAD_DAYS) {
      settings.leadDays = process.env.NOTIFY_LEAD_DAYS.split(',').map((n) => Number(n.trim()));
    }
    await settings.save();
    console.log('✓ Settings initialized from env');
  }
}
