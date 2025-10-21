import { store } from "./store.js";
import {
  createPeer,
  setIceHandler,
  attachLocalTracks,
  getLocalStream,
  onRemoteTrack,
  makeOffer,
  closePeer,
} from "./peerConnection.js";
import {
  bindLocalStream,
  bindRemoteStream,
  setCallState,
} from "./call.view.js";
import { sendWS } from "./socket.js";

let callState = "idle";
let currentTarget = null;

export async function startCall(isCaller) {
  try {
    setCallState("calling");

    createPeer();
    // Khi có ICE → gửi sang peer kia
    setIceHandler((candidate) => {
      if (!candidate) return;
      sendWS({
        type: "call.ice",
        from: store.getClientId(),
        to: store.getTarget(),
        data: candidate,
      });
    });

    // Khi nhận được remote stream → hiển thị lên giao diện
    onRemoteTrack((remoteStream) => {
      bindRemoteStream(remoteStream);
    });

    // 3️⃣ Lấy camera/mic local → hiện preview & add vào connection
    const localStream = await getLocalStream();
    bindLocalStream(localStream);
    attachLocalTracks(localStream);

    // 4️⃣ Tạo offer và gửi sang peer bên kia
    if (isCaller) {
      const offer = await makeOffer();
      callState = "connecting";
      setCallState("connecting");

      sendWS({
        type: "call.offer",
        from: store.getClientId(),
        to: store.getTarget(),
        data: offer,
      });
    }
  } catch (err) {
    console.error("startCall error:", err);
    callState = "ended";
    setCallState("ended");
  }
}
