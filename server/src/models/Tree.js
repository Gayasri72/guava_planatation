import mongoose from 'mongoose';

const treeSchema = new mongoose.Schema(
  {
    treeCode: { type: String, required: true, unique: true, trim: true },
    variety: { type: String, default: 'Thai Guava' },
    plantedDate: { type: Date },
    location: {
      plot: { type: String, default: 'A' },
      row: { type: Number },
      position: { type: Number },
    },
    status: {
      type: String,
      enum: ['active', 'removed'],
      default: 'active',
    },
    notes: { type: String },
  },
  { timestamps: true }
);

treeSchema.index({ status: 1, 'location.plot': 1 });

export default mongoose.model('Tree', treeSchema);
