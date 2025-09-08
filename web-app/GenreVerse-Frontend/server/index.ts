import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectMongo } from "./db";
import { register, login } from "./routes/auth";
import { analyzeAudio, uploadAudio } from "./routes/analyze";
import { getAnalytics, getHistory } from "./routes/data";
import { requireAuth } from "./middleware/auth";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Connect DB (no-op if MONGO_URI missing)
  void connectMongo();

  // Health
  app.get("/health", (_req, res) => res.status(200).json({ ok: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);

  // Analysis - allow anonymous uploads; user is attached if Authorization header present
  app.post("/api/analyze", uploadAudio, analyzeAudio);

  // Data
  app.get("/api/history", requireAuth, getHistory);
  app.get("/api/analytics", getAnalytics);

  return app;
}
