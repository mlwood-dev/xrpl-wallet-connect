import type { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

interface HashResponse {
  hash?: string;
  error?: string;
}

function generateSecureRandomHash(): string {
  // Generate a random buffer (16 bytes)
  const randomBuffer = crypto.randomBytes(16);
  // Create a SHA-256 hash of the random buffer
  const sha256Hash = crypto.createHash("sha256").update(randomBuffer as unknown as crypto.BinaryLike).digest("hex");
  return sha256Hash;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HashResponse>
) {
  try {
    const hash = generateSecureRandomHash();
    return res.status(200).json({ hash });
  } catch (error) {
    console.error("Hash generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

