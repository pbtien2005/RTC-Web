import React from "react";
import { useVideoCall } from "./VideoCallContext";
import { PhoneOff } from "lucide-react";

export const RingingScreen = () => {
  const { callState, cancelCall } = useVideoCall();

  // Chỉ hiển thị khi đang ringing
  if (callState.callStatus !== "ringing") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
              {callState.calleeInfo?.avatar_url ? (
                <img
                  src={callState.calleeInfo.avatar_url}
                  alt={callState.calleeInfo.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-5xl font-bold text-white">
                  {callState.calleeInfo.username || "?"}
                </span>
              )}
            </div>
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-30 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-white opacity-20 animate-ping animation-delay-200"></div>
          </div>
        </div>

        {/* Calling text */}
        <h2 className="text-3xl font-bold text-white mb-3">
          {callState.calleeInfo?.username || "Unknown"}
        </h2>
        <p className="text-xl text-white text-opacity-80 mb-8 animate-pulse">
          Calling...
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-2 mb-12">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-3 h-3 bg-white rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Cancel button */}
        <button
          onClick={cancelCall}
          className="group w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 transition flex items-center justify-center shadow-2xl mx-auto"
        >
          <PhoneOff className="w-10 h-10 text-white" />
        </button>
        <p className="text-white text-opacity-60 mt-4">Cancel</p>
      </div>

      <style jsx>{`
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
};
