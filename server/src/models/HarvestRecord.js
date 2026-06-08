import mongoose from 'mongoose';

const harvestSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    harvestDate: { type: Date, required: true, default: Date.now },
    fruitsHarvested: { type: Number, required: true, min: 0 },
    weightKg: { type: Number, min: 0 },
    qualityGrade: { type: String, enum: ['A', 'B', 'C', 'Mixed'], default: 'A' },
    // Income tracking (v2-ready, optional from day 1)
    pricePerKg: { type: Number, min: 0 },
    revenue: { type: Number, min: 0 },
    buyer: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

harvestSchema.index({ batchId: 1 });
harvestSchema.index({ harvestDate: -1 });

harvestSchema.pre('save', function (next) {
  if (this.weightKg && this.pricePerKg && !this.revenue) {
    this.revenue = +(this.weightKg * this.pricePerKg).toFixed(2);
  }
  next();
});

export default mongoose.model('HarvestRecord', harvestSchema);
