import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String }, // optional — Google-only accounts have none
    googleId: { type: String, index: true },
    avatar: { type: String },
    name: { type: String, default: 'Farmer' },
    role: { type: String, enum: ['farmer', 'worker'], default: 'farmer' },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain) {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.verifyPassword = function (plain) {
  if (!this.passwordHash) return Promise.resolve(false);
  return bcrypt.compare(plain, this.passwordHash);
};

export default mongoose.model('User', userSchema);
