import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import * as rippleKP from "ripple-keypairs";

interface CheckSignResponse {
  token?: string;
  address?: string;
  error?: string;
}

interface RequestBody {
  pubkey?: string;
  address?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckSignResponse>
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests allowed" });
    }

    const authHeader = req.headers.authorization;
    const hash = authHeader?.split(" ")[1];

    if (!hash) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const signature = req.query.signature as string;
    if (!signature) {
      return res.status(400).json({ error: "signature parameter is required" });
    }

    const body = req.body as RequestBody;
    const { pubkey: public_key, address } = body;

    if (!public_key || !address) {
      return res.status(400).json({ error: "pubkey and address are required in request body" });
    }

    if (!process.env.ENC_KEY) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const isVerified = rippleKP.verify(hash, signature, public_key);

    if (!isVerified) {
      return res.status(400).json({ error: "Signature not verified" });
    }

    // Generate JWT with expiration (7 days)
    const token = jwt.sign(
      { xrpAddress: address },
      process.env.ENC_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token, address });
  } catch (error) {
    console.error("Crossmark signature verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

