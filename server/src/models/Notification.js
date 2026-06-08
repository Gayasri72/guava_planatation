import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['harvest_due_soon', 'harvest_due_today', 'harvest_overdue', 'system'],
      required: true,
    },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    leadDays: { type: Number },
    channels: { type: [String], default: ['in-app'] },
    sentAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ read: 1, sentAt: -1 });

export default mongoose.model('Notification', notificationSchema);
