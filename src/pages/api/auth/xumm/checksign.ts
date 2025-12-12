import type { NextApiRequest, NextApiResponse } from "next";
import { verifySignature } from "verify-xrpl-signature";
import jwt from "jsonwebtoken";

interface CheckSignResponse {
  xrpAddress?: string;
  token?: string;
  error?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckSignResponse>
) {
  try {
    const hex = req.query.hex as string;
    
    if (!hex) {
      return res.status(400).json({ error: "hex parameter is required" });
    }

    if (!process.env.ENC_KEY) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const resp = verifySignature(hex);
    
    if (resp.signatureValid !== true) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    const xrpAddress = resp.signedBy;
    if (!xrpAddress) {
      return res.status(400).json({ error: "Could not extract address from signature" });
    }

    // Add expiration to JWT token (7 days)
    const token = jwt.sign(
      { xrpAddress },
      process.env.ENC_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ xrpAddress, token });
  } catch (error) {
    console.error("Signature verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

