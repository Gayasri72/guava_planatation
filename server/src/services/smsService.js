import twilio from 'twilio';

let client = null;

function getClient() {
  if (client) return client;
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠ SMS not configured — TWILIO_* env vars missing');
    return null;
  }
  client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return client;
}

export async function sendSMS({ to, body }) {
  const c = getClient();
  if (!c) return { skipped: true };
  try {
    const msg = await c.messages.create({
      from: process.env.TWILIO_FROM,
      to,
      body,
    });
    return { id: msg.sid };
  } catch (err) {
    console.error('SMS send failed:', err.message);
    return { error: err.message };
  }
}

export async function sendWhatsApp({ to, body }) {
  const c = getClient();
  if (!c) return { skipped: true };
  try {
    const msg = await c.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: `whatsapp:${to}`,
      body,
    });
    return { id: msg.sid };
  } catch (err) {
    console.error('WhatsApp send failed:', err.message);
    return { error: err.message };
  }
}
