import {
  addIce,
  applyAnswer,
  applyOfferAndMakeAnswer,
  createPeer,
} from "../videoCall/peerConnection.js";
import { tryParseJSON } from "./utils.js";
import { apiFetch } from "../api/api.js";
let ui = {
  addMessage: () => {},
  userStatusUpdate: () => {},
  handleCallAccepted: () => {},
  setCallState: (e) => {},
  setIncomingCall: (e) => {},
  handleCallOffer: () => {},
  endCall: () => {},
  pendingCallRef: "",
};

let messageQueue = [];
let isUIReady = false;

export function registerUI(api) {
  Object.keys(api).forEach((key) => {
    ui[key] = api[key];
  });

  isUIReady = true;

  // Xử lý các messages trong queue
  if (messageQueue.length > 0) {
    console.log(`📦 Processing ${messageQueue.length} queued messages`);
    messageQueue.forEach((queuedMessage) => {
      handleIncoming(queuedMessage);
    });
    messageQueue = [];
  }
}
export async function handleIncoming(rawString) {
  if (!isUIReady) {
    console.log("⏳ UI not ready, queueing message");
    messageQueue.push(rawString);
    return;
  }
  let obj;
  obj = tryParseJSON(rawString);

  // 🧩 4. Nếu là message chat thường
  if (obj.type == "user.online") {
    ui.userStatusUpdate(obj.sender_id, true);
    console.log(typeof obj.sender_id);
  }
  // if (obj.type == "user.online_list") {
  //   // const ids = obj.data.map(String);

  //   // for (const uidStr of ids) {
  //   //   console.log("Updating status for user:", uidStr);
  //   //   console.log("Calling ui.userStatusUpdate with:", uidStr, true);

  //   //   try {
  //   //     const result = ui.userStatusUpdate(uidStr, true);
  //   //     console.log("Result:", result);
  //   //   } catch (e) {
  //   //     console.error("Error calling userStatusUpdate:", e);
  //   //   }
  //   // }
  //   try {
  //     const res = await apiFetch("/conversation/user-online", {
  //       method: "GET",
  //     });
  //     const data = res.json();
  //     console.log(data);
  //   } catch (e) {
  //     console.error(e);
  //   }

  if (obj.type == "user.offline") {
    console.log("đã nhận user.offline");
    ui.userStatusUpdate(obj.sender_id, false);
  }
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
