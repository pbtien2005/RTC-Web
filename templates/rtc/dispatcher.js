import { store } from "./store.js";
import { appendIncoming } from "./messages.view.js";
import { upsertPeerAndRender } from "./peers.view.js"; // thêm dòng này
import { renderPeers } from "./peers.view.js";
import { showIncomingRequest } from "./request.view.js";
import { renderTarget } from "./peers.view.js";
import { sendWS } from "./socket.js";
import * as CallView from "./call.view.js";
import {
  addIce,
  applyAnswer,
  applyOfferAndMakeAnswer,
  createPeer,
} from "./peerConnection.js";
import { startCall } from "./call.controller.js";
import { tryParseJSON } from "./utils.js";
import { closePeer } from "./peerConnection.js";

export async function handleIncoming(rawString) {
  let obj;
  obj = tryParseJSON(rawString);

  // 🧩 1. Nếu là danh sách peers (server gửi khi có người mới vào)
  if (obj.type === "peers" && Array.isArray(obj.list)) {
    obj.list.forEach((id) => upsertPeerAndRender(id));
    return; // không render tin nhắn
  }

  // 🧩 2. Nếu là join (một user mới vào)
  if (obj.type === "join" && obj.id) {
    upsertPeerAndRender(obj.id);
    return;
  }

  // 🧩 3. Nếu là leave (user rời đi)
  if (obj.type === "leave" && obj.id) {
    // nếu có hàm removePeer thì gọi ở đây
    console.log("User left:", obj.id);
    store.deletePeer(obj.id);
    renderPeers();
    return;
  }

  // 🧩 4. Nếu là message chat thường
  if (obj.type == "message.receive") {
    appendIncoming(rawString);
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
