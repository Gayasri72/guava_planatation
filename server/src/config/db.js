import mongoose from 'mongoose';

// Cache the connection across serverless invocations (Vercel reuses the
// module between warm requests). Without this, every request opens a new
// Mongo connection and exhausts the Atlas connection limit.
let cached = globalThis.__mongooseConn;
if (!cached) cached = globalThis.__mongooseConn = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not set');

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 10000 })
      .then((m) => {
        console.log('✓ MongoDB connected');
        return m;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
