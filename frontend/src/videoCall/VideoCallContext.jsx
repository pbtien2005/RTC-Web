import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { getCurrentUserId } from "../hook/GetCurrentUserId";
import { store } from "../ws/store";
import { sendWS } from "../ws/socket";
import {
  createPeer,
  setIceHandler,
  attachLocalTracks,
  getLocalStream,
  onRemoteTrack,
  makeOffer,
  closePeer,
  setRemoteDescription,
  addIceCandidate,
  makeAnswer,
} from "./peerConnection.js";

const VideoCallContext = createContext();

export const useVideoCall = () => {
  const context = useContext(VideoCallContext);
  if (!context) {
    throw new Error("useVideoCall must be used within VideoCallProvider");
  }
  return context;
};

export const VideoCallProvider = ({ children }) => {
  const [callState, setCallState] = useState({
    isInCall: false,
    isMinimized: false,
    isMuted: false,
    isVideoOff: false,
    callerInfo: null,
    conversationId: null,
    callStatus: "idle", // idle, calling, connecting, connected, ended
  });

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);

  // Xử lý khi nhận được remote stream
  useEffect(() => {
    onRemoteTrack((remoteStream) => {
      console.log("📺 Received remote stream");
      remoteStreamRef.current = remoteStream;

      // Trigger re-render để update video element
      setCallState((prev) => ({
        ...prev,
        callStatus: "connected",
        hasRemoteStream: true,
      }));
    });
  }, []);

  // Khởi tạo video call (caller)
  const initiateCall = async (conversationId, callerInfo) => {
    try {
      console.log("🔵 Initiating call to:", callerInfo.name);

      // Set target trong store
      store.setTarget(callerInfo.userId || callerInfo.id);

      setCallState({
        isInCall: true,
        isMinimized: false,
        isMuted: false,
        isVideoOff: false,
        callerInfo,
        conversationId,
        callStatus: "calling",
      });

      // 1️⃣ Tạo peer connection
      createPeer();

      // 2️⃣ Setup ICE handler
      setIceHandler((candidate) => {
        if (!candidate) return;
        console.log("🧊 Sending ICE candidate");
        sendWS({
          type: "call.ice",
          from: getCurrentUserId(),
          to: callerInfo.userId || callerInfo.id,
          conversationId,
          data: candidate,
        });
      });

      // 3️⃣ Lấy local stream
      const localStream = await getLocalStream();
      localStreamRef.current = localStream;
      attachLocalTracks(localStream);

      // 4️⃣ Tạo offer
      const offer = await makeOffer();

      setCallState((prev) => ({ ...prev, callStatus: "connecting" }));

      // 5️⃣ Gửi offer qua WebSocket
      sendWS({
        type: "call.offer",
        from: getCurrentUserId(),
        to: callerInfo.userId || callerInfo.id,
        conversationId,
        data: offer,
      });

      return true;
    } catch (error) {
      console.error("❌ Error initiating call:", error);
      endCall();
      return false;
    }
  };

  // Nhận cuộc gọi (receiver)
  const acceptCall = async () => {
    if (!incomingCall) return false;

    try {
      console.log("🟢 Accepting call from:", incomingCall.callerInfo.name);

      const { offer, callerInfo, conversationId } = incomingCall;

      setCallState({
        isInCall: true,
        isMinimized: false,
        isMuted: false,
        isVideoOff: false,
        callerInfo,
        conversationId,
        callStatus: "connecting",
      });

      // 1️⃣ Tạo peer connection
      createPeer();

      // 2️⃣ Setup ICE handler
      setIceHandler((candidate) => {
        if (!candidate) return;
        console.log("🧊 Sending ICE candidate");
        sendWS({
          type: "call.ice",
          from: getCurrentUserId(),
          to: callerInfo.userId || callerInfo.id,
          conversationId,
          data: candidate,
        });
      });

      // 3️⃣ Lấy local stream
      const localStream = await getLocalStream();
      localStreamRef.current = localStream;
      attachLocalTracks(localStream);

      // 4️⃣ Set remote description (offer)
      await setRemoteDescription(offer);

      // 5️⃣ Tạo answer
      const answer = await makeAnswer();

      // 6️⃣ Gửi answer qua WebSocket
      sendWS({
        type: "call.answer",
        from: getCurrentUserId(),
        to: callerInfo.userId || callerInfo.id,
        conversationId,
        data: answer,
      });

      setIncomingCall(null);
      return true;
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      endCall();
      return false;
    }
  };

  // Từ chối cuộc gọi
  const declineCall = () => {
    if (!incomingCall) return;

    sendWS({
      type: "call.decline",
      from: getCurrentUserId(),
      to: incomingCall.callerInfo.userId || incomingCall.callerInfo.id,
      conversationId: incomingCall.conversationId,
    });

    setIncomingCall(null);
  };

  // Kết thúc cuộc gọi
  const endCall = () => {
    console.log("🔴 Ending call");

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    closePeer();

    // Gửi thông báo kết thúc
    if (callState.conversationId && callState.callerInfo) {
      sendWS({
        type: "call.end",
        from: getCurrentUserId(),
        to: callState.callerInfo.userId || callState.callerInfo.id,
        conversationId: callState.conversationId,
      });
    }

    localStreamRef.current = null;
    remoteStreamRef.current = null;

    setCallState({
      isInCall: false,
      isMinimized: false,
      isMuted: false,
      isVideoOff: false,
      callerInfo: null,
      conversationId: null,
      callStatus: "idle",
    });
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({ ...prev, isMuted: !audioTrack.enabled }));
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState((prev) => ({ ...prev, isVideoOff: !videoTrack.enabled }));
      }
    }
  };

  // Minimize/Maximize window
  const toggleMinimize = () => {
    setCallState((prev) => ({ ...prev, isMinimized: !prev.isMinimized }));
  };

  // Xử lý WebSocket messages
  const handleCallMessage = async (message) => {
    try {
      switch (message.type) {
        case "call.offer":
          console.log("📞 Received call offer from:", message.from);
          setIncomingCall({
            offer: message.data,
            callerInfo: {
              userId: message.from,
              name: message.callerName || "Unknown",
              avatar: message.callerAvatar,
            },
            conversationId: message.conversationId,
          });
          break;

        case "call.answer":
          console.log("✅ Received call answer");
          await setRemoteDescription(message.data);
          setCallState((prev) => ({ ...prev, callStatus: "connected" }));
          break;

        case "call.ice":
          console.log("🧊 Received ICE candidate");
          await addIceCandidate(message.data);
          break;

        case "call.decline":
          console.log("❌ Call declined");
          endCall();
          alert("Call was declined");
          break;

        case "call.end":
          console.log("🔴 Call ended by remote");
          endCall();
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error handling call message:", error);
    }
  };

  // Monitor device changes
  useEffect(() => {
    const handleDeviceChange = async () => {
      console.log("📸 Device changed");
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some((d) => d.kind === "videoinput");
        const hasMic = devices.some((d) => d.kind === "audioinput");

        if ((hasCamera || hasMic) && callState.isInCall) {
          // Refresh local stream if in call
          const newStream = await getLocalStream();
          localStreamRef.current = newStream;
          attachLocalTracks(newStream);
        }
      } catch (err) {
        console.error("Device change handler error:", err);
      }
    };

    navigator.mediaDevices?.addEventListener(
      "devicechange",
      handleDeviceChange
    );

    return () => {
      navigator.mediaDevices?.removeEventListener(
        "devicechange",
        handleDeviceChange
      );
    };
  }, [callState.isInCall]);

  const value = {
    callState,
    localStreamRef,
    remoteStreamRef,
    incomingCall,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleMinimize,
    handleCallMessage, // Export để dùng trong WebSocket handler
  };

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
