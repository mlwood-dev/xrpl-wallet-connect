import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

interface NonceResponse {
  token?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<NonceResponse>
) {
  try {
    const pubkey = req.query.pubkey as string;
    const address = req.query.address as string;

    if (!pubkey || !address) {
      return res.status(400).json({ error: "pubkey and address are required" });
    }

    if (!process.env.ENC_KEY) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Generate nonce token with 1 hour expiration
    const token = jwt.sign(
      { public_key: pubkey, address },
      process.env.ENC_KEY,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error("Nonce generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

