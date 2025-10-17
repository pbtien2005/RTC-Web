import { store } from "./store.js";
import { appendIncoming } from "./messages.view.js";
import { upsertPeerAndRender } from "./peers.view.js"; // thêm dòng này
import { renderPeers } from "./peers.view.js";

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
    console.log(store.listPeers());
    store.deletePeer(obj.id);
    console.log(store.listPeers());
    renderPeers();
    return;
  }

  // 🧩 4. Nếu là message chat thường
  appendIncoming(rawString, store.getClientId());
}
