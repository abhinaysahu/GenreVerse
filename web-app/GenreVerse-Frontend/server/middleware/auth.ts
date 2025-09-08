import type { Request } from "express";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const requireAuth: RequestHandler = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });

  const token = auth.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: "Server not configured" });

  try {
    const payload = jwt.verify(token, secret) as any;
    (req as any).user = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
