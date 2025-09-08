import type { RequestHandler } from "express";
import multer from "multer";
import { Analysis } from "../models/Analysis";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

export const uploadAudio = upload.single("file");

export const analyzeAudio: RequestHandler = async (req, res) => {
  try {
    const mlUrl = process.env.ML_SERVICE_URL;
    if (!mlUrl) return res.status(501).json({ error: "ML service not configured" });
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) return res.status(400).json({ error: "No file provided" });

    const form = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype });
    form.set("file", blob, file.originalname);

    const mlResp = await fetch(mlUrl + "/predict", { method: "POST", body: form });
    if (!mlResp.ok) {
      const text = await mlResp.text();
      return res.status(502).json({ error: "ML service error", details: text });
    }
    const data = (await mlResp.json()) as {
      genre: string;
      probabilities: Record<string, number>;
      durationSec?: number;
    };

    const probabilities = Object.entries(data.probabilities)
      .map(([label, probability]) => ({ label, probability }))
      .sort((a, b) => b.probability - a.probability);

    const doc = await Analysis.create({
      userId: (req as any).user?.id,
      filename: file.originalname,
      genre: data.genre,
      probabilities,
      durationSec: data.durationSec,
    });

    res.json({
      id: doc.id,
      genre: doc.genre,
      probabilities: doc.probabilities,
      filename: doc.filename,
      createdAt: doc.createdAt,
      durationSec: doc.durationSec,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to analyze" });
  }
};
