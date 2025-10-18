import { store } from "./store.js";
import { connectWS, sendWS } from "./socket.js";
import { handleIncoming } from "./dispatcher.js";
import { mountPeers } from "./peers.view.js";

const client_id = Date.now();
store.setClientId(client_id);
document.querySelector("#ws-id").textContent = client_id;
mountPeers({
  listSelector: "#peers",
  targetSelector: "#target-id",
  clearBtnSelector: "#clear-target",
});
const wsUrl = `ws://localhost:8000/ws/${client_id}`;
connectWS(wsUrl, handleIncoming);

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
