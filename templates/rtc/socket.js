let ws = null;

export function connectWS(url, onRawMessage) {
  ws = new WebSocket(url);
  ws.onmessage = (event) => onRawMessage(event.data); // trả raw string
  ws.onclose = () => console.log("❌ WS closed");
  ws.onerror = (err) => console.error("⚠️ WS error:", err);
  ws.onopen = () => console.log("✅ WS connected:", url);
}

export function sendWS(obj) {
  if (!ws) return;
  ws.send(JSON.stringify(obj)); // giống code gốc
}
