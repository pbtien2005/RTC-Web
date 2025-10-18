import { store } from "./store.js";
import { appendIncoming } from "./messages.view.js";
import { upsertPeerAndRender } from "./peers.view.js"; // thêm dòng này
import { renderPeers } from "./peers.view.js";
import { showIncomingRequest } from "./request.view.js";
import { renderTarget } from "./peers.view.js";
import { sendWS } from "./socket.js";
export function handleIncoming(rawString) {
  let obj;
  try {
    obj = JSON.parse(rawString);
  } catch {
    console.error("Không parse được JSON:", rawString);
    return;
  }

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
    appendIncoming(rawString, store.getClientId());
  }
  if (obj.type == "request.receive") {
    appendIncoming(rawString, store.getClientId());
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
    appendIncoming(rawString, store.getClientId());
    store.setTarget(obj.id);
    renderTarget();
    document.querySelector("#ws-target-id").textContent = store.getTarget();
  }
  if (obj.type == "request.receive.reject") {
    appendIncoming(rawString, store.getClientId());
    document.querySelector("#ws-target-id").textContent = "";
  }
}
