import type { NextApiRequest, NextApiResponse } from "next";
import { XummSdk } from "xumm-sdk";

interface GetPayloadResponse {
  payload?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetPayloadResponse>
) {
  try {
    const payloadId = req.query.payloadId as string;
    
    if (!payloadId) {
      return res.status(400).json({ error: "payloadId is required" });
    }

    if (!process.env.XUMM_KEY || !process.env.XUMM_KEY_SECRET) {
      return res.status(500).json({ error: "XUMM API keys not configured" });
    }

    const xumm = new XummSdk(
      process.env.XUMM_KEY,
      process.env.XUMM_KEY_SECRET
    );

    const payload = await xumm.payload.get(payloadId);
    return res.status(200).json({ payload });
  } catch (error) {
    console.error("XUMM payload retrieval error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(400).json({ error: errorMessage });
  }
}

