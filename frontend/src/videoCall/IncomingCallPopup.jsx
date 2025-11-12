import React, { useEffect, useState } from "react";
import { useVideoCall } from "./VideoCallContext";
import { Phone, PhoneOff } from "lucide-react";

export const IncomingCallPopup = () => {
  const { incomingCall, acceptCall, declineCall } = useVideoCall();

  if (!incomingCall) return null;

  const handleAccept = async () => {
    await acceptCall();
  };

  const handleDecline = () => {
    declineCall();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-bounce-in">
        {/* Avatar */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center animate-pulse">
              {incomingCall.calleeInfo.avatar_url ? (
                <img
                  src={incomingCall.calleeInfo.avatar_url}
                  alt={incomingCall.calleeInfo.name_url}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {incomingCall.calleeInfo.username}
                </span>
              )}
            </div>
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 animate-ping"></div>
          </div>
        </div>

        {/* Caller info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {incomingCall.calleeInfo.username}
          </h2>
          <p className="text-gray-500">Incoming video call...</p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-6">
          {/* Decline */}
          <button
            onClick={handleDecline}
            className="group relative w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 transition flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <PhoneOff className="w-8 h-8 text-white" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition">
              Decline
            </span>
          </button>

          {/* Accept */}
          <button
            onClick={handleAccept}
            className="group relative w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 transition flex items-center justify-center shadow-lg hover:shadow-xl animate-pulse"
          >
            <Phone className="w-8 h-8 text-white" />
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 opacity-0 group-hover:opacity-100 transition">
              Accept
            </span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
