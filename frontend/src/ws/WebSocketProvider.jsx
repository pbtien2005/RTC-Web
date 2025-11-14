// WebSocketProvider.jsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { connectWS, sendWS } from "./socket.js"; // <-- dùng util của bạn
import { handleIncoming } from "./dispatcher.js";
import { useVideoCall } from "../videoCall/VideoCallContext.jsx";

export const WebSocketContext = createContext(null);
export const useWS = () => useContext(WebSocketContext);

export default function WebSocketProvider({ wsUrl, children }) {
  const wsRef = useRef(null);
  const [readyState, setReadyState] = useState(WebSocket.CLOSED);

  // 2) Kết nối khi mount/đổi wsUrl, dọn dẹp khi unmount
  useEffect(() => {
    if (!wsUrl) return;

    const ws = connectWS(wsUrl, handleIncoming);
    wsRef.current = ws;

    // cập nhật trạng thái
    const syncState = () => setReadyState(ws.readyState);
    const onOpen = () => {
      syncState();
      console.log("✅ WS open");
    };
    const onClose = () => {
      syncState();

      console.log("❌ WS close");
    };
    const onError = () => {
      syncState();
      console.log("⚠️ WS error");
    };

    ws.addEventListener("open", onOpen);
    ws.addEventListener("close", onClose);
    ws.addEventListener("error", onError);

    // set ban đầu
    syncState();

    return () => {
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("close", onClose);
      ws.removeEventListener("error", onError);
      try {
        ws.close();
      } catch {}
      wsRef.current = null;
      setReadyState(WebSocket.CLOSED);
    };
  }, [wsUrl]);

  // 3) API đẩy message (dùng sendWS của bạn)
  const send = (obj) => sendWS(obj);

  const value = useMemo(
    () => ({
      send,
      readyState,
      connected: readyState === WebSocket.OPEN,
    }),
    [readyState]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
