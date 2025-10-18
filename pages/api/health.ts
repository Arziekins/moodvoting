// pages/api/health.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] /api/health hit`, {
    method: req.method,
    host: req.headers.host,
    userAgent: req.headers['user-agent']
  });
  res.status(200).json({ ok: true, ts: Date.now() });
  console.log(`[${new Date().toISOString()}] /api/health responded`, {
    statusCode: res.statusCode,
    durationMs: Date.now() - start
  });
}
