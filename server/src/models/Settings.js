import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: 'main', unique: true },
    defaultHarvestDays: { type: Number, default: 90 },
    leadDays: { type: [Number], default: [7, 3, 1] },
    channels: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      inApp: { type: Boolean, default: true },
    },
    contact: {
      email: { type: String },
      phone: { type: String },
    },
    availableColors: {
      type: [String],
      default: ['red', 'yellow', 'blue', 'green', 'white', 'pink', 'orange', 'purple'],
    },
  },
  { timestamps: true }
);

settingsSchema.statics.getOrCreate = async function () {
  let s = await this.findOne({ singleton: 'main' });
  if (!s) s = await this.create({ singleton: 'main' });
  return s;
};

export default mongoose.model('Settings', settingsSchema);
