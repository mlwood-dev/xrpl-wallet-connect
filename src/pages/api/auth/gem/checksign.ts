import type { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import * as rippleKP from "ripple-keypairs";

interface CheckSignResponse {
  token?: string;
  address?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckSignResponse>
) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!process.env.ENC_KEY) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const decoded = jwt.verify(token, process.env.ENC_KEY) as {
      public_key?: string;
      address?: string;
    };

    if (!decoded.public_key || !decoded.address) {
      return res.status(400).json({ error: "Invalid token payload" });
    }

    const signature = req.query.signature as string;
    if (!signature) {
      return res.status(400).json({ error: "signature parameter is required" });
    }

    const tokenHex = Buffer.from(token, "utf8").toString("hex");
    const isVerified = rippleKP.verify(
      tokenHex,
      signature,
      decoded.public_key
    );

    if (!isVerified) {
      return res.status(400).json({ error: "Signature not verified" });
    }

    // Generate JWT with expiration (7 days)
    const authToken = jwt.sign(
      { xrpAddress: decoded.address },
      process.env.ENC_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token: authToken, address: decoded.address });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    console.error("GEM signature verification error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

