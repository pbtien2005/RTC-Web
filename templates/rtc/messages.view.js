import { tryParseJSON } from "./utils.js";
import { store } from "./store.js";

export function appendIncoming(rawString) {
  const messages = document.getElementById("messages");
  const li = document.createElement("li");
  const obj = tryParseJSON(rawString);
  if (obj == null) {
    console.log("alo");
    li.textContent = rawString;
  } else {
    const contentText = obj?.data;
    const isOwn = String(obj.id) === String(store.getClientId());
    li.textContent = obj.data ?? "";
    if (isOwn) li.style.opacity = "0.7";
  }
  messages.appendChild(li);
}
