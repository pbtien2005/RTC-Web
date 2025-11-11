import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { getCurrentUserId } from "../hook/GetCurrentUserId";
import { sendWS } from "../ws/socket.js";
import {
  getLocalStream,
  attachLocalTracks,
  createPeer,
  makeOffer,
  applyOfferAndMakeAnswer,
  setIceHandler,
  onRemoteTrack,
  closePeer,
} from "./peerConnection";
import { registerUI } from "../ws/dispatcher.js";

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
    calleeInfo: null,
    conversationId: null,
    callStatus: "idle", // idle, ringing, connecting, connected, ended
    hasRemoteStream: false,
  });

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const pendingCallRef = useRef(null); // Lưu thông tin cuộc gọi đang chờ accept

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

  // 🔵 BƯỚC 1: Gửi yêu cầu gọi (CALLER)
  const requestCall = async (conversationId, callerInfo, calleeInfo) => {
    try {
      console.log("📞 Requesting call to:", calleeInfo.username);

      // Lưu thông tin để dùng sau khi callee accept
      pendingCallRef.current = {
        conversationId,
        callerInfo,
        calleeInfo,
      };

      // Chỉ set trạng thái "ringing" chứ chưa init peer
      setCallState({
        isInCall: false, // Chưa vào call
        isMinimized: false,
        isMuted: false,
        isVideoOff: false,
        callerInfo,
        calleeInfo,
        conversationId,
        callStatus: "ringing", // Đang đổ chuông
        hasRemoteStream: false,
      });

      // Gửi request qua WebSocket
      sendWS({
        type: "call.request",
        sender_id: callerInfo.id,
        receiver_id: calleeInfo.id,
        data: {
          sender_name: callerInfo.username,
          sender_avatar: callerInfo.avatar_url,
          conversation_id: conversationId,
          caller_info: callerInfo,
        },
      });

      return true;
    } catch (error) {
      console.error("❌ Error requesting call:", error);
      pendingCallRef.current = null;
      setCallState((prev) => ({ ...prev, callStatus: "idle" }));
      return false;
    }
  };

  // 🟢 BƯỚC 2: Callee nhận được request và accept
  const acceptCall = async () => {
    if (!incomingCall) return false;

    try {
      console.log("🟢 Accepting call from:", incomingCall.callerInfo.username);
      const { callerInfo, conversationId } = incomingCall;
      const raw = localStorage.getItem("user");
      const user = JSON.parse(raw);
      const calleeInfo = {
        id: user.user_id,
        username: user.username,
        avatar_url: user.avatar_url,
      };

      // Set trạng thái đang chờ
      setCallState({
        isInCall: false,
        isMinimized: false,
        isMuted: false,
        isVideoOff: false,
        callerInfo,
        calleeInfo,
        conversationId,
        callStatus: "connecting",
        hasRemoteStream: false,
      });

      // Gửi accept về cho caller
      sendWS({
        type: "call.accept",
        sender_id: getCurrentUserId(),
        receiver_id: callerInfo.id,
      });

      setIncomingCall(null);

      // Chưa init peer ở đây, đợi nhận offer từ caller
      return true;
    } catch (error) {
      console.error("❌ Error accepting call:", error);
      endCall();
      return false;
    }
  };

  // 🔵 BƯỚC 3: Caller nhận được accept, bắt đầu init peer và tạo offer
  const handleCallAccepted = async () => {
    if (!pendingCallRef.current) {
      console.error("❌ No pending call to accept");
      return;
    }

    const { conversationId, callerInfo, calleeInfo } = pendingCallRef.current;

    console.log("✅ Call accepted, initializing peer connection...");

    setCallState((prev) => ({
      ...prev,
      isInCall: true,
      callStatus: "connecting",
    }));

    // 1️⃣ Tạo peer connection
    createPeer();

    // 2️⃣ Setup ICE handler
    setIceHandler((candidate) => {
      if (!candidate) return;
      console.log("🧊 Sending ICE candidate");
      sendWS({
        type: "call.ice",
        sender_id: callerInfo.id,
        receiver_id: calleeInfo.id,
        data: candidate,
      });
    });

    // 3️⃣ Lấy local stream
    const localStream = await getLocalStream();
    localStreamRef.current = localStream;
    attachLocalTracks(localStream);

    // 4️⃣ Tạo offer
    const offer = await makeOffer();

    // 5️⃣ Gửi offer qua WebSocket
    sendWS({
      type: "call.offer",
      sender_id: callerInfo.id,
      receiver_id: calleeInfo.id,
      data: offer,
    });

    console.log("📤 Offer sent");
    pendingCallRef.current = null;
  };

  // 🟢 BƯỚC 4: Callee nhận offer, init peer và tạo answer
  const handleCallOffer = async (offer) => {
    console.log("📥 Received offer, creating answer...");

    setCallState((prev) => ({
      ...prev,
      isInCall: true,
      callStatus: "connecting",
    }));

    // 1️⃣ Tạo peer connection
    createPeer();

    // 2️⃣ Setup ICE handler
    setIceHandler((candidate) => {
      if (!candidate) return;
      console.log("🧊 Sending ICE candidate");
      sendWS({
        type: "call.ice",
        sender_id: callState.calleeInfo.id,
        receiver_id: callState.callerInfo.id,
        data: candidate,
      });
    });

    // 3️⃣ Lấy local stream
    const localStream = await getLocalStream();
    localStreamRef.current = localStream;
    attachLocalTracks(localStream);

    // 4️⃣ Apply offer và tạo answer
    const answer = await applyOfferAndMakeAnswer(offer);

    // 5️⃣ Gửi answer qua WebSocket
    sendWS({
      type: "call.answer",
      sender_id: callState.calleeInfo.id,
      receiver_id: callState.callerInfo.id,
      data: answer,
    });

    console.log("📤 Answer sent");
  };

  // Từ chối cuộc gọi
  const declineCall = () => {
    if (!incomingCall) return;

    sendWS({
      type: "call.decline",
      sender_id: getCurrentUserId(),
      receiver_id: incomingCall.callerInfo.id,
    });

    setIncomingCall(null);
    setCallState((prev) => ({ ...prev, callStatus: "idle" }));
  };

  // Hủy cuộc gọi (caller hủy trước khi callee accept)
  const cancelCall = () => {
    if (!pendingCallRef.current) return;

    const { calleeInfo } = pendingCallRef.current;

    sendWS({
      type: "call.cancel",
      sender_id: getCurrentUserId(),
      receiver_id: calleeInfo.id,
    });

    pendingCallRef.current = null;
    setCallState({
      isInCall: false,
      isMinimized: false,
      isMuted: false,
      isVideoOff: false,
      callerInfo: null,
      calleeInfo: null,
      conversationId: null,
      callStatus: "idle",
      hasRemoteStream: false,
    });
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
    if (callState.conversationId && callState.calleeInfo) {
      sendWS({
        type: "call.end",
        sender_id: getCurrentUserId(),
        receiver_id: callState.calleeInfo.id,
      });
    }

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCallRef.current = null;

    setCallState({
      isInCall: false,
      isMinimized: false,
      isMuted: false,
      isVideoOff: false,
      callerInfo: null,
      calleeInfo: null,
      conversationId: null,
      callStatus: "idle",
      hasRemoteStream: false,
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
    requestCall, // Đổi tên từ initiateCall -> requestCall
    acceptCall,
    declineCall,
    cancelCall, // Thêm cancel
    endCall,
    toggleMute,
    toggleVideo,
    toggleMinimize,
  };
  useEffect(() => {
    registerUI({
      setCallState: (e) => setCallState(e),
      handleCallAccepted: () => handleCallAccepted(),
      setIncomingCall: (e) => setIncomingCall(e),
      handleCallOffer: (e) => handleCallOffer(e),
      endCall: () => endCall(),
      pendingCallRef: pendingCallRef,
    });
  });
  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
