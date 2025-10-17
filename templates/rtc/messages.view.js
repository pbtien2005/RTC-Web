import { tryParseJSON } from "./utils.js";

export function appendIncoming(rawString, clientId) {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");

  // Bản gốc dùng event.data.data → ở đây parse 1 lần cho an toàn
  const obj = tryParseJSON(rawString);
  const contentText = obj?.data;

  const isOwn = String(obj.id) === String(clientId);
  li.textContent = obj.data ?? "";
  if (isOwn) li.style.opacity = "0.7"; // tuỳ bạn style khác

  messages.appendChild(li);
}
