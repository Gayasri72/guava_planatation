import mongoose from 'mongoose';

const treeEntrySchema = new mongoose.Schema(
  {
    treeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tree', required: true },
    treeCode: { type: String, required: true },
    fruitCount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const batchSchema = new mongoose.Schema(
  {
    batchCode: { type: String, required: true, unique: true },
    color: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    baggedDate: { type: Date, required: true },
    harvestDurationDays: { type: Number, default: 90, min: 1 },
    expectedHarvestDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['bagged', 'ready', 'harvested', 'partial', 'cancelled'],
      default: 'bagged',
    },
    trees: { type: [treeEntrySchema], default: [] },
    totalFruits: { type: Number, default: 0 },
    notes: { type: String },
    notifications: {
      sent: { type: [Number], default: [] }, // lead-days already notified, e.g. [7,3,1]
    },
  },
  { timestamps: true }
);

batchSchema.index({ expectedHarvestDate: 1, status: 1 });
batchSchema.index({ color: 1, baggedDate: -1 });
batchSchema.index({ 'trees.treeId': 1 });

batchSchema.pre('save', function (next) {
  this.totalFruits = (this.trees || []).reduce((sum, t) => sum + (t.fruitCount || 0), 0);
  if (this.baggedDate && this.harvestDurationDays && !this.isModified('expectedHarvestDate')) {
    const d = new Date(this.baggedDate);
    d.setDate(d.getDate() + this.harvestDurationDays);
    this.expectedHarvestDate = d;
  }
  next();
});

export default mongoose.model('Batch', batchSchema);
