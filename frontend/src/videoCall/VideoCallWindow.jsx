import React, { useEffect, useRef, useState } from "react";
import { useVideoCall } from "./VideoCallContext";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Minimize2,
  Maximize2,
  MessageSquare,
} from "lucide-react";

export const VideoCallWindow = () => {
  const {
    callState,
    localStreamRef,
    remoteStreamRef,
    endCall,
    toggleMute,
    toggleVideo,
    toggleMinimize,
  } = useVideoCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [showChat, setShowChat] = useState(false);

  // Hiển thị local stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [localStreamRef.current]);

  // Hiển thị remote stream
  useEffect(() => {
    if (remoteVideoRef.current && remoteStreamRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }
  }, [remoteStreamRef.current]);

  if (!callState.isInCall) {
    console.log("đã chạy dòng này");
    return null;
  }

  // Minimized view
  if (callState.isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-gray-900 rounded-lg shadow-2xl w-64 overflow-hidden">
          {/* Remote video mini */}
          <div className="relative h-36 bg-gray-800">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Caller info overlay */}
            <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1">
              <p className="text-white text-xs font-medium">
                {callState.callerInfo?.username || "Unknown"}
              </p>
            </div>

            {/* Controls overlay */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
              <button
                onClick={toggleMute}
                className={`p-2 rounded-full ${
                  callState.isMuted ? "bg-red-600" : "bg-gray-700"
                } hover:opacity-80 transition`}
              >
                {callState.isMuted ? (
                  <MicOff className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-white" />
                )}
              </button>

              <button
                onClick={endCall}
                className="p-2 rounded-full bg-red-600 hover:bg-red-700 transition"
              >
                <PhoneOff className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={toggleMinimize}
                className="p-2 rounded-full bg-gray-700 hover:opacity-80 transition"
              >
                <Maximize2 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-7xl mx-auto p-4">
        {/* Remote video (main) */}
        <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-900">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Caller info */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 rounded-lg px-4 py-2">
            <p className="text-white text-lg font-medium">
              {callState.callerInfo?.username || "Unknown"}
            </p>
            <p className="text-gray-300 text-sm">In call...</p>
          </div>

          {/* Local video (picture-in-picture) */}
          <div className="absolute bottom-20 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {callState.isVideoOff && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Controls bar */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 rounded-full px-6 py-3 shadow-2xl">
            <div className="flex items-center gap-4">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full ${
                  callState.isMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } transition`}
                title={callState.isMuted ? "Unmute" : "Mute"}
              >
                {callState.isMuted ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-white" />
                )}
              </button>

              {/* Video toggle */}
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  callState.isVideoOff
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-700 hover:bg-gray-600"
                } transition`}
                title={
                  callState.isVideoOff ? "Turn on camera" : "Turn off camera"
                }
              >
                {callState.isVideoOff ? (
                  <VideoOff className="w-5 h-5 text-white" />
                ) : (
                  <Video className="w-5 h-5 text-white" />
                )}
              </button>

              {/* End call button */}
              <button
                onClick={endCall}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition"
                title="End call"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>

              {/* Chat toggle */}
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                title="Toggle chat"
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </button>

              {/* Minimize button */}
              <button
                onClick={toggleMinimize}
                className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                title="Minimize"
              >
                <Minimize2 className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Chat sidebar (optional) */}
          {showChat && (
            <div className="absolute top-0 right-0 w-80 h-full bg-gray-800 bg-opacity-95 border-l border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </button>
              </div>
              <div className="text-gray-400 text-sm">
                Chat messages will appear here...
                <br />
                (Integrate with your existing chat component)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
