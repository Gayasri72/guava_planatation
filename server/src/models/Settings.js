import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true },
    hex: { type: String, default: '#94a3b8' },
  },
  { _id: false }
);

const DEFAULT_COLORS = [
  { name: 'red', hex: '#ef4444' },
  { name: 'yellow', hex: '#facc15' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#22c55e' },
  { name: 'white', hex: '#ffffff' },
  { name: 'pink', hex: '#f472b6' },
  { name: 'orange', hex: '#f97316' },
  { name: 'purple', hex: '#a855f7' },
];

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
      email: { type: String }, // legacy single recipient (kept for back-compat)
      emails: { type: [String], default: [] }, // harvest alerts go to all of these
      phone: { type: String },
    },
    availableColors: {
      type: [colorSchema],
      default: () => DEFAULT_COLORS,
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
