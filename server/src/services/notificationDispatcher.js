import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import { sendEmail } from './emailService.js';
import { sendSMS, sendWhatsApp } from './smsService.js';

export async function dispatchHarvestNotification({ batch, leadDays }) {
  const settings = await Settings.getOrCreate();
  const channels = [];
  if (settings.channels.inApp) channels.push('in-app');

  const dueLabel =
    leadDays === 0 ? 'today' : leadDays === 1 ? 'tomorrow' : `in ${leadDays} days`;
  const title = `🔔 ${batch.color.toUpperCase()} batch harvest ${dueLabel}`;
  const message =
    `Your ${batch.color.toUpperCase()} batch (${batch.batchCode}) ` +
    `with ${batch.totalFruits} fruits across ${batch.trees.length} trees ` +
    `is due for harvest ${dueLabel} (${formatDate(batch.expectedHarvestDate)}).`;

  // In-app
  if (settings.channels.inApp) {
    await Notification.create({
      type: leadDays === 0 ? 'harvest_due_today' : 'harvest_due_soon',
      batchId: batch._id,
      title,
      message,
      leadDays,
      channels: ['in-app'],
    });
  }

  // Email
  if (settings.channels.email && settings.contact?.email) {
    channels.push('email');
    await sendEmail({
      to: settings.contact.email,
      subject: title,
      text: message,
      html: `<h2>${title}</h2><p>${message}</p>
             <p><strong>Batch:</strong> ${batch.batchCode}<br/>
             <strong>Color:</strong> ${batch.color}<br/>
             <strong>Total fruits:</strong> ${batch.totalFruits}<br/>
             <strong>Trees:</strong> ${batch.trees.length}<br/>
             <strong>Expected harvest:</strong> ${formatDate(batch.expectedHarvestDate)}</p>`,
    });
  }

  // SMS
  if (settings.channels.sms && settings.contact?.phone) {
    channels.push('sms');
    await sendSMS({
      to: settings.contact.phone,
      body: `🌱 Guava Tracker: ${message}`,
    });
  }

  // WhatsApp
  if (settings.channels.whatsapp && settings.contact?.phone) {
    channels.push('whatsapp');
    await sendWhatsApp({
      to: settings.contact.phone,
      body: `🌱 Guava Tracker: ${message}`,
    });
  }

  return { channels, leadDays, batchId: batch._id };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
