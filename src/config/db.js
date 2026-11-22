import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      compressors: ['snappy', 'zlib'],
      family: 4, // Windows Wi-Fi par IPv6 SSL handshake issues avoid karne ke liye
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB Connected (Snappy Compression): ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};