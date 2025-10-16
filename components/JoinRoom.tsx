'use client';

import { useState, useEffect } from 'react';
import { LogIn, Users } from 'lucide-react';
import { getSocket, resetSocket, testSocketEndpoint } from '@/lib/socket';

interface JoinRoomProps {
  onJoinRoom: (roomId: string, userName: string) => void;
  onCreateRoom: (userName: string) => void;
}

export default function JoinRoom({ onJoinRoom, onCreateRoom }: JoinRoomProps) {
  const [roomId, setRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleResetConnection = () => {
    addDebugLog("Resetting socket connection...");
    setConnectionStatus("Resetting connection...");
    resetSocket();
    addDebugLog("Socket connection reset, testing new connection...");
    setConnectionStatus("Disconnected");
  };

  const handleTestEndpoint = async () => {
    addDebugLog("Testing socket endpoint...");
    setConnectionStatus("Testing endpoint...");
    const result = await testSocketEndpoint();
    if (result.success) {
      addDebugLog(`Socket endpoint test successful: ${JSON.stringify(result.data)}`);
      setConnectionStatus("Endpoint accessible");
    } else {
      addDebugLog(`Socket endpoint test failed: ${result.error}`);
      setConnectionStatus("Endpoint not accessible");
    }
  };

  // Test initial connection
  useEffect(() => {
    addDebugLog("Component mounted, testing socket connection...");
    const socket = getSocket();
    
    if (socket.connected) {
      addDebugLog("Socket already connected");
      setConnectionStatus("Connected");
    } else {
      addDebugLog("Socket not connected, waiting...");
      setConnectionStatus("Disconnected");
      
      socket.on('connect', () => {
        addDebugLog("Socket connected successfully!");
        setConnectionStatus("Connected");
      });

      socket.on('connect_error', (error) => {
        addDebugLog(`Socket connection error: ${error.message}`);
        setConnectionStatus("Connection failed");
      });

      socket.on('disconnect', () => {
        addDebugLog("Socket disconnected");
        setConnectionStatus("Disconnected");
      });
    }
  }, []);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && userName.trim()) {
      addDebugLog("Starting room join process...");
      setConnectionStatus("Connecting to server...");
      setIsCreating(true);

      const socket = getSocket();
      addDebugLog(`Socket connection state: ${socket.connected ? 'Connected' : 'Disconnected'}`);
      
      if (!socket.connected) {
        addDebugLog("Socket not connected, waiting for connection...");
        setConnectionStatus("Waiting for socket connection...");
        
        socket.on('connect', () => {
          addDebugLog("Socket connected! Attempting to join room...");
          setConnectionStatus("Connected - Joining room...");
          socket.emit("room:join", { roomId: roomId.trim(), user: userName.trim() });
        });

        socket.on('connect_error', (error) => {
          addDebugLog(`Socket connection error: ${error.message}`);
          setConnectionStatus("Connection failed");
          setIsCreating(false);
          alert(`Connection failed: ${error.message}`);
        });
      } else {
        addDebugLog("Socket already connected, joining room...");
        setConnectionStatus("Connected - Joining room...");
        socket.emit("room:join", { roomId: roomId.trim(), user: userName.trim() });
      }

      const onJoined = ({ roomId }: { roomId: string }) => {
        addDebugLog(`Successfully joined room: ${roomId}`);
        setConnectionStatus("Successfully joined room!");
        socket.off("room:joined", onJoined);
        socket.off("error", onErr);
        setIsCreating(false);
        onJoinRoom(roomId, userName.trim());
      };

      const onErr = (e: any) => {
        addDebugLog(`Room join error: ${e?.message || 'Unknown error'}`);
        setConnectionStatus("Join failed");
        socket.off("room:joined", onJoined);
        socket.off("error", onErr);
        setIsCreating(false);
        alert(e?.message || "Failed to join room");
      };

      socket.on("room:joined", onJoined);
      socket.on("error", onErr);

      setTimeout(() => {
        if (isCreating) {
          addDebugLog("Room join timed out after 15 seconds");
          setConnectionStatus("Timed out");
          setIsCreating(false);
          alert("Room join timed out. Please try again.");
        }
      }, 15000);
    }
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      addDebugLog("Starting room creation process...");
      setConnectionStatus("Connecting to server...");
      setIsCreating(true);

      const socket = getSocket();
      addDebugLog(`Socket connection state: ${socket.connected ? 'Connected' : 'Disconnected'}`);
      
      if (!socket.connected) {
        addDebugLog("Socket not connected, waiting for connection...");
        setConnectionStatus("Waiting for socket connection...");
        
        socket.on('connect', () => {
          addDebugLog("Socket connected! Attempting to create room...");
          setConnectionStatus("Connected - Creating room...");
          const desiredId = roomId?.trim();
          socket.emit("room:create", { roomId: desiredId, admin: userName.trim() });
        });

        socket.on('connect_error', (error) => {
          addDebugLog(`Socket connection error: ${error.message}`);
          setConnectionStatus("Connection failed");
          setIsCreating(false);
          alert(`Connection failed: ${error.message}`);
        });
      } else {
        addDebugLog("Socket already connected, creating room...");
        setConnectionStatus("Connected - Creating room...");
        const desiredId = roomId?.trim();
        socket.emit("room:create", { roomId: desiredId, admin: userName.trim() });
      }

      const onCreated = ({ roomId }: { roomId: string }) => {
        addDebugLog(`Successfully created room: ${roomId}`);
        setConnectionStatus("Successfully created room!");
        socket.off("room:created", onCreated);
        socket.off("error", onErr);
        setIsCreating(false);
        onCreateRoom(userName.trim());
      };

      const onErr = (e: any) => {
        addDebugLog(`Room creation error: ${e?.message || 'Unknown error'}`);
        setConnectionStatus("Creation failed");
        socket.off("room:created", onCreated);
        socket.off("error", onErr);
        setIsCreating(false);
        alert(e?.message || "Failed to create room");
      };

      socket.on("room:created", onCreated);
      socket.on("error", onErr);

      setTimeout(() => {
        if (isCreating) {
          addDebugLog("Room creation timed out after 15 seconds");
          setConnectionStatus("Timed out");
          setIsCreating(false);
          alert("Room creation timed out. Please try again.");
        }
      }, 15000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Mood Voting Cards</h1>
          <p className="text-gray-600">Join a room or create your own</p>
        </div>

        <div className="space-y-6">
          {/* User Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Join Room */}
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!roomId.trim() || !userName.trim()}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Room</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Create Room */}
          <form onSubmit={handleCreateRoom}>
            <button
              type="submit"
              disabled={!userName.trim() || isCreating}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>{isCreating ? 'Creating...' : 'Create New Room'}</span>
            </button>
          </form>

          {/* Connection Status */}
          {isCreating && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm font-medium text-blue-800">Status: {connectionStatus}</span>
              </div>
              <div className="text-xs text-blue-600">
                {connectionStatus === "Waiting for socket connection..." && "Trying to connect to server..."}
                {connectionStatus === "Connected - Creating room..." && "Creating your room..."}
                {connectionStatus === "Connected - Joining room..." && "Joining the room..."}
                {connectionStatus === "Successfully created room!" && "Room created successfully!"}
                {connectionStatus === "Successfully joined room!" && "Room joined successfully!"}
                {connectionStatus === "Connection failed" && "Could not connect to server. Check your internet connection."}
                {connectionStatus === "Creation failed" && "Room creation failed. Please try again."}
                {connectionStatus === "Join failed" && "Could not join room. Check the room code."}
                {connectionStatus === "Timed out" && "Operation timed out. Please try again."}
              </div>
            </div>
          )}

          {/* Debug Panel */}
          <div className="mt-4">
            <div className="flex space-x-2 mb-2">
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
              <button
                type="button"
                onClick={handleResetConnection}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Reset Connection
              </button>
              <button
                type="button"
                onClick={handleTestEndpoint}
                className="text-xs text-blue-500 hover:text-blue-700 underline"
              >
                Test Endpoint
              </button>
            </div>
            
            {showDebug && (
              <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono max-h-40 overflow-y-auto">
                <div className="mb-2 text-yellow-400">Debug Logs:</div>
                {debugLogs.length === 0 ? (
                  <div className="text-gray-500">No debug logs yet...</div>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">{log}</div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-2">How it works:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create a room to become the admin</li>
              <li>• Share the room code with your team</li>
              <li>• Vote with emoji and 1-10 scale</li>
              <li>• Cards flip to reveal results together</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
