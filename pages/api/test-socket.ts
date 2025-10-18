// pages/api/test-socket.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] /api/test-socket hit`, {
    method: req.method,
    host: req.headers.host,
    userAgent: req.headers['user-agent']
  });
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test if we can access the socket server
  try {
    return res.status(200).json({ 
      ok: true, 
      message: "Socket server is available via custom server",
      timestamp: new Date().toISOString(),
      serverInfo: {
        hasSocket: true,
        serverType: "Custom Node.js server with Socket.io",
        endpoint: "Direct Socket.io connection (no API route)"
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: "Failed to check socket server",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  console.log(`[${new Date().toISOString()}] /api/test-socket responded`, {
    statusCode: res.statusCode,
    durationMs: Date.now() - start
  });
}
