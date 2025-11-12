import {
  addIce,
  applyAnswer,
  applyOfferAndMakeAnswer,
  createPeer,
} from "../videoCall/peerConnection.js";
import { tryParseJSON } from "./utils.js";
let ui = {
  addMessage: () => {},
  handleCallAccepted: () => {},
  setCallState: (e) => {},
  setIncomingCall: (e) => {},
  handleCallOffer: () => {},
  endCall: () => {},
  pendingCallRef: "",
};

export function registerUI(api) {
  ui = { ...ui, ...api };
}

export async function handleIncoming(rawString) {
  let obj;
  obj = tryParseJSON(rawString);

  // 🧩 4. Nếu là message chat thường
  if (obj.type == "message.send") {
    ui.addMessage(obj);
  }

  if (obj.type == "call.request") {
    console.log(obj);
    ui.setIncomingCall({
      calleeInfo: {
        id: obj.sender_id,
        username: obj.data.sender_name,
        avatar_url: obj.data.sender_avatar,
      },
      conversationId: obj.data.conversation_id,
    });
  }
  if (obj.type == "call.accept") {
    console.log("✅ Call accepted by callee");
    ui.handleCallAccepted();
  }
  if (obj.type == "call.offer") {
    console.log("📥 Received offer");
    ui.handleCallOffer(obj.data);
  }
  if (obj.type == "call.answer") {
    console.log("📥 Received answer");
    applyAnswer(obj.data);
    ui.setCallState((prev) => ({ ...prev, callStatus: "connected" }));
  }
  if (obj.type == "call.ice") {
    console.log(obj.data);
    await addIce(obj.data);
  }
  if (obj.type == "call.end") {
    console.log("🔴 Call ended by remote");
    ui.endCall();
  }

  if (obj.type == "call.decline") {
    console.log("❌ Call declined");
    ui.pendingCallRef.current = null;
    ui.setCallState({
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
  }
  if (obj.type == "call.cancel") {
    console.log("🚫 Call cancelled by caller");
    ui.setIncomingCall(null);
  }
}
