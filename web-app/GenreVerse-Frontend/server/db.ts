import mongoose from "mongoose";

let isConnected = false;

export async function connectMongo(uri?: string) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("MONGO_URI not set. MongoDB connection is skipped.");
    return;
  }
  if (isConnected) return;
  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB || undefined,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
    throw err;
  }
}
