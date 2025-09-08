import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";

const JWT_EXPIRES = "7d";

export const register: RequestHandler = async (req, res) => {
  try {
    const { email, password, name } = req.body as { email: string; password: string; name: string };
    if (!email || !password || !name) return res.status(400).json({ error: "Missing fields" });

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    const token = signToken(user.id, user.email);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user.id, user.email);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Login failed" });
  }
};

function signToken(id: string, email: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not set");
  return jwt.sign({ id, email }, secret, { expiresIn: JWT_EXPIRES });
}
