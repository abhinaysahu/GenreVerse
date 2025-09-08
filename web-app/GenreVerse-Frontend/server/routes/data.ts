import type { RequestHandler } from "express";
import { Analysis } from "../models/Analysis";

export const getHistory: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const items = await Analysis.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json(items.map(clean));
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load history" });
  }
};

export const getAnalytics: RequestHandler = async (_req, res) => {
  try {
    const agg = await Analysis.aggregate([
      { $group: { _id: "$genre", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(
      agg.map((x) => ({ genre: x._id as string, count: x.count as number })),
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load analytics" });
  }
};

function clean(doc: any) {
  return {
    id: String(doc._id),
    userId: doc.userId ? String(doc.userId) : undefined,
    filename: doc.filename,
    genre: doc.genre,
    probabilities: doc.probabilities,
    durationSec: doc.durationSec,
    createdAt: doc.createdAt,
  };
}
