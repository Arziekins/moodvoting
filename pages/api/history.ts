import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const rooms = await prisma.room.findMany({
      where: { finishedAt: { not: null } },
      orderBy: { finishedAt: 'desc' },
      include: { users: true, votes: true }
    });
    res.status(200).json({ rooms });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'Internal error' });
  }
}




