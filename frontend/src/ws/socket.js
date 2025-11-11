export let ws = null;

export function connectWS(url, onRawMessage) {
  const token = localStorage.getItem("access_token");
  ws = new WebSocket(url, [token]);
  ws.onmessage = (event) => {
    onRawMessage(event.data);
  }; // trả raw string
  ws.onclose = () => {
    console.log("❌ WS closed");
  };
  ws.onerror = (err) => console.error("⚠️ WS error:", err);
  ws.onopen = () => console.log("✅ WS connected:", url);
  return ws;
}

export function sendWS(obj) {
  if (!ws) return;
  ws.send(JSON.stringify(obj)); // giống code gốc
}
