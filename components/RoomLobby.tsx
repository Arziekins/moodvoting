'use client';

import { useState } from 'react';
import { Copy, Users, Crown } from 'lucide-react';
import { User } from '@/lib/types';

interface RoomLobbyProps {
  roomId: string;
  userName: string;
  isAdmin: boolean;
  users: User[];
  onStartVoting: () => void;
}

export default function RoomLobby({ roomId, userName, isAdmin, users, onStartVoting }: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mood Voting Room</h1>
          <p className="text-gray-600">Share the room code with your team</p>
        </div>

        <div className="space-y-6">
          {/* Room Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Code</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={roomId}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg text-center bg-gray-50"
              />
              <button
                onClick={copyRoomId}
                className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">You are:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-800">{userName}</span>
              {isAdmin && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Member List */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-700">Room Members ({users.length})</span>
            </div>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.isAdmin && (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Crown className="w-3 h-3" />
                        <span>Admin</span>
                      </span>
                    )}
                    {user.hasVoted && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Voted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-700 mb-3">Admin Controls</h3>
                <button
                  onClick={onStartVoting}
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Start Mood Voting
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">How it works:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Share the room code with your team</li>
              <li>• Everyone joins and votes with emoji + scale</li>
              <li>• Cards show as covered until voting ends</li>
              <li>• Admin reveals all results at once</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
