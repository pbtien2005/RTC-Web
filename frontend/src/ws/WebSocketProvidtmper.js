import { store } from "./store.js";
import { connectWS, sendWS } from "./socket.js";
import { handleIncoming } from "./dispatcher.js";
import { mountPeers } from "../../../templates/rtc/peers.view.js";
import * as CallView from "../../../templates/rtc/call.view.js";
import { startCall } from "../../../templates/rtc/call.controller.js";
import {
  applyOfferAndMakeAnswer,
  closePeer,
  toggleCam,
  toggleMic,
} from "../videoCall/peerConnection.js";
import { appendIncoming } from "../videoCall/messages.view.js";
import { setCallState } from "../../../templates/rtc/call.view.js";
import { onDeviceChanged } from "../../../templates/rtc/call.controller.js";
import { getCurrentUserId } from "../hook/GetCurrentUserId.jsx";

const client_id = getCurrentUserId();
store.setClientId(client_id);

document.querySelector("#ws-id").textContent = client_id;
mountPeers({
  listSelector: "#peers",
  targetSelector: "#target-id",
  clearBtnSelector: "#clear-target",
});
const wsScheme = location.protocol === "https:" ? "wss" : "ws";
const wsUrl = `${wsScheme}://${location.host}/ws/${client_id}`;
connectWS(wsUrl, handleIncoming);

CallView.on("end", () => {
  closePeer();
  console.log("bấm vào exit");
  setCallState("ended");
  sendWS({
    type: "call.end",
    from: store.getClientId(),
    to: store.getTarget(),
  });
});
CallView.on("toggle-mic", (enabled) => {
  toggleMic(enabled);
});
CallView.on("toggle-cam", (enabled) => {
  toggleCam(enabled);
});
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
navigator.mediaDevices.addEventListener("devicechange", onDeviceChanged);
