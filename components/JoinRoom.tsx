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
          socket.emit("room:create", { admin: userName.trim() });
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
        socket.emit("room:create", { admin: userName.trim() });
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="glass rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 max-w-md w-full border-2 border-purple-200">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-3">Mood Voting</h1>
          <p className="text-purple-600 text-sm sm:text-base">Join a room or create your own</p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* User Name Input */}
          <div>
            <label className="block text-sm font-semibold text-purple-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 sm:py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-800 placeholder-purple-300"
              required
            />
          </div>

          {/* Join Room */}
          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-purple-700 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="w-full px-4 py-3 sm:py-4 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white font-mono text-lg text-center text-gray-800 placeholder-purple-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={!roomId.trim() || !userName.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 sm:py-4 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <LogIn className="w-5 h-5" />
              <span>Join Room</span>
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-purple-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-purple-600 font-medium">or</span>
            </div>
          </div>

          {/* Create Room */}
          <form onSubmit={handleCreateRoom}>
            <button
              type="submit"
              disabled={!userName.trim() || isCreating}
              className="w-full bg-white text-purple-700 py-3 sm:py-4 px-4 rounded-xl font-semibold hover:bg-purple-50 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 border-2 border-purple-300 hover:border-purple-500 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Users className="w-5 h-5" />
              <span>{isCreating ? 'Creating...' : 'Create New Room'}</span>
            </button>
          </form>

          {/* Connection Status */}
          {isCreating && (
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                <span className="text-sm font-semibold text-purple-800">Status: {connectionStatus}</span>
              </div>
              <div className="text-xs text-purple-600">
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
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowDebug(!showDebug)}
                className="text-xs text-purple-600 hover:text-purple-800 underline font-medium"
              >
                {showDebug ? 'Hide' : 'Show'} Debug Info
              </button>
              <button
                type="button"
                onClick={handleResetConnection}
                className="text-xs text-red-500 hover:text-red-700 underline font-medium"
              >
                Reset Connection
              </button>
              <button
                type="button"
                onClick={handleTestEndpoint}
                className="text-xs text-purple-600 hover:text-purple-800 underline font-medium"
              >
                Test Endpoint
              </button>
            </div>
            
            {showDebug && (
              <div className="mt-2 bg-gray-900 text-green-400 p-3 rounded-xl text-xs font-mono max-h-40 overflow-y-auto">
                <div className="mb-2 text-purple-400 font-bold">Debug Logs:</div>
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
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 sm:p-5 border-2 border-purple-100">
            <h3 className="font-bold text-purple-800 mb-3 text-base">How it works:</h3>
            <ul className="text-sm text-purple-700 space-y-2">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">✨</span>
                <span>Create a room to become the admin</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">🔗</span>
                <span>Share the room code with your team</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">😊</span>
                <span>Vote with emoji and 1-10 slider</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">🎴</span>
                <span>Cards auto-flip when everyone votes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
