import { store } from "./store.js";
import { connectWS, sendWS } from "./socket.js";
import { handleIncoming } from "./dispatcher.js";
import { mountPeers } from "./peers.view.js";
import * as CallView from "./call.view.js";
import { startCall } from "./call.controller.js";
import { endCall } from "./call.view.js";
import {
  applyOfferAndMakeAnswer,
  toggleCam,
  toggleMic,
} from "./peerConnection.js";
import { appendIncoming } from "./messages.view.js";

const client_id = Date.now();
store.setClientId(client_id);

document.querySelector("#ws-id").textContent = client_id;
mountPeers({
  listSelector: "#peers",
  targetSelector: "#target-id",
  clearBtnSelector: "#clear-target",
});
const wsUrl = `ws://192.168.101.186:8000/ws/${client_id}`;
connectWS(wsUrl, handleIncoming);

CallView.on("end", endCall);
CallView.on("toggle-mic", toggleMic);
CallView.on("toggle-cam", toggleCam);
CallView.on("share-screen", () => {});

// Giữ nguyên API global để form onsubmit gọi được
window.sendMessage = function (event) {
  const input = document.getElementById("messageText");
  const target = store.getTarget();
  const msg = {
    type: "message.send",
    id: client_id,
    to: target,
    data: input.value,
  };
  sendWS(msg);
  input.value = "";
  event.preventDefault();
};
window.sendRequest = function (event, tar) {
  const reqMsg = `User ${client_id} is requesting to connect with you.`;
  const msg = {
    type: "friend.request",
    id: client_id,
    to: tar,
    data: reqMsg,
  };
  sendWS(msg);
};
window.sendCall = async function (event) {
  if (store.getTarget() == null) {
    appendIncoming("must have a target to call");
    return;
  }
  const msg = {
    type: "call.request",
    id: store.getClientId(),
    to: store.getTarget(),
    data: `User ${store.getClientId()} is calling to you`,
  };
  sendWS(msg);
  CallView.setCallState?.("calling");
  CallView.mount("#video-container");
};
