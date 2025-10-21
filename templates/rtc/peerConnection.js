import { endCall } from "./call.view.js";

let pc;
let localSTream;
let iceCandidateQueue = [];
let onIceCandidateHandler = null;
let onRemoteTrackHandler = null;

export async function getLocalStream() {
  if (localSTream) return localSTream;
  localSTream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  return localSTream;
}
export function attachLocalTracks(stream) {
  stream.getTracks().forEach((track) => {
    pc.addTrack(track, stream);
  });
}
export function createPeer() {
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };
  pc = new RTCPeerConnection(configuration);
  pc.onicecandidate = (e) => {
    onIceCandidateHandler(e.candidate);
  };
  pc.ontrack = (e) => {
    const remoteStream = e.streams?.[0];
    onRemoteTrackHandler(remoteStream);
  };
  pc.onconnectionstatechange = (event) => {
    const state = pc.connectionState;
    console.log("[Peer] connectionState:", pc.connectionState);
    switch (state) {
      case "connected":
        break;
      case "disconnected":
        break;
      case "failed":
        endCall();
        break;
      case "closed":
        endCall();
        break;
    }
  };
}
export function setIceHandler(fn) {
  onIceCandidateHandler = fn;
}

export function onRemoteTrack(fn) {
  onRemoteTrackHandler = fn;
}
export async function makeOffer() {
  if (!pc) throw new Error("PC not initialized");
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  console.log("[Peer] Created offer");
  return offer;
}
export async function applyOfferAndMakeAnswer(remoteOffer) {
  await pc.setRemoteDescription(remoteOffer);
  while (iceCandidateQueue.length > 0) {
    const candidate = iceCandidateQueue.shift();
    try {
      await pc.addIceCandidate(candidate);
    } catch (e) {
      console.error("lỗi khi thêm candidate từ queue: ", e);
    }
  }
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  console.log("apply and create success");
  return answer;
}
export async function applyAnswer(remoteAnswer) {
  try {
    // Thiết lập mô tả từ xa (answer của người nhận)
    await pc.setRemoteDescription(remoteAnswer);
    console.log("Áp dụng answer thành công!");
    while (iceCandidateQueue.length > 0) {
      const candidate = iceCandidateQueue.shift();
      try {
        await pc.addIceCandidate(candidate);
      } catch (e) {
        console.error("Lỗi khi thêm candidate từ hàng đợi:", e);
      }
    }
  } catch (error) {
    console.error("Lỗi khi áp dụng answer:", error);
  }
}
export async function addIce(candidate) {
  console.log(candidate);
  if (!pc.remoteDescription) {
    iceCandidateQueue.push(candidate);
  } else {
    try {
      if (candidate) {
        await pc.addIceCandidate(candidate);
      } else {
        console.log("ko co candidate");
      }
    } catch (error) {
      console.error("Lỗi khi thêm ICE candidate:", error);
    }
  }
  // Kiểm tra xem candidate có tồn tại không trước khi thêm
}

export function closePeer() {
  pc.close();
  pc.getSenders().forEach((sender) => sender.track?.stop());
}
export function toggleMic(enable) {
  if (localStream) {
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }
}
export function toggleCam(enable) {
  if (localStream) {
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = enabled;
    });
  }
}
