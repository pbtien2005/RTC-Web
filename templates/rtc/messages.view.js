import { tryParseJSON } from "./utils.js";
import { store } from "./store.js";

export function appendIncoming(rawString) {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");

  // Bản gốc dùng event.data.data → ở đây parse 1 lần cho an toàn
  const obj = tryParseJSON(rawString);
  if (obj == null) {
    li.textContent = rawString;
  } else {
    const contentText = obj?.data;
    const isOwn = String(obj.id) === String(store.getClientId());
    li.textContent = obj.data ?? "";
    if (isOwn) li.style.opacity = "0.7"; // tuỳ bạn style khác
  }

  messages.appendChild(li);
}
