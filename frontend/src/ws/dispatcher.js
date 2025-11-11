import { store } from "./store.js";
import { showIncomingRequest } from "../../../templates/rtc/request.view.js";
import { renderTarget } from "../../../templates/rtc/peers.view.js";
import { sendWS } from "./socket.js";
import * as CallView from "../../../templates/rtc/call.view.js";
import {
  addIce,
  applyAnswer,
  applyOfferAndMakeAnswer,
  createPeer,
} from "../videoCall/peerConnection.js";
import { startCall } from "../videoCall/call.controller.js";
import { tryParseJSON } from "./utils.js";
import { closePeer } from "../videoCall/peerConnection.js";

let ui = {
  addMessage: () => {},
  showRequestModal: () => {}, // (meId, peerId, onAccept, onReject)
  setCallState: () => {}, // "idle" | "connecting" | "in-call" | "ended"
};

export function registerUI(api) {
  ui = { ...ui, ...api };
}

export async function handleIncoming(rawString) {
  let obj;
  console.log("hello");
  obj = tryParseJSON(rawString);
  console.log("alo");
  if (obj.type == "connect.end") {
    store.clearTarget();
    document.querySelector("#ws-target-id").textContent = "";
  }

  // 🧩 4. Nếu là message chat thường
  if (obj.type == "message.send") {
    ui.addMessage(obj);
  }
  if (obj.type == "request.receive") {
    appendIncoming(rawString);
    showIncomingRequest(
      store.getClientId(),
      obj.id,
      // Accept
      () => {
        store.setTarget(obj.id);
        renderTarget();
        document.querySelector("#ws-target-id").textContent = store.getTarget();
        sendWS({
          type: "request.send.accept",
          from: store.getClientId(),
          to: obj.id,
        });
      },

      // Reject
      () =>
        sendWS({
          type: "request.send.reject",
          from: store.getClientId(),
          to: obj.id,
        })
    );
  }
  if (obj.type == "request.receive.accept") {
    appendIncoming(rawString);
    store.setTarget(obj.id);
    renderTarget();
    document.querySelector("#ws-target-id").textContent = store.getTarget();
  }
  if (obj.type == "request.receive.reject") {
    appendIncoming(rawString);
    document.querySelector("#ws-target-id").textContent = "";
  }
  if (obj.type == "call.request") {
    appendIncoming(obj.data);
    showIncomingRequest(
      store.getClientId(),
      obj.id,
      async () => {
        sendWS({
          type: "call.accept",
          from: store.getClientId(),
          to: obj.id,
        });
        CallView.setCallState("connecting");
        CallView.mount("#video-container");
        await startCall(false);
      },
      () => {
        sendWS({
          type: "call.reject",
          from: store.getClientId(),
          to: obj.id,
        });
      }
    );
  }
  if (obj.type == "call.accept") {
    appendIncoming(obj.data);
    try {
      await startCall(true);
      CallView.setCallState("connecting");
    } catch (e) {
      console.error("sendCall", e);
      CallView.setCallState?.("ended");
    }
  }
  if (obj.type == "call.offer") {
    const answer = await applyOfferAndMakeAnswer(obj.data);
    sendWS({
      type: "call.answer",
      from: store.getClientId(),
      to: obj.id,
      data: answer,
    });
  }
  if (obj.type == "call.answer") {
    await applyAnswer(obj.data);
  }
  if (obj.type == "call.ice") {
    console.log(obj.data);
    await addIce(obj.data);
  }
  if (obj.type == "call.end") {
    appendIncoming("the call ended!");
    closePeer();
    CallView.setCallState("ended");
  }
}
