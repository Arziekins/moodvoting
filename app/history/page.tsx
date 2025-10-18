'use client';

import { useEffect, useState } from 'react';

interface HistoryRoom {
  id: string;
  createdAt: string;
  finishedAt: string | null;
  users: { name: string; userId: string }[];
  votes: { name: string; userId: string; emoji: string; scale: number }[];
}

export default function HistoryPage() {
  const [rooms, setRooms] = useState<HistoryRoom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/history')
      .then(r => r.json())
      .then(data => setRooms(data.rooms || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-white">Loading history…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Finished Sessions</h1>
      <div className="space-y-4">
        {rooms.map(room => (
          <div key={room.id} className="bg-white text-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="font-bold">Room {room.id}</div>
              <div className="text-sm text-gray-500">
                {new Date(room.createdAt).toLocaleString()} → {room.finishedAt ? new Date(room.finishedAt).toLocaleString() : '—'}
              </div>
            </div>
            <div className="mt-3">
              <div className="font-medium mb-2">Recap</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {room.votes.map(v => (
                  <div key={`${room.id}-${v.userId}`} className="flex items-center justify-between bg-gray-50 rounded-md p-2">
                    <span>{v.name}</span>
                    <span className="font-bold">{v.emoji} {v.scale}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



