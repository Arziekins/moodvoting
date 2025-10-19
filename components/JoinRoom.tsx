'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Zap } from 'lucide-react';
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
  const [mode, setMode] = useState<'choose' | 'join' | 'create'>('choose');

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden relative">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 kahoot-purple rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 kahoot-blue rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 kahoot-yellow rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative w-full max-w-lg fade-in-scale">
        {/* Choose Mode Screen */}
        {mode === 'choose' && (
          <div className="liquid-glass rounded-3xl shadow-2xl p-8 sm:p-10 border-2 border-white/50">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="inline-block gradient-animated p-6 rounded-3xl mb-6 float">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black gradient-text-kahoot mb-3 tracking-tight">
                Mood Check! 🎉
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-semibold">
                Fun team mood voting
              </p>
            </div>

            {/* User Name Input - Always visible */}
            <div className="mb-6">
              <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-5 py-4 border-3 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-400 transition-all bg-white text-gray-800 placeholder-gray-400 text-lg font-bold shadow-sm"
                required
              />
            </div>

            {/* Big Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={() => userName.trim() && setMode('join')}
                disabled={!userName.trim()}
                className="w-full btn-kahoot kahoot-blue flex items-center justify-center space-x-3"
              >
                <Zap className="w-6 h-6" />
                <span>Join Room</span>
              </button>

              <button
                onClick={() => userName.trim() && setMode('create')}
                disabled={!userName.trim() || isCreating}
                className="w-full btn-kahoot kahoot-red flex items-center justify-center space-x-3"
              >
                <Sparkles className="w-6 h-6" />
                <span>{isCreating ? 'Creating...' : 'Create Room'}</span>
              </button>
            </div>

            {/* Info Box */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 border-2 border-blue-100">
              <h3 className="font-black text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center space-x-2">
                <span className="text-xl">✨</span>
                <span>How it Works</span>
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 font-semibold">
                <li className="flex items-start">
                  <span className="text-lg mr-2">🎮</span>
                  <span>Create or join a room with your team</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">😊</span>
                  <span>Vote with your emoji and mood (1-10)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">🔒</span>
                  <span>Stays anonymous until everyone votes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-lg mr-2">🎉</span>
                  <span>Cards flip automatically to reveal results!</span>
                </li>
              </ul>
            </div>

            {/* Debug Toggle */}
            {showDebug ? (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowDebug(false)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline font-medium"
                  >
                    Hide Debug
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
                    className="text-xs text-gray-500 hover:text-gray-700 underline font-medium"
                  >
                    Test Endpoint
                  </button>
                </div>
                
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
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDebug(true)}
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline font-medium w-full text-center"
              >
                Show Debug Info
              </button>
            )}
          </div>
        )}

        {/* Join Room Screen */}
        {mode === 'join' && (
          <div className="liquid-glass rounded-3xl shadow-2xl p-8 sm:p-10 border-2 border-white/50">
            <button
              onClick={() => setMode('choose')}
              className="mb-6 text-gray-600 hover:text-gray-800 font-bold text-sm flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <div className="text-center mb-8">
              <div className="inline-block kahoot-blue p-6 rounded-3xl mb-6 bounce-subtle">
                <Zap className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black gradient-text-kahoot mb-2">
                Join a Room
              </h2>
              <p className="text-gray-600 font-semibold">
                Enter the 4-digit room code
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="1234"
                  maxLength={4}
                  className="w-full px-5 py-5 border-3 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-300 focus:border-blue-400 transition-all bg-white font-black text-3xl text-center text-gray-800 placeholder-gray-300 tracking-widest shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!roomId.trim() || !userName.trim() || isCreating}
                className="w-full btn-kahoot kahoot-blue flex items-center justify-center space-x-3"
              >
                <Zap className="w-6 h-6" />
                <span>Join Now!</span>
              </button>
            </form>

            {isCreating && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-blue-600"></div>
                  <span className="text-sm font-black text-blue-800 uppercase">{connectionStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Room Screen */}
        {mode === 'create' && (
          <div className="liquid-glass rounded-3xl shadow-2xl p-8 sm:p-10 border-2 border-white/50">
            <button
              onClick={() => setMode('choose')}
              className="mb-6 text-gray-600 hover:text-gray-800 font-bold text-sm flex items-center space-x-2"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <div className="text-center mb-8">
              <div className="inline-block kahoot-red p-6 rounded-3xl mb-6 bounce-subtle">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black gradient-text-kahoot mb-2">
                Create a Room
              </h2>
              <p className="text-gray-600 font-semibold">
                Start a new mood check session
              </p>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border-2 border-red-100">
                <p className="text-sm font-bold text-gray-700 text-center">
                  <span className="text-2xl mr-2">👑</span>
                  You&apos;ll be the admin and can manage the session
                </p>
              </div>

              <button
                type="submit"
                disabled={!userName.trim() || isCreating}
                className="w-full btn-kahoot kahoot-red flex items-center justify-center space-x-3"
              >
                <Sparkles className="w-6 h-6" />
                <span>{isCreating ? 'Creating...' : 'Create Now!'}</span>
              </button>
            </form>

            {isCreating && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-red-600"></div>
                  <span className="text-sm font-black text-red-800 uppercase">{connectionStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
