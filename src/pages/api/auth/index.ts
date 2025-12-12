import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface AuthResponse {
  xrpAddress?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AuthResponse>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const token = req.body?.token;
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    if (!process.env.ENC_KEY) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.ENC_KEY) as { xrpAddress?: string };
    
    if (!decoded.xrpAddress) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    return res.status(200).json({ xrpAddress: decoded.xrpAddress });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

