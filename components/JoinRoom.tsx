'use client';

import { useState, useEffect } from 'react';
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
    <div className="min-h-screen apple-gradient-bg flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-md scale-in">
        {/* Choose Mode Screen */}
        {mode === 'choose' && (
          <div className="apple-card p-8 sm:p-10">
            {/* App Icon/Logo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 apple-gradient-purple rounded-3xl mb-6 shadow-apple">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 8C13.373 8 8 13.373 8 20C8 26.627 13.373 32 20 32C26.627 32 32 26.627 32 20C32 13.373 26.627 8 20 8Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="15" cy="18" r="1.5" fill="white"/>
                  <circle cx="25" cy="18" r="1.5" fill="white"/>
                  <path d="M15 24C15 24 17 26 20 26C23 26 25 24 25 24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h1 className="apple-title mb-2">Mood Check</h1>
              <p className="apple-caption">Share how your team is feeling</p>
            </div>

            {/* User Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="apple-input"
                required
              />
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => userName.trim() && setMode('join')}
                disabled={!userName.trim()}
                className="w-full apple-button-primary"
              >
                Join Room
              </button>

              <button
                onClick={() => userName.trim() && setMode('create')}
                disabled={!userName.trim() || isCreating}
                className="w-full apple-button-secondary"
              >
                {isCreating ? 'Creating...' : 'Create Room'}
              </button>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-4 bg-apple-purple-50 rounded-xl border border-apple-purple-100">
              <h3 className="text-sm font-semibold text-apple-gray-800 mb-3">How it works</h3>
              <ul className="text-sm text-apple-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">1.</span>
                  <span>Create or join a room with your team</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">2.</span>
                  <span>Everyone votes with emoji and mood scale</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">3.</span>
                  <span>Results stay hidden until everyone votes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">4.</span>
                  <span>Cards flip to reveal results together</span>
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
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Hide Debug
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
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Test Endpoint
                  </button>
                </div>
                
                <div className="mt-2 bg-apple-gray-900 text-green-400 p-3 rounded-xl text-xs font-mono max-h-40 overflow-y-auto">
                  <div className="mb-2 text-apple-purple-400 font-bold">Debug Logs:</div>
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
                className="mt-4 text-xs text-gray-400 hover:text-gray-600 underline w-full text-center"
              >
                Show Debug Info
              </button>
            )}
          </div>
        )}

        {/* Join Room Screen */}
        {mode === 'join' && (
          <div className="apple-card p-8 sm:p-10">
            <button
              onClick={() => setMode('choose')}
              className="mb-6 text-apple-purple-600 hover:text-apple-purple-700 font-medium text-sm flex items-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-apple-purple-100 rounded-2xl mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V24M8 16H24" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="apple-title mb-2">Join Room</h2>
              <p className="apple-caption">Enter the 4-digit room code</p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-apple-gray-700 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="1234"
                  maxLength={4}
                  className="apple-input text-2xl text-center font-semibold tracking-widest"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!roomId.trim() || !userName.trim() || isCreating}
                className="w-full apple-button-primary"
              >
                Join Room
              </button>
            </form>

            {isCreating && (
              <div className="mt-6 bg-apple-purple-50 border border-apple-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-apple-purple-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-apple-purple-800">{connectionStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Room Screen - No confirmation needed, direct creation */}
        {mode === 'create' && (
          <div className="apple-card p-8 sm:p-10">
            <button
              onClick={() => setMode('choose')}
              className="mb-6 text-apple-purple-600 hover:text-apple-purple-700 font-medium text-sm flex items-center"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1">
                <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back
            </button>

            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-apple-purple-100 rounded-2xl mb-4">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="10" stroke="#8B5CF6" strokeWidth="2.5"/>
                  <path d="M16 12V20M12 16H20" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="apple-title mb-2">Create Room</h2>
              <p className="apple-caption">Start a new mood check session</p>
            </div>

            <div className="mb-6 p-4 bg-apple-gray-50 rounded-xl">
              <p className="text-sm text-apple-gray-600 text-center">
                You'll be the admin and can manage the voting session
              </p>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!userName.trim() || isCreating}
              className="w-full apple-button-primary"
            >
              {isCreating ? 'Creating Room...' : 'Create Room'}
            </button>

            {isCreating && (
              <div className="mt-6 bg-apple-purple-50 border border-apple-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-apple-purple-600 border-t-transparent"></div>
                  <span className="text-sm font-medium text-apple-purple-800">{connectionStatus}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
