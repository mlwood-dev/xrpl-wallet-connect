import type { NextApiRequest, NextApiResponse } from "next";
import { XummSdk } from "xumm-sdk";

interface CreatePayloadResponse {
  payload?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePayloadResponse>
) {
  try {
    if (!process.env.XUMM_KEY || !process.env.XUMM_KEY_SECRET) {
      return res.status(500).json({ error: "XUMM API keys not configured" });
    }

    const xumm = new XummSdk(
      process.env.XUMM_KEY,
      process.env.XUMM_KEY_SECRET
    );

    const signInPayload = {
      TransactionType: "SignIn" as const,
    };

    const payload = await xumm.payload.create(signInPayload, true);
    return res.status(200).json({ payload });
  } catch (error) {
    console.error("XUMM payload creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

