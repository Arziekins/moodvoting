// pages/api/test-socket.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Test if we can access the socket server
  try {
    const httpServer = (res as any)?.socket?.server;
    if (!httpServer) {
      return res.status(503).json({ 
        error: "Socket server not available",
        details: "The HTTP server is not accessible"
      });
    }

    return res.status(200).json({ 
      ok: true, 
      message: "Socket server is available",
      timestamp: new Date().toISOString(),
      serverInfo: {
        hasSocket: !!httpServer,
        serverType: typeof httpServer
      }
    });
  } catch (error) {
    return res.status(500).json({ 
      error: "Failed to check socket server",
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
